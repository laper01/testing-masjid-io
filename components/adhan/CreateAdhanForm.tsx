'use client'

import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Button, Col, Form, Row, Spinner, Modal } from 'react-bootstrap'
import type { Masjid } from '@/types/adhan.type'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

// Validation schema remains the same
const adhanValidationSchema = Yup.object().shape({
    masjid_id: Yup.string().required('Please select a masjid.'),
    name: Yup.string().required('Adhan name is required.'),
    adhan_file: Yup.mixed()
        .required('An audio file is required.')
        .test('fileType', 'Unsupported format.', (value: any) => value && value.type.startsWith('audio/')),
});

// Define props for the modal
type CreateAdhanModalProps = {
    show: boolean;
    onHide: () => void;
    onSuccess: () => void;
};

export default function CreateAdhanModal({ show, onHide, onSuccess }: CreateAdhanModalProps) {
    const [masjids, setMasjids] = useState<Masjid[]>([]);
    const [loadingMasjids, setLoadingMasjids] = useState(true);

    useEffect(() => {
        // Only fetch masjids if the modal is shown to save resources
        if (show) {
            setLoadingMasjids(true);
            const fetchMasjids = async () => {
                try {
                    // This fetch call needs to go to a route that lists all masjids
                    const response = await fetch('/api/masjids'); 
                    if (!response.ok) throw new Error('Failed to fetch masjids');
                    const result = await response.json();

                    // --- THE FIX IS HERE ---
                    // The masjid list is in `result.data`, not `result.data.masjids`
                    setMasjids(result.data || []);
                    
                } catch (error) {
                    toast.error('Could not load the list of masjids.');
                } finally {
                    setLoadingMasjids(false);
                }
            };
            fetchMasjids();
        }
    }, [show]);

    const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
        const formData = new FormData();
        formData.append('masjid_id', values.masjid_id);
        formData.append('name', values.name);
        formData.append('adhan_file', values.adhan_file);

        try {
            const response = await fetch('/api/adhan', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to upload adhan file.');
            }

            toast.success('Adhan sound uploaded successfully!');
            resetForm();
            onSuccess(); // Call the success handler passed in props
        } catch (error: any) {
            toast.error(error.message || 'An unexpected error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Add New Adhan Sound</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={{ masjid_id: '', name: '', adhan_file: null }}
                    validationSchema={adhanValidationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, setFieldValue }) => (
                        <FormikForm>
                            <Row>
                                <Col md={12} className="mb-3">
                                    <Form.Label htmlFor="masjid_id">Masjid</Form.Label>
                                    <Field as={Form.Select} id="masjid_id" name="masjid_id" disabled={loadingMasjids}>
                                        <option value="">{loadingMasjids ? 'Loading...' : 'Select a Masjid'}</option>
                                        {masjids.map((masjid) => (
                                            <option key={masjid.id} value={masjid.id}>{masjid.name}</option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="masjid_id" component={Form.Text} className="text-danger" />
                                </Col>
                                <Col md={12} className="mb-3">
                                    <Form.Label htmlFor="name">Adhan Name</Form.Label>
                                    <Field as={Form.Control} type="text" id="name" name="name" placeholder="e.g., Adhan Subuh" />
                                    <ErrorMessage name="name" component={Form.Text} className="text-danger" />
                                </Col>
                                <Col md={12} className="mb-3">
                                    <Form.Label htmlFor="adhan_file">Adhan Audio File</Form.Label>
                                    <Form.Control
                                        type="file"
                                        id="adhan_file" name="adhan_file" accept="audio/*"
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            setFieldValue('adhan_file', event.currentTarget.files ? event.currentTarget.files[0] : null);
                                        }}
                                    />
                                    <ErrorMessage name="adhan_file" component={Form.Text} className="text-danger" />
                                </Col>
                            </Row>
                            <div className="mt-3 d-flex justify-content-end">
                                <Button variant="secondary" onClick={onHide} className="me-2">Cancel</Button>
                                <Button type="submit" disabled={isSubmitting} variant="primary">
                                    {isSubmitting ? <Spinner as="span" size="sm" /> : 'Upload Adhan'}
                                </Button>
                            </div>
                        </FormikForm>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
}
