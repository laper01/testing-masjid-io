'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { NikkahProfile } from '@/types/nikkah';
import { NikkahProfileForm } from '@/components/my-profile/NikkahProfileForm';

export default function MyProfilePage() {
  // Use `undefined` for initial state, `null` for "no profile found"
  const [profile, setProfile] = useState<NikkahProfile | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch the user's own profile from our BFF
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/nikkah/profile');

      // A 404 status from this specific endpoint means the user has no profile yet.
      if (response.status === 404) {
        setProfile(null); // Set to null to indicate "create" mode
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load profile data.");
      }

      const result = await response.json();
      setProfile(result.nikkahProfile); // Profile exists, set it
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data when the component mounts
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handler for when the form is successfully saved
  const handleProfileUpdate = (updatedProfile: NikkahProfile) => {
    // Update the local state to reflect the changes immediately
    setProfile(updatedProfile);
    // Optionally, you could show a success toast message here
  };

  // Render loading state
  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading Your Profile...</span>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  // Render the main content
  return (
    <Container className="mt-4 mb-4">
      <Row className="justify-content-center">
        <Col lg={8} md={10}>
          {/*
            Conditionally render the form. 
            - If profile is an object, pass it to `initialData` for "update" mode.
            - If profile is null, pass `null` for "create" mode.
          */}
          {profile !== undefined && (
            <NikkahProfileForm 
              initialData={profile} 
              onSave={handleProfileUpdate}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}