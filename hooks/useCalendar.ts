'use client'

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import type { EventInput, EventClickArg, EventDropArg } from '@fullcalendar/core';
import { Draggable, type DateClickArg, type DropArg } from '@fullcalendar/interaction';
import { EventType } from '@/types/event.types';


// Helper function to format API data into FullCalendar's event format
const formatEventForCalendar = (apiEvent: EventType): EventInput => ({
  id: apiEvent.id,
  title: apiEvent.name,
  start: apiEvent.startTime,
  end: apiEvent.endTime,
  className: 'bg-primary', // Default class, can be customized
  extendedProps: apiEvent, // Store the original API object for easy access
});

export const useCalendar = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [eventData, setEventData] = useState<Partial<EventType> | null>(null);
  const [dateInfo, setDateInfo] = useState<DateClickArg | null>(null);

  // --- API DATA FETCHING ---
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events from the server.');
      }
      const result = await response.json();
      
      const formattedEvents = (result.data || []).map(formatEventForCalendar);
      setEvents(formattedEvents);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  // Effect for making side panel events draggable
  useEffect(() => {
    const draggableEl = document.getElementById('external-events');
    if (draggableEl) {
      new Draggable(draggableEl, {
        itemSelector: '.external-event',
      });
    }
  }, []);

  // --- MODAL & EVENT HANDLERS ---

  const onCloseModal = () => {
    setShow(false);
    setEventData(null);
    setDateInfo(null);
    setIsEditable(false);
  };

  const createNewEvent = () => {
    setIsEditable(false);
    setEventData({}); // Start with an empty object for a new event
    setShow(true);
  };
  
  const onDateClick = (arg: DateClickArg) => {
    setIsEditable(false);
    setEventData({ startTime: arg.dateStr, endTime: arg.dateStr });
    setDateInfo(arg);
    setShow(true);
  };

  const onEventClick = (arg: EventClickArg) => {
    setIsEditable(true);
    const clickedEvent = events.find(e => e.id === arg.event.id);
    if (clickedEvent) {
        setEventData(clickedEvent.extendedProps as EventType);
    }
    setShow(true);
  };
  
  // --- API-DRIVEN CRUD OPERATIONS ---

  const onAddEvent = async (data: Partial<EventType>) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Failed to create the event.');
      }
      toast.success('Event created successfully!');
      fetchEvents();
      onCloseModal();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const onUpdateEvent = async (data: Partial<EventType>) => {
    if (!data.id) return;
    try {
      const response = await fetch(`/api/events/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Failed to update the event.');
      }
      toast.success('Event updated successfully!');
      fetchEvents();
      onCloseModal();
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  const onRemoveEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
         const errorResult = await response.json().catch(() => ({}));
         throw new Error(errorResult.error || 'Failed to delete the event.');
      }
      toast.success('Event deleted successfully!');
      fetchEvents();
      onCloseModal();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const onEventDrop = async (arg: EventDropArg) => { 
    const { event } = arg;
    const updatedEvent = {
        startTime: event.startStr,
        endTime: event.endStr || event.startStr,
    };

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        throw new Error('Failed to update event time.');
      }
      toast.success('Event time updated!');
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message);
      arg.revert();
    }
  };

  const onDrop = (dropInfo: DropArg) => {
    toast(`'${dropInfo.draggedEl.innerText}' was dropped.`);
    setIsEditable(false);
    setEventData({ startTime: dropInfo.dateStr, endTime: dropInfo.dateStr });
    setDateInfo(null);
    setShow(true);
  };

  return {
    loading,
    error,
    events,
    show,
    isEditable,
    eventData,
    onCloseModal,
    createNewEvent,
    onDateClick,
    onEventClick,
    onAddEvent,
    onUpdateEvent,
    onRemoveEvent,
    onEventDrop,
    onDrop,
  };
};

