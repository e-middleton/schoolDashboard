import { useEffect, useMemo, useState } from 'react';

import { Button, Drawer, Box, Typography, TextField, Autocomplete, MenuItem } from '@mui/material';

import { calendarEvents, deleteCalendarEvent, makeEventDocId, saveCalendarEvent } from '../utils/events';
import '../styling/Calendar.css';

const viewOptions = ['day', 'week', 'month'];

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Generate 15-minute increment time options for dropdown add event form
const timeOptions = Array.from({ length: 96 }, (_, index) => {
  const totalMinutes = index * 15;
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes} ${period}`;
});

// Predefined color options for events
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

// Convert string time values to minutes
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

  // More flexible parsing for common time formats (e.g. 930, 10am, 14)
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

// Normalize time input to a consistent format (e.g. 9:00 AM) for display
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

// Convert date to YYYY-MM-DD format for consistent keying and comparison
const toDateKey = (date) =>
  [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

// Helper function to compare if two dates are the same day for display purposes
const isSameDay = (leftDate, rightDate) =>
  leftDate.getFullYear() === rightDate.getFullYear()
  && leftDate.getMonth() === rightDate.getMonth()
  && leftDate.getDate() === rightDate.getDate();

// Helper function to format dates in a long, human-friendly format (e.g. Monday, January 1, 2024)
const formatLongDate = (date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

// Helper function to format dates in a short format (e.g. Jan 1)
const formatShortDate = (date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);

// Get events for a specific date, sorted by start time and then name for consistent display purposes
const getEventsForDate = (date) =>
  calendarEvents
    .filter((event) => event.date === toDateKey(date))
    .sort((leftEvent, rightEvent) => {
      const timeDifference = parseTimeToMinutes(leftEvent.startTime) - parseTimeToMinutes(rightEvent.startTime);

      if (timeDifference !== 0) return timeDifference;

      return (leftEvent.eventName || leftEvent.title || '').localeCompare(rightEvent.eventName || rightEvent.title || '');
    });

// Build an array of dates for the week view based on a given date 
// (e.g. if date is Wednesday, return Sunday-Saturday of that week)
const buildWeekDates = (date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + index);
    return currentDate;
  });
};

// Build an array of dates for the month view based on a given date
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

// Helper function to get an empty event form data object, optionally pre-filling the date (e.g. when clicking "New Event" from a specific day)
const getEmptyFormData = (date = toDateKey(new Date())) => ({
  eventName: '',
  date,
  startTime: '9:00 AM',
  endTime: '10:00 AM',
  location: '',
  color: '#11578A',
  description: '',
});

// Main Calendar component
const Calendar = () => {
  const [activeView, setActiveView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventSource, setSelectedEventSource] = useState(null);
  const [selectedEventDocId, setSelectedEventDocId] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [createErrors, setCreateErrors] = useState({});
  const [formData, setFormData] = useState(() => getEmptyFormData());
  const [eventsVersion, setEventsVersion] = useState(0);

  // Reset the event creation/editing form to empty values after creating/editing/deleting 
  // an event or when opening the form for a new event
  const resetCreateForm = (date = toDateKey(selectedDate)) => {
    setFormData(getEmptyFormData(date));
    setCreateErrors({});
  };

  const getEventDocId = (eventItem) => eventItem.docId || makeEventDocId(eventItem);

  // Delete an event both from Firebase and the in-memory array, and
  // reset all relevant state to close the edit drawer and clear the selected event
  const deleteEvent = async (eventItem) => {
    const docId = selectedEventDocId || getEventDocId(eventItem);

    try {
      await deleteCalendarEvent(eventItem, docId);
      setEventsVersion((v) => v + 1);

      setSelectedEvent(null);
      setSelectedEventDocId(null);
      setSelectedEventSource(null);
      setIsCreating(false);
      setIsEditing(false);
      resetCreateForm();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete event', err);
      setCreateErrors({ form: 'Could not delete the event. Please try again.' });
    }
  };

  // Open the side panel for creating a new event, pre-filling the date based on the clicked date in the calendar
  const openCreateDrawerForDate = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setSelectedDayEvents(null);
    setSelectedEventSource(null);
    setSelectedEventDocId(null);
    setIsEditing(false);
    setIsCreating(true);
    resetCreateForm(toDateKey(date));
  };

  // Open side panel to view existing event
  // The form is pre-filled based on the clicked event's details for easier editing
  const openEditDrawer = (eventItem) => {
    const editDate = eventItem.date ? new Date(`${eventItem.date}T00:00:00`) : selectedDate;

    setSelectedDate(editDate);
    setSelectedDayEvents(null);
    setSelectedEventSource('direct');
    setSelectedEventDocId(getEventDocId(eventItem));
    setIsEditing(true);
    setIsCreating(true);
    setSelectedEvent(null);
    setFormData({
      eventName: eventItem.eventName || eventItem.title || '',
      date: eventItem.date || toDateKey(editDate),
      startTime: eventItem.startTime || '9:00 AM',
      endTime: eventItem.endTime || '10:00 AM',
      location: eventItem.location || '',
      color: eventItem.color || '#11578A',
      description: eventItem.description || '',
    });
    setCreateErrors({});
  };

  // Get events for the currently selected date
  // Also run this whenever eventsVersion changes (e.g. after deleting an event) to ensure the display is up to date
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

  const [searchQuery, setSearchQuery] = useState('');

  // Search events by event name, location, date and description
  // Results appear in a dropdown box
  const searchResults = useMemo(() => {
    const q = String(searchQuery || '').trim().toLowerCase();
    if (!q) return [];

    return calendarEvents
      .filter((ev) => {
        const name = (ev.eventName || ev.title || '').toLowerCase();
        const loc = (ev.location || '').toLowerCase();
        const desc = (ev.description || '').toLowerCase();
        const date = (ev.date || '').toLowerCase();

        return name.includes(q) || loc.includes(q) || desc.includes(q) || date.includes(q);
      })
      .sort((a, b) => {
        const dateCmp = (a.date || '').localeCompare(b.date || '');
        if (dateCmp !== 0) return dateCmp;
        return (parseTimeToMinutes(a.startTime) || 0) - (parseTimeToMinutes(b.startTime) || 0);
      });
  }, [searchQuery, eventsVersion]);

  // Highlight matching results
  const highlightedDates = useMemo(() => {
    if (!searchQuery) return new Set();
    return new Set(searchResults.map((ev) => ev.date));
  }, [searchQuery, searchResults]);

  const updateSelectedDate = (offsetDays) => {
    setSelectedDate((currentDate) => {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + offsetDays);
      return nextDate;
    });
  };

  // Update the date when clicking the next/previous buttons based on the current 
  // calendar setting (e.g. in week view, clicking next adds 7 days)
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

  // Keyboard shortcuts for switching calendar views and jumping to today 
  // "d" for day view, "w" for week view, "m" for month view, "t" for today
  useEffect(() => {
    const handleKeyDown = (event) => {

      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;

      const key = event.key.toLowerCase();
      const code = event.code;
      const shortcut = ({
        t: 'today',
        d: 'day',
        w: 'week',
        m: 'month',
        KeyT: 'today',
        KeyD: 'day',
        KeyW: 'week',
        KeyM: 'month',
      })[key] || ({
        KeyT: 'today',
        KeyD: 'day',
        KeyW: 'week',
        KeyM: 'month',
      })[code];

      if (!shortcut) return;

      const target = event.target;
      const isTypingField = target instanceof HTMLElement && (
        target.tagName === 'INPUT'
        || target.tagName === 'TEXTAREA'
        || target.tagName === 'SELECT'
        || target.isContentEditable
      );

      if (isTypingField) return;

      if (shortcut === 'day') {
        setActiveView('day');
        event.preventDefault();
        return;
      }

      if (shortcut === 'week') {
        setActiveView('week');
        event.preventDefault();
        return;
      }

      if (shortcut === 'month') {
        setActiveView('month');
        event.preventDefault();
        return;
      }

      jumpToToday();
      event.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Reset the selected event and close the side panel when switching between calendar views to avoid confusion
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

  // Button to open side panel for viewing/creating new events
  const renderNewEventButton = () => (
    <Button
      variant="contained"
      onClick={() => {
        setIsCreating(true);
        setSelectedEvent(null);
        setSelectedDayEvents(null);
        setSelectedEventSource(null);
        resetCreateForm();
      }}
      sx={{ backgroundColor: '#11578A', color: 'white', textTransform: 'none', ml: 1 }}
    >
      New Event
    </Button>
  );

  // Today/next/previous buttons + search bar
  const renderCalendarControls = () => (
    <>
      <div className="calendar-actions">
        <div className="calendar-search-wrap">
          <TextField
            size="small"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 220, mr: 1 }}
            inputProps={{ 'aria-label': 'Search events' }}
          />

          {searchQuery ? (
            <div className="calendar-search-dropdown">
              {searchResults.length === 0 ? (
                <div className="calendar-search-empty">No results</div>
              ) : searchResults.map((ev) => (
                <div
                  key={`${ev.date}-${ev.eventName || ev.title}-${ev.startTime}`}
                  className="calendar-search-result"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedEventDocId(getEventDocId(ev));
                    setSelectedEvent(ev);
                    setSelectedEventSource('search');
                    setSearchQuery('');
                  }}
                >
                  <div>
                    <strong>{ev.eventName || ev.title}</strong>
                    <div style={{ fontSize: 12, color: '#666' }}>{ev.date} • {ev.startTime}</div>
                  </div>
                  <div style={{ color: ev.color, minWidth: 12, height: 12 }} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <Button
          variant="outlined"
          onClick={() => updateSelectedDateByView(-1)}
          sx={{ minWidth: 0, px: 1.5, borderColor: '#11578A', color: '#11578A', textTransform: 'none' }}
        >
          &lt;
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
          sx={{ minWidth: 0, px: 1.5, borderColor: '#11578A', color: '#11578A', textTransform: 'none' }}
        >
          &gt;
        </Button>
      </div>

      {/* dropdown moved into the search wrapper so it doesn't push layout */}
    </>
  );

  // Render the main calendar panel
  const renderDayContent = () => (
    <div className={`calendar-panel calendar-day-panel ${highlightedDates.has(toDateKey(selectedDate)) ? 'is-highlighted' : ''}`}>
      <div className="calendar-panel-header">
        <div className="calendar-panel-left">
          {renderViewSwitcher()}
          {renderNewEventButton()}
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
                setSelectedEventDocId(getEventDocId(eventItem));
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
          {renderNewEventButton()}
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
          const isHighlighted = highlightedDates.has(toDateKey(weekDate));

          return (
            <button
              type="button"
              className={`calendar-day-column ${isSelected ? 'is-selected' : ''} ${isHighlighted ? 'is-highlighted' : ''}`}
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
                      setSelectedEventDocId(getEventDocId(eventItem));
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
          {renderNewEventButton()}
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
          const isHighlighted = highlightedDates.has(toDateKey(monthDate));

          return (
            <div
              className={`calendar-month-cell ${isCurrentMonth ? '' : 'is-faded'} ${isSelected ? 'is-selected' : ''} ${isHighlighted ? 'is-highlighted' : ''}`}
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
                      setSelectedEventDocId(getEventDocId(eventItem));
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
          setSelectedEventDocId(null);
          setIsCreating(false);
          setIsEditing(false);
          resetCreateForm();
        }}
      >
          <Box sx={{ width: 380, p: 3 }}>
                    {isCreating ? (
                    <div>
                      <Typography variant="h5" component="div" gutterBottom>
                        {isEditing ? 'Edit Event' : 'Create Event'}
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

                            const savedEvent = {
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

                            const docId = isEditing && selectedEventDocId ? selectedEventDocId : makeEventDocId(savedEvent);

                            try {
                              await saveCalendarEvent(savedEvent, docId);
                              setEventsVersion((v) => v + 1);
                              setIsCreating(false);
                              setIsEditing(false);
                              setSelectedEventDocId(docId);
                              resetCreateForm();
                              setSelectedEventSource('direct');
                              setSelectedEvent({ ...savedEvent, docId });
                            } catch (err) {
                              // eslint-disable-next-line no-console
                              console.error('Failed to create event', err);
                              setCreateErrors({ form: 'Could not save the event. Please try again.' });
                            }
                          }}
                        >
                          {isEditing ? 'Update' : 'Save'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setIsCreating(false);
                            setIsEditing(false);
                            setSelectedEventDocId(null);
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
                      <Typography variant="h5" component="div" gutterBottom>
                        {selectedEvent.eventName || selectedEvent.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        {selectedEvent.date}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        {selectedEvent.startTime} to {selectedEvent.endTime}{selectedEvent.duration ? ` (${selectedEvent.duration})` : ''}
                      </Typography>
                      {selectedEvent.location ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                          <span style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: selectedEvent.color }} />
                          <Typography variant="body1">{selectedEvent.location}</Typography>
                        </Box>
                      ) : null}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1">Additional Details:</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{selectedEvent.description || ''}</Typography>
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
                        <Box sx={{ display: 'flex', gap: 1, mt: 4, flexWrap: 'wrap' }}>
                          <Button
                            variant="outlined"
                            onClick={() => openEditDrawer(selectedEvent)}
                            sx={{ textTransform: 'none' }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => deleteEvent(selectedEvent)}
                            sx={{ textTransform: 'none' }}
                          >
                            Delete
                          </Button>
                        </Box>
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Button variant="contained" onClick={() => setSelectedEvent(null)} sx={{ backgroundColor: '#11578A', textTransform: 'none' }}>
                            Close
                          </Button>
                        </Box>
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
                                setSelectedEventDocId(getEventDocId(eventItem));
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