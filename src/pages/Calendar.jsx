import { useMemo, useState } from 'react';

import { Button } from '@mui/material';

import { calendarEvents } from '../utils/events';
import '../styling/Calendar.css';

const viewOptions = ['day', 'week', 'month'];

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
    .sort((leftEvent, rightEvent) => leftEvent.startTime.localeCompare(rightEvent.startTime));

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

const Calendar = () => {
  const [activeView, setActiveView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const selectedDateEvents = useMemo(
    () => getEventsForDate(selectedDate),
    [selectedDate],
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
            <article className="calendar-event-card" key={`${eventItem.date}-${eventItem.title}`}>
              <span className="calendar-event-color" style={{ backgroundColor: eventItem.color }} />
              <div>
                <h3>{eventItem.title}</h3>
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
              key={toDateKey(weekDate)}
            >
              <div className="calendar-day-column-header">
                <span>{weekdayLabels[weekDate.getDay()]}</span>
                <strong>{formatShortDate(weekDate)}</strong>
              </div>

              <div className="calendar-day-column-events">
                {dayEvents.length > 0 ? dayEvents.map((eventItem) => (
                  <div className="calendar-mini-event" key={`${eventItem.date}-${eventItem.title}`}>
                    <span style={{ backgroundColor: eventItem.color }} />
                    <div>
                      <strong>{eventItem.title}</strong>
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
            <button
              type="button"
              className={`calendar-month-cell ${isCurrentMonth ? '' : 'is-faded'} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => setSelectedDate(monthDate)}
              key={toDateKey(monthDate)}
            >
              <div className="calendar-month-cell-top">
                <strong>{monthDate.getDate()}</strong>
              </div>
              <div className="calendar-month-events">
                {dayEvents.slice(0, 3).map((eventItem) => (
                  <div className="calendar-month-event" key={`${eventItem.date}-${eventItem.title}`}>
                    <span style={{ backgroundColor: eventItem.color }} />
                    <p>{eventItem.title}</p>
                  </div>
                ))}
                {dayEvents.length > 3 ? <p className="calendar-more">+{dayEvents.length - 3} more</p> : null}
              </div>
            </button>
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
    </section>
  );
};

export default Calendar;