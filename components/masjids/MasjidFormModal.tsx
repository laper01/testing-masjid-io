'use client'

import React, { useState } from 'react'
import { Formik, Form as FormikForm, Field, ErrorMessage, useFormikContext } from 'formik'
import * as Yup from 'yup'
import { Button, Col, Form, Row, Alert, Spinner, Modal } from 'react-bootstrap'
import BootstrapPhoneInput from '@/components/forms/BootstrapPhoneInput'
import LocationPicker from '@/components/LocationPicker'
import { Masjid } from '@/types/masjids'
import { mapFormToApi } from '@/utils/dataMapper'

const masjidValidationSchema = Yup.object().shape({
  name: Yup.string().required('Masjid name is required'),
  location: Yup.string().required('Location is required'),
  isVerified: Yup.boolean().required('Verification status is required'),
  latitude: Yup.number().required('Latitude is required'),
  longitude: Yup.number().required('Longitude is required'),
  address: Yup.object().shape({
    addressLine1: Yup.string().required('Address Line 1 is required'),
    addressLine2: Yup.string(),
    zoneCode: Yup.string().required('Zone code is required'),
    postalCode: Yup.string().required('Postal code is required'),
    city: Yup.string().required('City is required'),
    countryCode: Yup.string().required('Country code is required').length(2, 'Must be 2 characters'),
  }),
  phoneNumber: Yup.string().required('Phone number is required').matches(/^\+[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
  prayerConfig: Yup.object().shape({
    name: Yup.string().required('Configuration name is required'),
    method: Yup.string().required('Calculation method is required'),
    fajrAngle: Yup.number().typeError('Must be a number').required('Fajr angle is required'),
    ishaAngle: Yup.number().typeError('Must be a number').required('Isha angle is required'),
    ishaInterval: Yup.number().typeError('Must be a number').required('Isha interval is required'),
    asrMethod: Yup.string().required('Asr method is required'),
    highLatitudeRule: Yup.string().required('High latitude rule is required'),
    adjustments: Yup.object().shape({
      fajrAdjustment: Yup.number().typeError('Must be a number').required('Fajr adjustment is required'),
      dhuhrAdjustment: Yup.number().typeError('Must be a number').required('Dhuhr adjustment is required'),
      asrAdjustment: Yup.number().typeError('Must be a number').required('Asr adjustment is required'),
      maghribAdjustment: Yup.number().typeError('Must be a number').required('Maghrib adjustment is required'),
      ishaAdjustment: Yup.number().typeError('Must be a number').required('Isha adjustment is required'),
    }),
  }),
});

const convertPhoneToE164 = (phoneObj: any): string => {
  if (!phoneObj || typeof phoneObj === 'string') return phoneObj || ''
  const { countryCode, number } = phoneObj
  if (!countryCode || !number) return ''
  return `+${countryCode}${number.replace(/\D/g, '')}`
}

const convertE164ToPhoneObject = (e164: string) => {
  if (!e164 || !e164.startsWith('+')) return { countryCode: '62', number: '', extension: '' }
  const match = e164.match(/^\+(\d{1,3})(.*)$/)
  if (!match) return { countryCode: '62', number: '', extension: '' }
  return { countryCode: match[1], number: match[2].trim(), extension: '' }
}

type MasjidFormModalProps = {
  show: boolean
  onHide: () => void
  onSuccess: () => void
  isEditMode?: boolean
  initialData?: Masjid | null
}

const FormField = ({ name, label, type = 'text', as = 'input', children }: any) => (
  <Form.Group as={Col} md="6" controlId={name} className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Field name={name} type={type} as={as === 'select' ? Form.Select : Form.Control}>{children}</Field>
    <ErrorMessage name={name} component={Form.Text} className="text-danger" />
  </Form.Group>
);

const ModalFormContent = ({ onHide, isEditMode }: { onHide: () => void, isEditMode?: boolean }) => {
  const { isSubmitting, dirty, isValid, submitForm } = useFormikContext();
  return (
    <>
      <Modal.Body>
        <FormikForm>
          <h5 className="mb-3">Basic Information</h5>
          <Row>
            <FormField name="name" label="Masjid Name" />
            <FormField name="location" label="Location" />
          </Row>
          <Form.Group className="mb-4">
            <Field as={Form.Check} type="checkbox" name="isVerified" id="isVerified" label="Is Verified" />
          </Form.Group>

          <hr />
          <h5 className="mb-3">Location on Map</h5>
          <Field name="latitude">
            {({ field, form }: any) => (
              <LocationPicker
                latitude={form.values.latitude}
                longitude={form.values.longitude}
                onLocationChange={({ lat, lng }) => {
                  form.setFieldValue('latitude', lat);
                  form.setFieldValue('longitude', lng);
                }}
              />
            )}
          </Field>
          <ErrorMessage name="latitude" component={Form.Text} className="text-danger d-block mt-1" />
          <ErrorMessage name="longitude" component={Form.Text} className="text-danger d-block" />

          <hr />
          <h5 className="mb-3">Address</h5>
          <Row><FormField name="address.addressLine1" label="Address Line 1" /><FormField name="address.addressLine2" label="Address Line 2 (Optional)" /></Row>
          <Row><FormField name="address.city" label="City" /><FormField name="address.zoneCode" label="Zone Code" /></Row>
          <Row><FormField name="address.postalCode" label="Postal Code" /><FormField name="address.countryCode" label="Country Code" /></Row>

          <hr />
          <h5 className="mb-3">Phone Number</h5>
          <Row><Form.Group as={Col} md="12" className="mb-3"><Form.Label>Phone Number</Form.Label><Field name="phoneNumber" component={BootstrapPhoneInput} /></Form.Group></Row>

          <hr />
          <h5 className="mb-3">Prayer Time Configuration</h5>
          <Row><FormField name="prayerConfig.name" label="Configuration Name" /></Row>
          <Row>
            <FormField name="prayerConfig.method" label="Calculation Method" as="select">
              <option value="MUSLIM_WORLD_LEAGUE">Muslim World League</option>
              <option value="EGYPTIAN">Egyptian</option>
              <option value="OTHER">Other</option>
            </FormField>
            <FormField name="prayerConfig.asrMethod" label="Asr Method" as="select">
              <option value="SHAFI_HANBALI_MALIKI">Standard</option>
              <option value="HANAFI">Hanafi</option>
            </FormField>
          </Row>
          <Row><FormField name="prayerConfig.fajrAngle" label="Fajr Angle" type="number" /><FormField name="prayerConfig.ishaAngle" label="Isha Angle" type="number" /></Row>
          <Row>
            <FormField name="prayerConfig.ishaInterval" label="Isha Interval (Minutes)" type="number" />
            <FormField name="prayerConfig.highLatitudeRule" label="High Latitude Rule" as="select">
              <option value="MIDDLE_OF_THE_NIGHT">Middle of the Night</option>
              <option value="SEVENTH_OF_THE_NIGHT">Seventh of the Night</option>
              <option value="TWILIGHT_ANGLE">Twilight Angle</option>
            </FormField>
          </Row>
          <h6 className="mt-4 mb-3">Prayer Adjustments (minutes)</h6>
          <Row>
            <FormField name="prayerConfig.adjustments.fajrAdjustment" label="Fajr" type="number" />
            <FormField name="prayerConfig.adjustments.dhuhrAdjustment" label="Dhuhr" type="number" />
            <FormField name="prayerConfig.adjustments.asrAdjustment" label="Asr" type="number" />
          </Row>
          <Row>
            <FormField name="prayerConfig.adjustments.maghribAdjustment" label="Maghrib" type="number" />
            <FormField name="prayerConfig.adjustments.ishaAdjustment" label="Isha" type="number" />
          </Row>
        </FormikForm>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" disabled={isSubmitting || !dirty || !isValid} onClick={submitForm}>
          {isSubmitting ? <><Spinner as="span" animation="border" size="sm" /> Saving...</> : (isEditMode ? 'Update Masjid' : 'Create Masjid')}
        </Button>
      </Modal.Footer>
    </>
  );
};

export default function MasjidFormModal({ show, onHide, onSuccess, isEditMode = false, initialData = null }: MasjidFormModalProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const getInitialValues = () => {
    const defaultValues = {
      name: '',
      location: 'Indonesia',
      isVerified: true,
      latitude: null,
      longitude: null,
      address: { addressLine1: '', addressLine2: '', zoneCode: '', postalCode: '', city: 'Mataram', countryCode: 'ID' },
      phoneNumber: '',
      prayerConfig: {
        name: '',
        method: 'MUSLIM_WORLD_LEAGUE',
        fajrAngle: 18,
        ishaAngle: 17,
        ishaInterval: 0,
        asrMethod: 'SHAFI_HANBALI_MALIKI',
        highLatitudeRule: 'MIDDLE_OF_THE_NIGHT',
        adjustments: { fajrAdjustment: 0, dhuhrAdjustment: 5, asrAdjustment: 0, maghribAdjustment: 0, ishaAdjustment: 7 },
      },
    };
    if (isEditMode && initialData) {
      return {
        ...defaultValues,
        ...initialData,
        latitude: initialData.latitude || null,
        longitude: initialData.longitude || null,
        address: { ...defaultValues.address, ...initialData.address },
        prayerConfig: {
          ...defaultValues.prayerConfig,
          ...initialData.prayerConfig,
          adjustments: { ...defaultValues.prayerConfig.adjustments, ...initialData.prayerConfig?.adjustments },
        },
        phoneNumber: convertPhoneToE164(initialData.phoneNumber),
      };
    }
    return defaultValues;
  };

  const handleSubmit = async (values: any) => {
    setFormError(null);
    try {
      const formValues = { ...values, phoneNumber: convertE164ToPhoneObject(values.phoneNumber) };
      const apiPayload = mapFormToApi(formValues);
      const url = isEditMode ? `/api/masjids/${initialData?.id}` : '/api/masjids';
      const method = isEditMode ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Request failed');
      }
      onSuccess();
      onHide();
    } catch (error: any) {
      setFormError(error.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? `Edit Masjid: ${initialData?.name}` : 'Create New Masjid'}</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={masjidValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <>
          {formError && <Alert variant="danger" className="mx-4 mt-3 mb-0">{formError}</Alert>}
          <ModalFormContent onHide={onHide} isEditMode={isEditMode} />
        </>
      </Formik>
    </Modal>
  );
}