'use client'

import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Button, Card, Col, Form, Row, Spinner, Modal } from 'react-bootstrap'
import type { Masjid } from '@/types/adhan.type'
import { useEffect, useState } from 'react'

// Validation schema using Yup
const adhanValidationSchema = Yup.object().shape({
  masjid_id: Yup.string().required('Please select a masjid.'),
  file: Yup.mixed()
    .required('An audio file is required.')
    .test('fileType', 'Unsupported file format. Please upload an audio file.', (value: any) => {
        if (!value) return true; // Let 'required' handle the empty case
        return value && value.type.startsWith('audio/');
    }),
})

// Main Form Component
export default function CreateAdhanForm() {
  const [masjids, setMasjids] = useState<Masjid[]>([])
  const [loadingMasjids, setLoadingMasjids] = useState(true)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)


  // Fetch the list of masjids when the component mounts
  useEffect(() => {
    const fetchMasjids = async () => {
      try {
        const response = await fetch('/api/masjids/get')
        if (!response.ok) {
          throw new Error('Failed to fetch masjids')
        }
        const result = await response.json()
        if (result.listMasjidResponse?.masjids) {
          setMasjids(result.listMasjidResponse.masjids)
        }
      } catch (error) {
        // Show error in modal if masjids fail to load
        setModalTitle('Error')
        setModalMessage('Could not load the list of masjids. Please try refreshing the page.')
        setShowModal(true)
      } finally {
        setLoadingMasjids(false)
      }
    }
    fetchMasjids()
  }, [])

  // Initial values for the form
  const initialValues = {
    masjid_id: '',
    file: null,
  }
  
  // Function to handle closing the modal
  const handleModalClose = () => {
    setShowModal(false);
    // If the submission was successful, navigate to the adhan page
    if (isSuccess) {
        // Replaced Next.js router with standard window navigation
        window.location.href = '/adhan';
    }
  };


  // Handle form submission
  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    setIsSuccess(false); // Reset success state on new submission

    if (!values.file) {
      setModalTitle('Validation Error');
      setModalMessage('Please select a file to upload.');
      setShowModal(true);
      setSubmitting(false);
      return;
    }

    // Function to convert a file to a Base64 string
    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove the 'data:*/*;base64,' prefix
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });

    try {
      const base64File = await toBase64(values.file);

      const response = await fetch('/api/adhan/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            masjid_id: values.masjid_id,
            file: base64File,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `Request failed with status ${response.status}`)
      }

      // On success, configure and show the modal
      setModalTitle('Success');
      setModalMessage('Adhan sound uploaded successfully!');
      setIsSuccess(true);
      setShowModal(true);
      resetForm();

    } catch (error: any) {
      // On failure, configure and show the modal with the error message
      setModalTitle('Upload Failed');
      setModalMessage(error.message || 'Failed to submit the form.');
      setShowModal(true);
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <Card.Header>
          <h4 className="header-title">Upload Adhan Sound</h4>
          <p className="text-muted mb-0">Select a masjid and upload an audio file for the adhan.</p>
        </Card.Header>
        <Card.Body>
          <Formik 
            initialValues={initialValues} 
            validationSchema={adhanValidationSchema} 
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, setFieldValue }) => (
              <FormikForm>
                <Row>
                  <Col md={12} className="mb-3">
                      <Form.Label htmlFor="masjid_id">Masjid</Form.Label>
                      <Field
                          as={Form.Select}
                          id="masjid_id"
                          name="masjid_id"
                          disabled={loadingMasjids}
                      >
                          <option value="">{loadingMasjids ? 'Loading masjids...' : 'Select a Masjid'}</option>
                          {masjids.map((masjid) => (
                              <option key={masjid.id} value={masjid.id}>
                              {masjid.name} - {masjid.location}  (+{masjid.phoneNumber?.countryCode} {masjid.phoneNumber?.number})
                              </option>
                          ))}
                      </Field>
                      <ErrorMessage name="masjid_id" component={Form.Text} className="text-danger" />
                  </Col>
                </Row>
                <Row>
                  <Col md={12} className="mb-3">
                      <Form.Label htmlFor="file">Adhan Audio File</Form.Label>
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
                      'Upload Adhan'
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
