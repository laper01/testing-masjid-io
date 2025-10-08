'use client'

import React, { useState, useEffect } from 'react'
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Button, Card, Col, Form, Row, Spinner, Modal, Alert } from 'react-bootstrap'
import type { Masjid } from '@/types/adhan.type'


// Validation schema for updating the adhan
const adhanUpdateSchema = Yup.object().shape({
  file: Yup.mixed()
    .required('An audio file is required.')
    .test('fileType', 'Unsupported file format. Please upload an audio file.', (value: any) => {
        if (!value) return true;
        return value && value.type.startsWith('audio/');
    }),
})

// Props for the edit form, using adhanId
type UpdateAdhanFormProps = {
  adhanId: string;
};

// Main Component for Updating Adhan by Adhan ID
export default function UpdateAdhanByIdForm({ adhanId }: UpdateAdhanFormProps) {
  const [loading, setLoading] = useState(true)
  const [currentAdhanFile, setCurrentAdhanFile] = useState<string | null>(null);
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [currentAdhanRecordId, setCurrentAdhanRecordId] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);


  // Fetch adhan data and related masjid details
  useEffect(() => {
    if (!adhanId) {
        setLoading(false);
        setModalTitle("Error");
        setModalMessage("Adhan ID is missing.");
        setShowModal(true);
        return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch the current adhan file to get masjidId and adhan record id
        const adhanRes = await fetch(`/api/adhan/${adhanId}`);
        if (!adhanRes.ok) throw new Error('Failed to fetch adhan data.');
        const adhanResult = await adhanRes.json();
        const adhanFile = adhanResult.adhanFile;
        const masjidId = adhanFile?.masjidId;

        if (!masjidId) throw new Error('Masjid ID not found in adhan data.');
        
        // Store relevant data
        setCurrentAdhanRecordId(adhanFile.id); // Store the adhan record ID
        if (adhanFile?.file) {
            setCurrentAdhanFile(adhanFile.file);
        }

        // 2. Fetch the specific masjid details
        const masjidRes = await fetch(`/api/masjids/${masjidId}`);
        if (!masjidRes.ok) throw new Error('Failed to fetch masjid details.');
        const masjidResult = await masjidRes.json();
        if (masjidResult.Masjid) {
          setMasjid(masjidResult.Masjid);
        } else {
          throw new Error('Masjid details not found.');
        }

      } catch (err: any) {
        setModalTitle("Data Fetch Error");
        setModalMessage(err.message);
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [adhanId]);

  const initialValues = {
    file: null,
  }

  // Handle closing the modal
  const handleModalClose = () => {
    setShowModal(false);
    if (isSuccess) {
      window.location.href = '/adhan'; // Navigate on success
    }
  };

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    setIsSuccess(false);

    if (!values.file || !currentAdhanRecordId) {
      setModalTitle('Validation Error');
      setModalMessage('Please select a file and ensure adhan data is loaded.');
      setShowModal(true);
      setSubmitting(false);
      return;
    }

    // Function to convert file to Base64
    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });

    try {
      const base64File = await toBase64(values.file);

      const response = await fetch(`/api/adhan/update/${currentAdhanRecordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: currentAdhanRecordId, // Send the existing adhan record ID
            file: base64File,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `Request failed with status ${response.status}`)
      }
      
      setModalTitle('Success');
      setModalMessage('Adhan sound updated successfully!');
      setIsSuccess(true);
      setShowModal(true);
      resetForm();

    } catch (error: any) {
        setModalTitle('Update Failed');
        setModalMessage(error.message || 'Failed to submit the form.');
        setShowModal(true);
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
        <div className="text-center p-5">
            <Spinner animation="border" />
            <p className="mt-2">Loading Data...</p>
        </div>
    );
  }

  return (
    <>
      <Card>
        <Card.Header>
          <h4 className="header-title">Update Adhan Sound</h4>
          <p className="text-muted mb-0">Upload a new audio file for <strong>{masjid?.name || 'the selected masjid'}</strong>.</p>
        </Card.Header>
        <Card.Body>
          <Row>
              <Col md={12} className="mb-4">
                  <Form.Label>Current Adhan Sound</Form.Label>
                  {currentAdhanFile ? (
                      <audio controls src={`data:audio/mpeg;base64,${currentAdhanFile}`} className="w-100">
                          Your browser does not support the audio element.
                      </audio>
                  ) : (
                      <Alert variant="info">No current adhan file uploaded for this masjid.</Alert>
                  )}
              </Col>
          </Row>
          <hr/>
          <Formik 
            initialValues={initialValues} 
            validationSchema={adhanUpdateSchema} 
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, setFieldValue }) => (
              <FormikForm>
                <Row>
                  <Col md={12} className="mb-3">
                      <Form.Label>Masjid</Form.Label>
                      <Form.Control
                          type="text"
                          value={masjid ? `${masjid.name} - ${masjid.location} (+${masjid.phoneNumber?.countryCode} ${masjid.phoneNumber?.number})` : ''}
                          disabled
                      />
                  </Col>
                </Row>
                <Row>
                  <Col md={12} className="mb-3">
                      <Form.Label htmlFor="file">New Adhan Audio File</Form.Label>
                      <Form.Control
                          type="file"
                          id="file"
                          name="file"
                          accept="audio/*"
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                              setFieldValue("file", event.currentTarget.files ? event.currentTarget.files[0] : null);
                          }}
                      />
                      <ErrorMessage name="file" component={Form.Text} className="text-danger" />
                  </Col>
                </Row>

                <div className="mt-3">
                  <Button type="submit" disabled={isSubmitting} variant="primary">
                    {isSubmitting ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" /> Uploading...
                      </>
                    ) : (
                      'Update Adhan'
                    )}
                  </Button>
                </div>
              </FormikForm>
            )}
          </Formik>
        </Card.Body>
      </Card>

      {/* Modal for displaying success or error messages */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
