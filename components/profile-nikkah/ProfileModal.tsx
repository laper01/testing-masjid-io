'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { NikkahProfile, CreateNikkahProfileDTO, Gender, Month } from '@/types/nikkah';

interface ProfileModalProps {
  show: boolean;
  handleClose: () => void;
  profile: NikkahProfile | null; // null for 'Create', object for 'Edit'
  onSave: () => void; // Callback to refresh data on parent
}

const initialFormData: CreateNikkahProfileDTO = {
  name: '',
  gender: Gender.MALE,
  birthDate: {
    year: new Date().getFullYear() - 20,
    month: Month.JANUARY,
    day: 1,
  },
};

export function ProfileModal({ show, handleClose, profile, onSave }: ProfileModalProps) {
  const [formData, setFormData] = useState<CreateNikkahProfileDTO>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!profile;

  // Populate form when opening for editing
  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: profile.name,
        gender: profile.gender,
        birthDate: { ...profile.birthDate },
      });
    } else {
      setFormData(initialFormData); // Reset for 'Create' mode
    }
    setError(null); // Clear previous errors
  }, [profile, show]);

  // CORRECTED TYPE SIGNATURE HERE
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'day' || name === 'month' || name === 'year') {
      setFormData((prev) => ({
        ...prev,
        birthDate: {
          ...prev.birthDate,
          [name]: name === 'day' || name === 'year' ? Number(value) : value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditMode ? `/api/nikkah/profile/${profile.id}` : '/api/nikkah/profile';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An unknown error occurred.');
      }

      onSave(); // Trigger data refresh in parent component
      handleClose(); // Close the modal on success

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Edit Profile' : 'Create New Profile'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="profileName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter full name"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="profileGender">
            <Form.Label>Gender</Form.Label>
            <Form.Select name="gender" value={formData.gender} onChange={handleChange}>
              <option value={Gender.MALE}>Male</option>
              <option value={Gender.FEMALE}>Female</option>
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="profileBirthDate">
            <Form.Label>Birth Date</Form.Label>
            <Row>
              <Col>
                <Form.Control
                  type="number"
                  name="day"
                  value={formData.birthDate.day}
                  onChange={handleChange}
                  placeholder="Day"
                  min="1" max="31"
                  required
                />
              </Col>
              <Col>
                <Form.Select name="month" value={formData.birthDate.month} onChange={handleChange}>
                  {Object.values(Month).map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  name="year"
                  value={formData.birthDate.year}
                  onChange={handleChange}
                  placeholder="Year"
                  min="1940" max={new Date().getFullYear()}
                  required
                />
              </Col>
            </Row>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? (<><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> Saving...</>) : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}