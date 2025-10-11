'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Modal, Row, Col, Form, Spinner, Alert, Table, ButtonGroup } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import type { Preference } from '@/types/preference.type';
import type { AdhanFile } from '@/types/adhan.type';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// --- Reusable Add Preference Modal (Now with full settings) ---
const AddPreferenceModal = ({ show, onHide, onSuccess, allAdhans }: { show: boolean, onHide: () => void, onSuccess: () => void, allAdhans: AdhanFile[] }) => {
    
    // --- 1. Expanded validation schema for all new fields ---
    const preferenceValidationSchema = Yup.object().shape({
        adhan_file_id: Yup.string().required('Adhan sound is required.'),
        name: Yup.string().required('A name for this setting is required.'),
        method: Yup.string().required('Calculation method is required.'),
        asr_method: Yup.string().required('Asr method is required.'),
        high_latitude_rule: Yup.string().required('High latitude rule is required.'),
        adjustments: Yup.object().shape({
            fajr: Yup.number().required(),
            dhuhr: Yup.number().required(),
            asr: Yup.number().required(),
            maghrib: Yup.number().required(),
            isha: Yup.number().required(),
        })
    });

    // --- 2. Expanded initial values for the form ---
    const initialValues = {
        adhan_file_id: '',
        name: 'My Personal Settings',
        method: 'MUSLIM_WORLD_LEAGUE',
        asr_method: 'SHAFI_HANBALI_MALIKI',
        high_latitude_rule: 'MIDDLE_OF_THE_NIGHT',
        adjustments: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }
    };

    const handleSubmit = async (values: typeof initialValues) => {
        try {
            // --- 3. The payload is now built directly from the form values ---
            const payload = {
                adhan_file_id: values.adhan_file_id,
                prayer_times_configuration: {
                    name: values.name,
                    method: values.method,
                    asr_method: values.asr_method,
                    high_latitude_rule: values.high_latitude_rule,
                    adjustments: values.adjustments
                }
            };

            const response = await fetch('/api/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                 const errorResult = await response.json();
                 throw new Error(errorResult.message || 'Failed to add new preference.');
            }
            toast.success('New preference saved!');
            onSuccess();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Add New Prayer Time Preference</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={initialValues}
                validationSchema={preferenceValidationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <FormikForm>
                        <Modal.Body>
                            {/* --- 4. Expanded Form with All Fields --- */}
                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Label htmlFor="name">Preference Name</Form.Label>
                                    <Field as={Form.Control} id="name" name="name" />
                                    <ErrorMessage name="name" component={Form.Text} className="text-danger" />
                                </Col>
                                <Col md={6} className="mb-3">
                                    <Form.Label htmlFor="adhan_file_id">Adhan Sound</Form.Label>
                                    <Field as={Form.Select} id="adhan_file_id" name="adhan_file_id">
                                        <option value="">Choose a sound...</option>
                                        {allAdhans.map(adhan => <option key={adhan.id} value={adhan.id}>{adhan.name}</option>)}
                                    </Field>
                                    <ErrorMessage name="adhan_file_id" component={Form.Text} className="text-danger" />
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label htmlFor="method">Calculation Method</Form.Label>
                                    <Field as={Form.Select} id="method" name="method">
                                        <option value="MUSLIM_WORLD_LEAGUE">Muslim World League</option>
                                        <option value="EGYPTIAN">Egyptian</option>
                                        <option value="KARACHI">Karachi</option>
                                        <option value="MAKKAH">Makkah</option>
                                    </Field>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label htmlFor="asr_method">Asr Method</Form.Label>
                                    <Field as={Form.Select} id="asr_method" name="asr_method">
                                        <option value="SHAFI_HANBALI_MALIKI">Standard</option>
                                        <option value="HANAFI">Hanafi</option>
                                    </Field>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label htmlFor="high_latitude_rule">High Latitude Rule</Form.Label>
                                    <Field as={Form.Select} id="high_latitude_rule" name="high_latitude_rule">
                                        <option value="MIDDLE_OF_THE_NIGHT">Middle of the Night</option>
                                        <option value="SEVENTH_OF_THE_NIGHT">Seventh of the Night</option>
                                        <option value="TWILIGHT_ANGLE">Twilight Angle</option>
                                    </Field>
                                </Col>
                            </Row>
                            <hr/>
                            <h5 className="mb-3">Prayer Time Adjustments (in minutes)</h5>
                             <Row>
                                <Col className="mb-2">
                                    <Form.Label htmlFor="adjustments.fajr">Fajr</Form.Label>
                                    <Field as={Form.Control} type="number" name="adjustments.fajr" />
                                </Col>
                                <Col className="mb-2">
                                    <Form.Label htmlFor="adjustments.dhuhr">Dhuhr</Form.Label>
                                    <Field as={Form.Control} type="number" name="adjustments.dhuhr" />
                                </Col>
                                <Col className="mb-2">
                                    <Form.Label htmlFor="adjustments.asr">Asr</Form.Label>
                                    <Field as={Form.Control} type="number" name="adjustments.asr" />
                                </Col>
                                <Col className="mb-2">
                                    <Form.Label htmlFor="adjustments.maghrib">Maghrib</Form.Label>
                                    <Field as={Form.Control} type="number" name="adjustments.maghrib" />
                                </Col>
                                <Col className="mb-2">
                                    <Form.Label htmlFor="adjustments.isha">Isha</Form.Label>
                                    <Field as={Form.Control} type="number" name="adjustments.isha" />
                                </Col>
                             </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="light" onClick={onHide}>Cancel</Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                {isSubmitting ? <Spinner size="sm" /> : 'Add Preference'}
                            </Button>
                        </Modal.Footer>
                    </FormikForm>
                )}
            </Formik>
        </Modal>
    );
};


