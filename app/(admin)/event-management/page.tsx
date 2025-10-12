'use client'

import { useState, lazy, Suspense } from 'react';
import PageTitle from '@/components/PageTitle';
import { Card, CardBody, Col, Row, Spinner, Alert, Button, ButtonGroup, Modal } from 'react-bootstrap';
import { useCalendar } from '@/hooks/useCalendar';
import SidePanel from './components/SidePanel';
import Calendar from './components/Calendar';

import type { EventClickArg } from '@fullcalendar/core';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { EventType } from '@/types/event.types';
import AddEditEventModal from './components/CreateEventForm';

const EventDataTable = lazy(() => import('./components/EventDataTable'));

export default function Page() {
  const {
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
  } = useCalendar();

  const [view, setView] = useState('calendar');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventType | null>(null);

  const handleShowDeleteModal = (event: EventType) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setEventToDelete(null);
    setShowDeleteModal(false);
  };
  
  const confirmDelete = () => {
    if (eventToDelete) {
      onRemoveEvent(eventToDelete.id);
    }
    handleCloseDeleteModal();
  };

  // Extract the raw EventType objects from the calendar's extendedProps
  const rawEvents: EventType[] = events.map(e => e.extendedProps as EventType);

  if (loading) {
    return (
        <div className="d-flex vh-100 justify-content-center align-items-center">
            <Spinner animation="border" variant="primary" />
            <h4 className="ms-3">Loading Events...</h4>
        </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="mt-4"><strong>Error:</strong> {error}</Alert>;
  }

  return (
    <>
      <PageTitle title="Event Management" />
      <Row>
        <Col xs={12}>
          <Card>
            <CardBody>
              <Row>
                <Col lg={3}>
                  <SidePanel createNewEvent={createNewEvent} />
                </Col>
                <Col lg={9}>
                  <div className="d-flex justify-content-end mb-3">
                    <ButtonGroup>
                      <Button variant={view === 'calendar' ? 'primary' : 'outline-primary'} onClick={() => setView('calendar')}>
                        <IconifyIcon icon="mdi:calendar-month-outline" className="me-1" /> Calendar View
                      </Button>
                      <Button variant={view === 'table' ? 'primary' : 'outline-primary'} onClick={() => setView('table')}>
                        <IconifyIcon icon="mdi:table" className="me-1" /> Table View
                      </Button>
                    </ButtonGroup>
                  </div>

                  <Suspense fallback={<div className="text-center p-5"><Spinner/></div>}>
                    {view === 'calendar' ? (
                      <Calendar
                        events={events}
                        onDateClick={onDateClick}
                        onEventClick={onEventClick}
                        onEventDrop={onEventDrop}
                        onDrop={onDrop}
                      />
                    ) : (
                      <EventDataTable
                        events={rawEvents}
                        onEdit={(id) => {
                            const eventToEdit = events.find(e => e.id === id);
                            if (eventToEdit) {
                                onEventClick({ event: eventToEdit } as EventClickArg);
                            }
                        }}
                        onDelete={handleShowDeleteModal}
                      />
                    )}
                  </Suspense>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {show && (
         <AddEditEventModal
            show={show}
            isEditable={isEditable}
            eventData={eventData}
            onClose={onCloseModal}
            onAddEvent={onAddEvent}
            onUpdateEvent={onUpdateEvent}
            onRemoveEvent={async () => {
                onCloseModal(); // Close the edit modal first
                if (eventData) {
                    handleShowDeleteModal(eventData as EventType);
                }
            }}
        />
      )}

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the event: <strong>{eventToDelete?.name}</strong>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

