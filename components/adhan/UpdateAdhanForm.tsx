'use client'

import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Button, Col, Form, Row, Spinner, Alert, Modal } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

const adhanUpdateSchema = Yup.object().shape({
    name: Yup.string().required('Adhan name is required.'),
    adhan_file: Yup.mixed().nullable()
        .test('fileType', 'Unsupported format.', (value: any) => !value || value.type.startsWith('audio/')),
});

type UpdateAdhanModalProps = {
    show: boolean;
    onHide: () => void;
    onSuccess: () => void;
    adhanId: string | null;
};

export default function UpdateAdhanModal({ show, onHide, onSuccess, adhanId }: UpdateAdhanModalProps) {
    const [initialValues, setInitialValues] = useState({ name: '', adhan_file: null });
    const [currentAudioUrl, setCurrentAudioUrl] = useState('');
    const [masjidName, setMasjidName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (show && adhanId) {
            setLoading(true);
            setError(null);
            const fetchAdhanData = async () => {
                try {
                    const adhanRes = await fetch(`/api/adhan/${adhanId}`);
                    if (!adhanRes.ok) throw new Error('Failed to fetch Adhan details.');

                    // --- THE FIX IS HERE ---
                    const adhanResult = await adhanRes.json();
                    // We need to get the actual adhan object from the `data` property
                    const adhanData = adhanResult.data;

                    if (!adhanData || !adhanData.masjidId) {
                        throw new Error('Adhan data is missing or invalid.');
                    }

                    setInitialValues({ name: adhanData.name, adhan_file: null });
                    setCurrentAudioUrl(adhanData.url);

                    // Now this fetch will have the correct masjidId
                    const masjidRes = await fetch(`/api/masjids/${adhanData.masjidId}`);
                    if (!masjidRes.ok) throw new Error('Failed to fetch masjid details.');
                    const masjidData = await masjidRes.json();
                    setMasjidName(masjidData.name);

                } catch (err: any) {
                    setError(err.message);
                    toast.error(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchAdhanData();
        }
    }, [show, adhanId]);

    const handleSubmit = async (values: any, { setSubmitting }: any) => {
        const formData = new FormData();
        formData.append('name', values.name);
        if (values.adhan_file) {
            formData.append('adhan_file', values.adhan_file);
        }

        try {
            const response = await fetch(`/api/adhan/${adhanId}`, {
                method: 'PATCH',
                body: formData,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to update adhan file.');

            toast.success('Adhan sound updated successfully!');
            onSuccess();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Edit Adhan Sound</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center p-5"><Spinner animation="border" /></div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : (
                    <Formik enableReinitialize initialValues={initialValues} validationSchema={adhanUpdateSchema} onSubmit={handleSubmit}>
                        {({ isSubmitting, setFieldValue }) => (
                            <FormikForm>
                                <Row>
                                    <Col md={12} className="mb-3">
                                        <Form.Label>Masjid</Form.Label>
                                        <Form.Control type="text" readOnly disabled value={masjidName} />
                                    </Col>
                                    <Col md={12} className="mb-3">
                                        <Form.Label htmlFor="name">Adhan Name</Form.Label>
                                        <Field as={Form.Control} type="text" id="name" name="name" />
                                        <ErrorMessage name="name" component={Form.Text} className="text-danger" />
                                    </Col>
                                    <Col md={12} className="mb-3">
                                        <Form.Label>Current Adhan Sound</Form.Label>
                                        <div>
                                            {/* Hanya tampilkan audio player jika URL-nya ada */}
                                            {currentAudioUrl ? (
                                                <audio
                                                    controls
                                                    src={`/api/audio-proxy?audioUrl=${encodeURIComponent(currentAudioUrl)}`}
                                                    style={{ width: '100%' }}
                                                />
                                            ) : (
                                                <p className="text-muted">No adhan sound selected.</p>
                                            )}
                                        </div>
                                    </Col>
                                    <Col md={12} className="mb-3">
                                        <Form.Label htmlFor="adhan_file">Upload New Audio File (Optional)</Form.Label>
                                        <Form.Control type="file" id="adhan_file" name="adhan_file" accept="audio/*"
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
                                        {isSubmitting ? <Spinner as="span" size="sm" /> : 'Save Changes'}
                                    </Button>
                                </div>
                            </FormikForm>
                        )}
                    </Formik>
                )}
            </Modal.Body>
        </Modal>
    );
}