// --- Main Preference Manager Modal (No changes needed below this line) ---
type PreferenceManagerModalProps = {
    show: boolean;
    onHide: () => void;
    onSuccess: () => void;
};

export default function PreferenceManagerModal({ show, onHide, onSuccess }: PreferenceManagerModalProps) {
    const [preferences, setPreferences] = useState<Preference[]>([]);
    const [activePreferenceId, setActivePreferenceId] = useState<string | null>(null);
    const [allAdhans, setAllAdhans] = useState<AdhanFile[]>([]);
    const [adhanMap, setAdhanMap] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Preference | null>(null);

    const fetchData = useCallback(async () => {
        if (show) {
            setLoading(true);
            setError(null);
            try {
                const [prefRes, adhansRes] = await Promise.all([
                    fetch('/api/preferences', { cache: 'no-store' }),
                    fetch('/api/adhan')
                ]);

                if (!prefRes.ok) throw new Error('Could not load preferences.');
                if (!adhansRes.ok) throw new Error('Could not load adhan sounds.');

                const prefResult = await prefRes.json();
                const adhansResult = await adhansRes.json();
                
                const prefs: Preference[] = prefResult.preferences || [];
                setPreferences(prefs);

                if (prefs.length > 0) {
                    const sortedPrefs = [...prefs].sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime());
                    setActivePreferenceId(sortedPrefs[0].id);
                } else {
                    setActivePreferenceId(null);
                }
                
                const fetchedAdhans: AdhanFile[] = adhansResult.data?.adhanFiles || [];
                setAllAdhans(fetchedAdhans);
                setAdhanMap(new Map(fetchedAdhans.map(a => [a.id, a.name])));

            } catch (err: any) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        }
    }, [show]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSetActive = async (preferenceToActivate: Preference) => {
        try {
            const response = await fetch(`/api/preferences/${preferenceToActivate.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adhan_file_id: preferenceToActivate.adhanFileId }),
            });
            if (!response.ok) throw new Error('Failed to set active preference.');
            toast.success('Default preference updated!');
            fetchData();
            onSuccess();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            const response = await fetch(`/api/preferences/${itemToDelete.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete preference.');
            toast.success('Preference removed.');
            setShowDeleteConfirm(false);
            setItemToDelete(null);
            fetchData();
            onSuccess();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const openDeleteConfirm = (preference: Preference) => {
        setItemToDelete(preference);
        setShowDeleteConfirm(true);
    };

    return (
        <>
            <Modal show={show} onHide={onHide} centered size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Manage Default Preferences</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <div className="text-center p-5"><Spinner /></div>
                    ) : error ? (
                        <Alert variant="danger">{error}</Alert>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <p className="text-muted mb-0">
                                    Manage your saved preferences. The active one (marked with a star) will be used by default.
                                </p>
                                <Button variant="success" onClick={() => setShowAddModal(true)}>
                                    <IconifyIcon icon="ic:baseline-add" /> Add New Preference
                                </Button>
                            </div>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th style={{width: '5%'}}>Active</th>
                                        <th>Adhan Sound Name</th>
                                        <th style={{width: '20%'}}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preferences.length > 0 ? preferences.map(pref => (
                                        <tr key={pref.id}>
                                            <td className="text-center">
                                                {pref.id === activePreferenceId && <IconifyIcon icon="ri-star-fill" className="text-warning fs-5"/>}
                                            </td>
                                            <td>{adhanMap.get(pref.adhanFileId) || 'Unknown Adhan Sound'}</td>
                                            <td>
                                                <ButtonGroup size="sm">
                                                    <Button 
                                                        variant="outline-primary" 
                                                        disabled={pref.id === activePreferenceId}
                                                        onClick={() => handleSetActive(pref)}
                                                    >
                                                        Set Active
                                                    </Button>
                                                    <Button variant="outline-danger" onClick={() => openDeleteConfirm(pref)}>
                                                        Delete
                                                    </Button>
                                                </ButtonGroup>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="text-center text-muted">No preferences saved. Click "Add New" to start.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
            
            <AddPreferenceModal 
                show={showAddModal} 
                onHide={() => setShowAddModal(false)}
                onSuccess={() => { setShowAddModal(false); fetchData(); onSuccess(); }}
                allAdhans={allAdhans}
            />
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered size="sm">
                <Modal.Header closeButton>
                    <Modal.Title>Confirm</Modal.Title>
                </Modal.Header>
                <Modal.Body>Delete this preference?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

