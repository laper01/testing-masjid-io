'use client';

import { Form, Button, Row, Col, Spinner, Card } from 'react-bootstrap';
import { NikkahProfile, CreateNikkahProfileDTO, Gender, Month } from '@/types/nikkah';
import { useEffect, useState } from 'react';
// UPDATED: Import from 'react-hot-toast'
import { toast } from 'react-hot-toast';

interface ProfileFormProps {
  initialData: NikkahProfile | null;
  onSave: (updatedProfile: NikkahProfile) => void;
}

export function NikkahProfileForm({ initialData, onSave }: ProfileFormProps) {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState<CreateNikkahProfileDTO>({
    name: '',
    gender: Gender.MALE,
    birthDate: { year: 2000, month: Month.JANUARY, day: 1 },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: initialData.name,
        gender: initialData.gender,
        birthDate: { ...initialData.birthDate },
      });
    }
  }, [initialData, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'day' || name === 'month' || name === 'year') {
      setFormData(prev => ({
        ...prev,
        birthDate: {
          ...prev.birthDate,
          [name]: name === 'day' || name === 'year' ? Number(value) : value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = isEditMode ? `/api/nikkah/profile/${initialData!.id}` : '/api/nikkah/profile';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save profile.');
      }

      // Show a success toast with the message from the API
      toast.success(result.message || 'Profile saved successfully!');

      onSave(result.nikkahProfile);

    } catch (err: any) {
      // Show an error toast with the caught error message
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header>
        <h4 className="mb-0">{isEditMode ? 'Update Your Profile' : 'Create Your Profile'}</h4>
        <p className="text-muted mb-0">
          {isEditMode ? 'Keep your details up to date.' : 'Please provide your details to get started.'}
        </p>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {/* No Alert component needed here */}
          
          <Form.Group className="mb-3" controlId="profileName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
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
              <Col xs={4} md={3}>
                <Form.Control type="number" name="day" value={formData.birthDate.day} onChange={handleChange} placeholder="Day" required />
              </Col>
              <Col xs={8} md={5}>
                <Form.Select name="month" value={formData.birthDate.month} onChange={handleChange}>
                  {Object.values(Month).map(m => <option key={m} value={m}>{m}</option>)}
                </Form.Select>
              </Col>
              <Col xs={12} md={4} className="mt-2 mt-md-0">
                <Form.Control type="number" name="year" value={formData.birthDate.year} onChange={handleChange} placeholder="Year" required />
              </Col>
            </Row>
          </Form.Group>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="primary" type="submit" disabled={isSubmitting} style={{ minWidth: '120px' }}>
              {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : 'Save Profile'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}