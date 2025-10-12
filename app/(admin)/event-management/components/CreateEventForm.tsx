'use client'

import React, { useState, useEffect } from 'react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Modal, Row, Col, Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { EventType } from '@/types/event.types';


type Masjid = { id: string; name: string };

// Helper to format UTC dates for datetime-local input
const toLocalISOString = (dateString?: string): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(0, 16);
    } catch (e) {
        return '';
    }
};

const eventValidationSchema = Yup.object().shape({
    masjidId: Yup.string().required('Masjid is required'),
    name: Yup.string().required('Event name is required'),
    description: Yup.string().required('Description is required'),
    startTime: Yup.date().required('Start time is required'),
    endTime: Yup.date().required('End time is required').min(Yup.ref('startTime'), 'End time must be after start time'),
    maxParticipants: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').integer('Must be an integer'),
    livestreamLink: Yup.string().url('Must be a valid URL').nullable(),
});

type AddEditEventModalProps = {
    show: boolean;
    isEditable: boolean;
    eventData: Partial<EventType> | null;
    onClose: () => void;
    onAddEvent: (data: Partial<EventType>) => Promise<void>;
    onUpdateEvent: (data: Partial<EventType>) => Promise<void>;
    onRemoveEvent: () => Promise<void>;
};

export default function AddEditEventModal({ show, isEditable, eventData, onClose, onAddEvent, onUpdateEvent, onRemoveEvent }: AddEditEventModalProps) {
    const [masjids, setMasjids] = useState<Masjid[]>([]);
    const [loadingMasjids, setLoadingMasjids] = useState(false);

    useEffect(() => {
        if (show) {
            setLoadingMasjids(true);
            fetch('/api/masjids') // Switched to the correct endpoint for listing masjids
                .then(res => res.json())
                .then(data => setMasjids(data.data || []))
                .catch(() => toast.error('Failed to load masjids.'))
                .finally(() => setLoadingMasjids(false));
        }
    }, [show]);

    const initialValues = {
        masjidId: eventData?.masjidId || '',
        name: eventData?.name || '',
        description: eventData?.description || '',
        startTime: toLocalISOString(eventData?.startTime),
        endTime: toLocalISOString(eventData?.endTime),
        requiresRsvp: eventData?.requiresRsvp ?? true,
        maxParticipants: eventData?.maxParticipants ?? 100,
        livestreamLink: eventData?.livestreamLink || '',
    };

    const handleSubmit = (values: any) => {
        const payload = {
            id: eventData?.id,
            ...values,
            startTime: new Date(values.startTime).toISOString(),
            endTime: new Date(values.endTime).toISOString(),
        };

        if (isEditable) {
            onUpdateEvent(payload);
        } else {
            onAddEvent(payload);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{isEditable ? 'Edit Event' : 'Add New Event'}</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={initialValues}
                validationSchema={eventValidationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting }) => (
                    <FormikForm>
                        <Modal.Body>
                            {/* --- LAYOUT REFACTORED FOR BETTER APPEARANCE --- */}
                            <Row>
                                <Col md={12} className="mb-3">
                                    <Form.Label htmlFor="masjidId">Masjid</Form.Label>
                                    <Field as={Form.Select} id="masjidId" name="masjidId" disabled={loadingMasjids || isEditable}>
                                        <option value="">{loadingMasjids ? 'Loading...' : 'Select a Masjid'}</option>
                                        {masjids.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </Field>
                                    <ErrorMessage name="masjidId" component={Form.Text} className="text-danger" />
                                </Col>

                                <Col md={12} className="mb-3">
                                    <Form.Label htmlFor="name">Event Name</Form.Label>
                                    <Field as={Form.Control} id="name" name="name" placeholder="e.g., Grand Recitation" />
                                    <ErrorMessage name="name" component={Form.Text} className="text-danger" />
                                </Col>

                                <Col md={12} className="mb-3">
                                    <Form.Label htmlFor="description">Description</Form.Label>
                                    <Field as="textarea" className="form-control" id="description" name="description" rows={3} placeholder="Enter a brief description..."/>
                                    <ErrorMessage name="description" component={Form.Text} className="text-danger" />
                                </Col>

                                <Col md={6} className="mb-3">
                                    <Form.Label htmlFor="startTime">Start Time</Form.Label>
                                    <Field as={Form.Control} type="datetime-local" id="startTime" name="startTime" />
                                    <ErrorMessage name="startTime" component={Form.Text} className="text-danger" />
                                </Col>

                                <Col md={6} className="mb-3">
                                    <Form.Label htmlFor="endTime">End Time</Form.Label>
                                    <Field as={Form.Control} type="datetime-local" id="endTime" name="endTime" />
                                    <ErrorMessage name="endTime" component={Form.Text} className="text-danger" />
                                </Col>

                                <Col md={6} className="mb-3">
                                    <Form.Label htmlFor="maxParticipants">Max Participants</Form.Label>
                                    <Field as={Form.Control} type="number" id="maxParticipants" name="maxParticipants" placeholder="e.g., 100" />
                                    <ErrorMessage name="maxParticipants" component={Form.Text} className="text-danger" />
                                </Col>

                                <Col md={6} className="mb-3">
                                    <Form.Label htmlFor="livestreamLink">Livestream Link</Form.Label>
                                    <Field as={Form.Control} type="url" id="livestreamLink" name="livestreamLink" placeholder="https://" />
                                    <ErrorMessage name="livestreamLink" component={Form.Text} className="text-danger" />
                                </Col>
                                
                                <Col md={12} className="mt-2">
                                     <Field as={Form.Check} type="checkbox" name="requiresRsvp" id="requiresRsvp" label="Requires RSVP" />
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            {isEditable && (
                                <Button variant="danger" onClick={onRemoveEvent} disabled={isSubmitting} className="me-auto">
                                    Delete
                                </Button>
                            )}
                            <Button variant="light" onClick={onClose}>Close</Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                {isSubmitting ? <Spinner size="sm" /> : (isEditable ? 'Save Changes' : 'Create Event')}
                            </Button>
                        </Modal.Footer>
                    </FormikForm>
                )}
            </Formik>
        </Modal>
    );
}

