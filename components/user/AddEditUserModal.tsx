'use client';

import React, { useState, useEffect } from 'react';
import { Formik, Form as FormikForm, Field, ErrorMessage, FieldInputProps, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Button, Col, Form, Row, Spinner, Modal, Alert } from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import { toast } from 'react-hot-toast';
import { User } from '@/types/auth';

// --- PHONE INPUT COMPONENT ---
const BootstrapPhoneInput = ({ field, form }: { field: FieldInputProps<any>; form: FormikProps<any> }) => {
    // ... (This component remains the same as your provided code)
    const { name, value } = field;
    const { touched, errors, setFieldValue } = form;
    const errorMsg = touched[name] && (errors[name] as any)?.number;
    const phoneValue = `${value?.countryCode || ''}${value?.number || ''}`;
    return (
        <>
            <PhoneInput
                country={'us'}
                value={phoneValue}
                onChange={(phone, country: any) => {
                    const dialCode = country.dialCode;
                    const phoneNumber = phone.substring(dialCode.length);
                    setFieldValue(name, { countryCode: dialCode, number: phoneNumber });
                }}
                inputClass={`form-control ${errorMsg ? 'is-invalid' : ''}`}
            />
            {typeof errorMsg === 'string' && <div className="invalid-feedback d-block">{errorMsg}</div>}
        </>
    );
};


// --- VALIDATION SCHEMAS ---
const phoneValidation = Yup.object().shape({
    countryCode: Yup.string().required(),
    number: Yup.string().required('Phone number is required').min(8, 'Phone number seems too short'),
});

const createValidationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    username: Yup.string().required('Username is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    phoneNumber: phoneValidation,
    gender: Yup.string().oneOf(['MALE', 'FEMALE']).required('Gender is required'),
    role: Yup.string().required('Role is required'),
});

const editValidationSchema = createValidationSchema.omit(['password']).shape({
    password: Yup.string().min(6, 'Password must be at least 6 characters'),
});


// --- MAIN COMPONENT ---
type AddEditUserModalProps = {
    show: boolean;
    isEditable: boolean;
    userData: Partial<User> | null;
    onClose: () => void;
    onAddUser: (data: Partial<User>) => void;
    onUpdateUser: (data: Partial<User>) => void;
};

// Define a default empty state for the form
const defaultInitialValues = {
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: { countryCode: '', number: '' },
    gender: 'MALE' as 'MALE' | 'FEMALE',
    role: 'MASJID_MEMBER',
};

export default function AddEditUserModal({ show, isEditable, userData, onClose, onAddUser, onUpdateUser }: AddEditUserModalProps) {
    
    // --- FIX: State to manage form values and loading within the modal ---
    const [formValues, setFormValues] = useState(defaultInitialValues);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // This effect runs when the modal is opened
        if (show) {
            setError(null);
            // If we are in "Edit" mode and have a user ID...
            if (isEditable && userData?.id) {
                setIsLoading(true);
                // Fetch the full user details
                fetch(`/api/user/get/${userData.id}`)
                    .then(res => {
                        if (!res.ok) throw new Error('Failed to fetch user data for editing.');
                        return res.json();
                    })
                    .then(result => {
                        const fullUserData = result.getUserResponse;
                        if (!fullUserData) throw new Error('User data not found in API response.');
                        
                        // Populate the form values from the fetched data
                        setFormValues({
                            email: fullUserData.email || '',
                            username: fullUserData.username || '',
                            password: '', // Always clear password on edit
                            firstName: fullUserData.firstName || '',
                            lastName: fullUserData.lastName || '',
                            phoneNumber: {
                                countryCode: fullUserData.phoneNumber?.countryCode || '',
                                number: fullUserData.phoneNumber?.number || '',
                            },
                            gender: fullUserData.gender || 'MALE',
                            role: fullUserData.role || 'MASJID_MEMBER',
                        });
                    })
                    .catch(err => {
                        setError(err.message);
                        toast.error(err.message);
                    })
                    .finally(() => setIsLoading(false));
            } else {
                // If we are in "Create" mode, just reset to defaults
                setFormValues(defaultInitialValues);
            }
        }
    }, [show, isEditable, userData]);


    const handleSubmit = (values: typeof defaultInitialValues) => {
        const submissionValues: any = { 
            id: userData?.id, 
            ...values,
            phoneNumber: values.phoneNumber.number, // Send as a string as previously required
        };
        
        if (isEditable) {
            if (!submissionValues.password) {
                delete submissionValues.password;
            }
            onUpdateUser(submissionValues as Partial<User>);
        } else {
            onAddUser(submissionValues as Partial<User>);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{isEditable ? 'Edit User' : 'Create New User'}</Modal.Title>
            </Modal.Header>
            {isLoading ? (
                <div className="text-center p-5"><Spinner animation="border" /></div>
            ) : error ? (
                <Modal.Body><Alert variant="danger">{error}</Alert></Modal.Body>
            ) : (
                <Formik
                    initialValues={formValues}
                    validationSchema={isEditable ? editValidationSchema : createValidationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize // Crucial for updating the form with fetched data
                >
                    {({ isSubmitting }) => (
                        <FormikForm>
                            <Modal.Body>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>First Name</Form.Label>
                                        <Field as={Form.Control} name="firstName" disabled={isEditable} />
                                        <ErrorMessage name="firstName" component={Form.Text} className="text-danger" />
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Last Name</Form.Label>
                                        <Field as={Form.Control} name="lastName" disabled={isEditable} />
                                        <ErrorMessage name="lastName" component={Form.Text} className="text-danger" />
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Field as={Form.Control} name="email" type="email" disabled={isEditable} />
                                        <ErrorMessage name="email" component={Form.Text} className="text-danger" />
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Username</Form.Label>
                                        <Field as={Form.Control} name="username" disabled={isEditable} />
                                        <ErrorMessage name="username" component={Form.Text} className="text-danger" />
                                    </Col>
                                    {!isEditable && (
                                        <>
                                            <Col md={6} className="mb-3">
                                                <Form.Label>Password</Form.Label>
                                                <Field as={Form.Control} name="password" type="password" />
                                                <ErrorMessage name="password" component={Form.Text} className="text-danger" />
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Form.Label>Phone Number</Form.Label>
                                                <Field name="phoneNumber" component={BootstrapPhoneInput} />
                                            </Col>
                                        </>
                                    )}
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Gender</Form.Label>
                                        <Field as={Form.Select} name="gender" disabled={isEditable}>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                        </Field>
                                        <ErrorMessage name="gender" component={Form.Text} className="text-danger" />
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Role</Form.Label>
                                        <Field as={Form.Select} name="role">
                                            <option value="MASJID_MEMBER">Masjid Member</option>
                                            <option value="MASJID_VOLUNTEER">Masjid Volunteer</option>
                                            <option value="MASJID_ADMIN">Masjid Admin</option>
                                            <option value="MASJID_IMAM">Masjid Imam</option>
                                            <option value="UNSPECIFIED">Unspecified</option>
                                        </Field>
                                        <ErrorMessage name="role" component={Form.Text} className="text-danger" />
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="light" onClick={onClose}>Close</Button>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? <Spinner size="sm" /> : (isEditable ? 'Save Changes' : 'Create User')}
                                </Button>
                            </Modal.Footer>
                        </FormikForm>
                    )}
                </Formik>
            )}
        </Modal>
    );
}

