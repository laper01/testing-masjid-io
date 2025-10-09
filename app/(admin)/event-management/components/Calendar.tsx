'use client'

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import type { CalendarProps } from '@/types/component-props';

const Calendar = ({ events, onDateClick, onEventClick }: CalendarProps) => {
  return (
    <div id="calendar">
      <FullCalendar
        initialView="dayGridMonth"
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin, bootstrapPlugin]}
        themeSystem="bootstrap"
        handleWindowResize={true}
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
          list: 'List',
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
        }}
        editable={true}
        selectable={true}
        events={events}
        dateClick={onDateClick}
        eventClick={onEventClick}
      />
    </div>
  );
};

export default Calendar;
