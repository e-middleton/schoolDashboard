import { useMemo, useState } from 'react';

import { Button, Drawer, Box, Typography, TextField, Autocomplete, MenuItem } from '@mui/material';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase.js';

import { calendarEvents } from '../utils/events';
import '../styling/Calendar.css';

const viewOptions = ['day', 'week', 'month'];

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const timeOptions = Array.from({ length: 96 }, (_, index) => {
  const totalMinutes = index * 15;
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes} ${period}`;
});

const colorOptions = [
  { label: 'Blue', value: '#11578A' },
  { label: 'Red', value: '#CE2626' },
  { label: 'Green', value: '#4C7F4A' },
  { label: 'Purple', value: '#8A5CF6' },
  { label: 'Orange', value: '#E38B29' },
  { label: 'Teal', value: '#2B8A8A' },
  { label: 'Yellow', value: '#D9A441' },
  { label: 'Gray', value: '#6B7280' },
];

const parseTimeToMinutes = (timeValue) => {
  const s = String(timeValue || '').trim().toUpperCase();

  // hh:mm [AM|PM]
  let m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (m) {
    let hours = Number(m[1]);
    const minutes = Number(m[2]);
    const period = m[3];
    if (period) {
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    }
    return hours * 60 + minutes;
  }

  // hhmm or hhmmAM/PM (e.g. 930, 0930, 930pm)
  m = s.match(/^(\d{1,2})(\d{2})\s*(AM|PM)?$/i);
  if (m) {
    let hours = Number(m[1]);
    const minutes = Number(m[2]);
    const period = m[3];
    if (period) {
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    }
    return hours * 60 + minutes;
  }

  // H AM/PM (e.g. 10am)
  m = s.match(/^(\d{1,2})\s*(AM|PM)$/i);
  if (m) {
    let hours = Number(m[1]);
    const period = m[2];
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60;
  }

  // Hours only (e.g. 10 -> 10:00)
  m = s.match(/^(\d{1,2})$/);
  if (m) {
    const hours = Number(m[1]);
    if (hours >= 0 && hours < 24) return hours * 60;
  }

  return NaN;
};

const normalizeTimeLabel = (timeValue) => {
  const mins = parseTimeToMinutes(timeValue);
  if (Number.isNaN(mins)) return timeValue;
  const hh24 = Math.floor(mins / 60);
  const mm = mins % 60;
  const period = hh24 >= 12 ? 'PM' : 'AM';
  let hh12 = hh24 % 12;
  if (hh12 === 0) hh12 = 12;
  return `${hh12}:${String(mm).padStart(2, '0')} ${period}`;
};

const toDateKey = (date) =>
  [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

const isSameDay = (leftDate, rightDate) =>
  leftDate.getFullYear() === rightDate.getFullYear()
  && leftDate.getMonth() === rightDate.getMonth()
  && leftDate.getDate() === rightDate.getDate();

const formatLongDate = (date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

const formatShortDate = (date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);

const getEventsForDate = (date) =>
  calendarEvents
    .filter((event) => event.date === toDateKey(date))
    .sort((leftEvent, rightEvent) => {
      const timeDifference = parseTimeToMinutes(leftEvent.startTime) - parseTimeToMinutes(rightEvent.startTime);

      if (timeDifference !== 0) return timeDifference;

      return (leftEvent.eventName || leftEvent.title || '').localeCompare(rightEvent.eventName || rightEvent.title || '');
    });

const buildWeekDates = (date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + index);
    return currentDate;
  });
};

const buildMonthDates = (date) => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const startOfGrid = new Date(startOfMonth);
  startOfGrid.setDate(startOfMonth.getDate() - startOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const currentDate = new Date(startOfGrid);
    currentDate.setDate(startOfGrid.getDate() + index);
    return currentDate;
  });
};

const getEmptyFormData = (date = toDateKey(new Date())) => ({
  eventName: '',
  date,
  startTime: '9:00 AM',
  endTime: '10:00 AM',
  location: '',
  color: '#11578A',
  description: '',
});

const Calendar = () => {
  const [activeView, setActiveView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventSource, setSelectedEventSource] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState({});
  const [formData, setFormData] = useState(() => getEmptyFormData());
  const [eventsVersion, setEventsVersion] = useState(0);

  const resetCreateForm = (date = toDateKey(selectedDate)) => {
    setFormData(getEmptyFormData(date));
    setCreateErrors({});
  };

  const openCreateDrawerForDate = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setSelectedDayEvents(null);
    setSelectedEventSource(null);
    setIsCreating(true);
    resetCreateForm(toDateKey(date));
  };

  const selectedDateEvents = useMemo(
    () => getEventsForDate(selectedDate),
    [selectedDate, eventsVersion],
  );

  const weekDates = useMemo(
    () => buildWeekDates(selectedDate),
    [selectedDate],
  );

  const monthDates = useMemo(
    () => buildMonthDates(selectedDate),
    [selectedDate],
  );

  const updateSelectedDate = (offsetDays) => {
    setSelectedDate((currentDate) => {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + offsetDays);
      return nextDate;
    });
  };

  const updateSelectedDateByView = (direction) => {
    setSelectedDate((currentDate) => {
      const nextDate = new Date(currentDate);

      if (activeView === 'week') {
        nextDate.setDate(currentDate.getDate() + (7 * direction));
        return nextDate;
      }

      if (activeView === 'month') {
        nextDate.setMonth(currentDate.getMonth() + direction);
        return nextDate;
      }

      nextDate.setDate(currentDate.getDate() + direction);
      return nextDate;
    });
  };

  const jumpToToday = () => setSelectedDate(new Date());

  const renderViewSwitcher = () => (
    <div className="calendar-view-switcher" role="tablist" aria-label="Calendar view">
      {viewOptions.map((viewOption) => (
        <button
          key={viewOption}
          type="button"
          className={`calendar-view-button ${activeView === viewOption ? 'is-active' : ''}`}
          onClick={() => setActiveView(viewOption)}
        >
          {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
        </button>
      ))}
    </div>
  );

  const renderCalendarControls = () => (
    <div className="calendar-actions">
      <Button
        variant="contained"
        onClick={() => {
          setIsCreating(true);
          setSelectedEvent(null);
          setSelectedDayEvents(null);
          setSelectedEventSource(null);
          resetCreateForm();
        }}
        sx={{ backgroundColor: '#11578A', color: 'white', textTransform: 'none' }}
      >
        New Event
      </Button>
      <Button
        variant="outlined"
        onClick={() => updateSelectedDateByView(-1)}
        sx={{ borderColor: '#11578A', color: '#11578A', textTransform: 'none' }}
      >
        Previous
      </Button>
      <Button
        variant="outlined"
        onClick={jumpToToday}
        sx={{ borderColor: '#11578A', color: '#11578A', textTransform: 'none' }}
      >
        Today
      </Button>
      <Button
        variant="outlined"
        onClick={() => updateSelectedDateByView(1)}
        sx={{ borderColor: '#11578A', color: '#11578A', textTransform: 'none' }}
      >
        Next
      </Button>
    </div>
  );

  const renderDayContent = () => (
    <div className="calendar-panel calendar-day-panel">
      <div className="calendar-panel-header">
        <div className="calendar-panel-left">
          {renderViewSwitcher()}
        </div>
        <div className="calendar-panel-date">
          <h2>{formatLongDate(selectedDate)}</h2>
        </div>
        <div className="calendar-panel-right">
          {renderCalendarControls()}
        </div>
      </div>

      <div className="calendar-event-list">
          {selectedDateEvents.length > 0 ? (
          selectedDateEvents.map((eventItem) => (
            <article
              className="calendar-event-card"
              key={`${eventItem.date}-${eventItem.eventName || eventItem.title}`}
              onClick={() => {
                setSelectedDayEvents(null);
                setSelectedEventSource('direct');
                setSelectedEvent(eventItem);
              }}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            >
              <span className="calendar-event-color" style={{ backgroundColor: eventItem.color }} />
              <div>
                <h3>{eventItem.eventName || eventItem.title}</h3>
                <p>{eventItem.startTime} - {eventItem.endTime}</p>
                <p>{eventItem.location}</p>
              </div>
            </article>
          ))
        ) : (
          <p className="calendar-empty">No events scheduled for this day.</p>
        )}
      </div>
    </div>
  );

  const renderWeekContent = () => (
    <div className="calendar-panel">
      <div className="calendar-panel-header">
        <div className="calendar-panel-left">
          {renderViewSwitcher()}
        </div>
        <div className="calendar-panel-date">
          <h2>{formatLongDate(selectedDate)}</h2>
        </div>
        <div className="calendar-panel-right">
          {renderCalendarControls()}
        </div>
      </div>

      <div className="calendar-week-grid">
        {weekDates.map((weekDate) => {
          const dayEvents = getEventsForDate(weekDate);
          const isSelected = isSameDay(weekDate, selectedDate);

          return (
            <button
              type="button"
              className={`calendar-day-column ${isSelected ? 'is-selected' : ''}`}
              onClick={() => setSelectedDate(weekDate)}
              onDoubleClick={() => openCreateDrawerForDate(weekDate)}
              key={toDateKey(weekDate)}
            >
              <div className="calendar-day-column-header">
                <span>{weekdayLabels[weekDate.getDay()]}</span>
                <strong>{formatShortDate(weekDate)}</strong>
              </div>

              <div className="calendar-day-column-events">
                {dayEvents.length > 0 ? dayEvents.map((eventItem) => (
                  <div
                    className="calendar-mini-event"
                    key={`${eventItem.date}-${eventItem.eventName || eventItem.title}`}
                    onClick={() => {
                      setSelectedDayEvents(null);
                      setSelectedEventSource('direct');
                      setSelectedEvent(eventItem);
                    }}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                  >
                    <span style={{ backgroundColor: eventItem.color }} />
                    <div>
                      <strong>{eventItem.eventName || eventItem.title}</strong>
                      <p>{eventItem.startTime}</p>
                    </div>
                  </div>
                )) : <p className="calendar-empty small">No events</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderMonthContent = () => (
    <div className="calendar-panel">
      <div className="calendar-panel-header">
        <div className="calendar-panel-left">
          {renderViewSwitcher()}
        </div>
        <div className="calendar-panel-date">
          <h2>{formatLongDate(selectedDate)}</h2>
        </div>
        <div className="calendar-panel-right">
          {renderCalendarControls()}
        </div>
      </div>

      <div className="calendar-month-grid">
        {weekdayLabels.map((label) => (
          <div className="calendar-month-weekday" key={label}>{label}</div>
        ))}

        {monthDates.map((monthDate) => {
          const dayEvents = getEventsForDate(monthDate);
          const isCurrentMonth = monthDate.getMonth() === selectedDate.getMonth();
          const isSelected = isSameDay(monthDate, selectedDate);

          return (
            <div
              className={`calendar-month-cell ${isCurrentMonth ? '' : 'is-faded'} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => setSelectedDate(monthDate)}
              onDoubleClick={() => openCreateDrawerForDate(monthDate)}
              key={toDateKey(monthDate)}
              role="button"
              tabIndex={0}
            >
              <div className="calendar-month-cell-top">
                <strong>{monthDate.getDate()}</strong>
              </div>
              <div className="calendar-month-events">
                {dayEvents.slice(0, 3).map((eventItem) => (
                  <div
                    className="calendar-month-event"
                    key={`${eventItem.date}-${eventItem.eventName || eventItem.title}`}
                    onClick={() => {
                      setSelectedDayEvents(null);
                      setSelectedEventSource('direct');
                      setSelectedEvent(eventItem);
                    }}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                  >
                    <span style={{ backgroundColor: eventItem.color }} />
                    <div className="calendar-month-event-content">
                      <p className="calendar-month-event-title">{eventItem.eventName || eventItem.title}</p>
                      <p className="calendar-month-event-time">{eventItem.startTime}</p>
                    </div>
                  </div>
                ))}
                {dayEvents.length > 3 ? (
                  <button
                    type="button"
                    className="calendar-more"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedEventSource('summary');
                      setSelectedEvent(null);
                      setSelectedDayEvents(dayEvents);
                    }}
                  >
                    +{dayEvents.length - 3} more
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="calendar-page">
      <div className="calendar-shell">
        {activeView === 'day' ? renderDayContent() : null}
        {activeView === 'week' ? renderWeekContent() : null}
        {activeView === 'month' ? renderMonthContent() : null}
      </div>
      <Drawer
        anchor="right"
        open={Boolean(selectedEvent) || Boolean(selectedDayEvents) || isCreating}
        onClose={() => {
          setSelectedEvent(null);
          setSelectedDayEvents(null);
          setSelectedEventSource(null);
          setIsCreating(false);
          resetCreateForm();
        }}
      >
          <Box sx={{ width: 380, p: 3 }}>
                    {isCreating ? (
                    <div>
                      <Typography variant="h6" component="div" gutterBottom>
                        Create Event
                      </Typography>
                      <TextField
                        label="Event Name"
                        fullWidth
                        margin="normal"
                        value={formData.eventName}
                        onChange={(e) => {
                          setFormData({ ...formData, eventName: e.target.value });
                          setCreateErrors((errors) => ({ ...errors, eventName: undefined }));
                        }}
                        error={Boolean(createErrors.eventName)}
                        helperText={createErrors.eventName}
                      />
                      <TextField
                        label="Date"
                        type="date"
                        fullWidth
                        margin="normal"
                        value={formData.date}
                        onChange={(e) => {
                          setFormData({ ...formData, date: e.target.value });
                          setCreateErrors((errors) => ({ ...errors, date: undefined }));
                        }}
                        InputLabelProps={{ shrink: true }}
                        error={Boolean(createErrors.date)}
                        helperText={createErrors.date}
                      />
                      <Autocomplete
                        freeSolo
                        openOnFocus
                        selectOnFocus
                        clearOnBlur={false}
                        handleHomeEndKeys
                        options={timeOptions}
                        value={formData.startTime}
                        inputValue={formData.startTime}
                        onChange={(_, newValue) => {
                          setFormData({ ...formData, startTime: String(newValue || '') });
                          setCreateErrors((errors) => ({ ...errors, startTime: undefined, timeRange: undefined }));
                        }}
                        onInputChange={(_, newInputValue) => {
                          setFormData({ ...formData, startTime: newInputValue });
                          setCreateErrors((errors) => ({ ...errors, startTime: undefined, timeRange: undefined }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Start Time"
                            fullWidth
                            margin="normal"
                            error={Boolean(createErrors.startTime || createErrors.timeRange)}
                            helperText={createErrors.startTime || createErrors.timeRange}
                          />
                        )}
                      />
                      <Autocomplete
                        freeSolo
                        openOnFocus
                        selectOnFocus
                        clearOnBlur={false}
                        handleHomeEndKeys
                        options={timeOptions}
                        value={formData.endTime}
                        inputValue={formData.endTime}
                        onChange={(_, newValue) => {
                          setFormData({ ...formData, endTime: String(newValue || '') });
                          setCreateErrors((errors) => ({ ...errors, endTime: undefined, timeRange: undefined }));
                        }}
                        onInputChange={(_, newInputValue) => {
                          setFormData({ ...formData, endTime: newInputValue });
                          setCreateErrors((errors) => ({ ...errors, endTime: undefined, timeRange: undefined }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="End Time"
                            fullWidth
                            margin="normal"
                            error={Boolean(createErrors.endTime || createErrors.timeRange)}
                            helperText={createErrors.endTime || createErrors.timeRange}
                          />
                        )}
                      />
                      <TextField
                        label="Location (Optional)"
                        fullWidth
                        margin="normal"
                        value={formData.location}
                        onChange={(e) => {
                          setFormData({ ...formData, location: e.target.value });
                          setCreateErrors((errors) => ({ ...errors, location: undefined }));
                        }}
                        error={Boolean(createErrors.location)}
                        helperText={createErrors.location}
                      />
                      <TextField
                        select
                        label="Color"
                        fullWidth
                        margin="normal"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      >
                        {colorOptions.map((colorOption) => (
                          <MenuItem key={colorOption.value} value={colorOption.value}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: colorOption.value }} />
                              {colorOption.label}
                            </span>
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="Description (Optional)"
                        fullWidth
                        margin="normal"
                        multiline
                        minRows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          onClick={async () => {
                            const nextErrors = {};

                            const validateTime = (timeValue) => {
                              const trimmed = String(timeValue || '').trim();
                              if (!trimmed) return false;
                              const mins = parseTimeToMinutes(trimmed);
                              return !Number.isNaN(mins) && mins >= 0 && mins < 24 * 60;
                            };

                            if (!formData.eventName.trim()) nextErrors.eventName = 'Event name is required.';
                            if (!formData.date) nextErrors.date = 'Date is required.';
                            // Location is optional — do not add an error if empty
                            if (!validateTime(formData.startTime)) nextErrors.startTime = 'Enter a valid time.';
                            if (!validateTime(formData.endTime)) nextErrors.endTime = 'Enter a valid time.';

                            if (!nextErrors.startTime && !nextErrors.endTime) {
                              const startMinutes = parseTimeToMinutes(formData.startTime);
                              const endMinutes = parseTimeToMinutes(formData.endTime);
                              if (endMinutes <= startMinutes) {
                                nextErrors.timeRange = 'End time must be after start time.';
                              }
                            }

                            if (Object.keys(nextErrors).length > 0) {
                              setCreateErrors(nextErrors);
                              return;
                            }

                            const formatTime = (hhmm) => {
                              const normalized = normalizeTimeLabel(hhmm);
                              if (/\b(AM|PM)\b/i.test(normalized)) return normalized;
                              return normalizeTimeLabel(normalized);
                            };

                            const newEvent = {
                              eventName: formData.eventName,
                              date: formData.date,
                              startTime: formatTime(formData.startTime),
                              endTime: formatTime(formData.endTime),
                              duration: (() => {
                                const diff = parseTimeToMinutes(formData.endTime) - parseTimeToMinutes(formData.startTime);
                                const hrs = Math.floor(diff / 60);
                                const mins = diff % 60;
                                return `${hrs > 0 ? `${hrs}h${mins > 0 ? ' ' : ''}` : ''}${mins > 0 ? `${mins}m` : ''}`.trim();
                              })(),
                              location: formData.location,
                              color: formData.color,
                              description: formData.description,
                            };

                            const makeEventDocId = (eventItem) => `${eventItem.date}-${(eventItem.eventName || eventItem.title)}-${eventItem.startTime}`
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-+|-+$/g, '');

                            try {
                              await setDoc(doc(db, 'events', makeEventDocId(newEvent)), newEvent);
                              // update in-memory list and refresh
                              // eslint-disable-next-line no-use-before-define
                              import('../utils/events').then((mod) => {
                                if (mod.calendarEvents && Array.isArray(mod.calendarEvents)) {
                                  mod.calendarEvents.push(newEvent);
                                }
                              }).finally(() => {
                                setEventsVersion((v) => v + 1);
                              });
                              setIsCreating(false);
                              resetCreateForm();
                              setSelectedEventSource('direct');
                              setSelectedEvent(newEvent);
                            } catch (err) {
                              // eslint-disable-next-line no-console
                              console.error('Failed to create event', err);
                              setCreateErrors({ form: 'Could not save the event. Please try again.' });
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setIsCreating(false);
                            resetCreateForm();
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                      {createErrors.form ? (
                        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                          {createErrors.form}
                        </Typography>
                      ) : null}
                    </div>
                  ) : selectedEvent ? (
                    <div>
                      <Typography variant="h6" component="div" gutterBottom>
                        {selectedEvent.eventName || selectedEvent.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {selectedEvent.date}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {selectedEvent.startTime} to {selectedEvent.endTime}{selectedEvent.duration ? ` (${selectedEvent.duration})` : ''}
                      </Typography>
                      {selectedEvent.location ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                          <span style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: selectedEvent.color }} />
                          <Typography variant="body2">{selectedEvent.location}</Typography>
                        </Box>
                      ) : null}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Details</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{selectedEvent.description || ''}</Typography>
                      </Box>
                      <Box sx={{ mt: 3 }}>
                        {selectedEventSource === 'summary' ? (
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setSelectedEvent(null);
                              setSelectedEventSource('summary');
                            }}
                            sx={{ mr: 1 }}
                          >
                            Back
                          </Button>
                        ) : null}
                        <Button variant="outlined" onClick={() => setSelectedEvent(null)}>Close</Button>
                      </Box>
                      </div>
                    ) : selectedDayEvents ? (
                      <div>
                        <Typography variant="h6" component="div" gutterBottom>
                          More events on {formatLongDate(selectedDate)}
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 1.25, mt: 2 }}>
                          {selectedDayEvents.map((eventItem) => (
                            <Button
                              key={`${eventItem.date}-${eventItem.eventName || eventItem.title}`}
                              variant="outlined"
                              onClick={() => {
                                setSelectedEvent(eventItem);
                              }}
                              sx={{ justifyContent: 'flex-start', textTransform: 'none', borderColor: eventItem.color, color: '#1d1d1d' }}
                            >
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: eventItem.color }} />
                                <span>{eventItem.eventName || eventItem.title}</span>
                                <span style={{ color: '#666' }}>{eventItem.startTime}</span>
                              </span>
                            </Button>
                          ))}
                        </Box>
                        <Box sx={{ mt: 3 }}>
                          <Button variant="outlined" onClick={() => setSelectedDayEvents(null)}>Close</Button>
                        </Box>
                    </div>
                  ) : null}
                </Box>
              </Drawer>
    </section>
  );
};

export default Calendar;