'use client';

import React, { useState, useEffect } from 'react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Modal, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import type { Preference } from '@/types/preference.type';
import type { AdhanFile } from '@/types/adhan.type';

// Validation for the preference form
const preferenceSchema = Yup.object().shape({
    adhan_file_id: Yup.string().required('Please select a default adhan sound.'),
});

type PreferenceManagerModalProps = {
    show: boolean;
    onHide: () => void;
    onSuccess: () => void; // Callback to refresh parent component
};

export default function PreferenceManagerModal({ show, onHide, onSuccess }: PreferenceManagerModalProps) {
    const [preference, setPreference] = useState<Preference | null>(null);
    const [allAdhans, setAllAdhans] = useState<AdhanFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch all necessary data when the modal is opened
        if (show) {
            setLoading(true);
            setError(null);
            const fetchData = async () => {
                try {
                    const [prefRes, adhansRes] = await Promise.all([
                        fetch('/api/preferences', { cache: 'no-store' }),
                        fetch('/api/adhan') // Fetch all adhans for the dropdown
                    ]);

                    if (!prefRes.ok) throw new Error('Could not load preferences.');
                    if (!adhansRes.ok) throw new Error('Could not load adhan sounds.');

                    const prefResult = await prefRes.json();
                    const adhansResult = await adhansRes.json();
                    
                    const prefs: Preference[] = prefResult.preferences || [];
                     if (prefs.length > 0) {
                        const sortedPrefs = [...prefs].sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime());
                        setPreference(sortedPrefs[0]);
                    } else {
                        setPreference(null);
                    }

                    setAllAdhans(adhansResult.data?.adhanFiles || []);
                } catch (err: any) {
                    setError(err.message);
                    toast.error(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [show]);

    const handleSubmit = async (values: { adhan_file_id: string }) => {
        try {
            const method = preference ? 'PATCH' : 'POST';
            const url = preference ? `/api/preferences/${preference.id}` : '/api/preferences';
            const body = method === 'POST'
                ? { preferences: { adhan_file_id: values.adhan_file_id } }
                : { adhan_file_id: values.adhan_file_id };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save preference.');
            }
            toast.success('Default preference saved successfully!');
            onSuccess(); // Trigger parent component to refresh and close
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDelete = async () => {
        if (!preference) {
            toast.error("No preference set to delete.");
            return;
        }
        try {
            const response = await fetch(`/api/preferences/${preference.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete preference.');
            
            toast.success('Default preference has been removed.');
            onSuccess();
        } catch (err: any) {
            toast.error(err.message);
        }
    };
    
    const initialValues = {
        adhan_file_id: preference?.adhanFileId || '',
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Manage Default Preferences</Modal.Title>
            </Modal.Header>
            {loading ? (
                <div className="text-center p-5"><Spinner /></div>
            ) : error ? (
                <Modal.Body><Alert variant="danger">{error}</Alert></Modal.Body>
            ) : (
                <Formik
                    initialValues={initialValues}
                    validationSchema={preferenceSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ isSubmitting }) => (
                        <FormikForm>
                            <Modal.Body>
                                <p className="text-muted">
                                    Select the default adhan sound that will be used for prayer time notifications.
                                </p>
                                <Row>
                                    <Col md={12} className="mb-3">
                                        <Form.Label htmlFor="adhan_file_id">Default Adhan Sound</Form.Label>
                                        <Field as={Form.Select} id="adhan_file_id" name="adhan_file_id">
                                            <option value="">Select a sound...</option>
                                            {allAdhans.map(adhan => (
                                                <option key={adhan.id} value={adhan.id}>{adhan.name}</option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="adhan_file_id" component={Form.Text} className="text-danger" />
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                {preference && (
                                    <Button variant="danger" onClick={handleDelete} disabled={isSubmitting} className="me-auto">
                                        Remove Default
                                    </Button>
                                )}
                                <Button variant="light" onClick={onHide}>Close</Button>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? <Spinner size="sm" /> : 'Save Preference'}
                                </Button>
                            </Modal.Footer>
                        </FormikForm>
                    )}
                </Formik>
            )}
        </Modal>
    );
}
