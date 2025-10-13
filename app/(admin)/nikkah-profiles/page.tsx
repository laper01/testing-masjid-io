'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import ReactTable from '@/components/Table'; // Assumes you have a custom Table component
import IconifyIcon from '@/components/wrappers/IconifyIcon'; // Assumes you have an Icon component
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { NikkahProfile, Gender } from '@/types/nikkah';
import { ProfileModal } from '@/components/profile-nikkah/ProfileModal';


// --- Main Page Component ---
export default function NikkahProfileManagement() {
  const [profiles, setProfiles] = useState<NikkahProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Modal Form
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<NikkahProfile | null>(null);

  // State for pagination
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [pageCount, setPageCount] = useState(0);

  // Modal control functions
  const handleShowCreateModal = () => {
    setEditingProfile(null);
    setShowModal(true);
  };

  const handleShowEditModal = (profile: NikkahProfile) => {
    setEditingProfile(profile);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProfile(null);
  }

  // Fetch data from your Next.js API route
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        start: (pagination.pageIndex * pagination.pageSize).toString(),
        limit: pagination.pageSize.toString(),
      });
      
      const response = await fetch(`/api/nikkah/profiles?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch profiles');
      }
      const result = await response.json();
      setProfiles(result.listProfilesResponse.profiles || []);
      setPageCount(result.listProfilesResponse.totalPages || 0);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Column definitions using useMemo for performance
  const columns = useMemo<ColumnDef<NikkahProfile>[]>(() => [
    { header: 'Name', accessorKey: 'name' },
    {
      header: 'Gender',
      accessorKey: 'gender',
      cell: ({ getValue }) => {
          const gender = getValue<Gender>();
          const variant = gender === Gender.MALE ? 'primary' : 'info';
          return <Badge bg={variant}>{gender.charAt(0) + gender.slice(1).toLowerCase()}</Badge>
      }
    },
    {
      header: 'Birth Date',
      accessorKey: 'birthDate',
      cell: ({ getValue }) => {
        const { day, month, year } = getValue() as NikkahProfile['birthDate'];
        const formattedMonth = month.charAt(0) + month.slice(1).toLowerCase();
        return `${day} ${formattedMonth} ${year}`;
      },
    },
    {
      header: 'Last Updated',
      accessorKey: 'updateTime',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString('en-GB', {
        year: 'numeric', month: 'long', day: 'numeric',
      }),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div>
          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowEditModal(row.original)}>
              <IconifyIcon icon="mdi:pencil-outline" /> Edit
          </Button>
          <Button variant="outline-danger" size="sm">
              <IconifyIcon icon="mdi:delete-outline" /> Delete
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="container mt-4 mb-4">
      <Row>
        <Col>
          <Card className="shadow-sm">
            <CardHeader className="bg-light p-3">
              <Row className="align-items-center">
                <Col>
                  <h4 className="mb-0">Nikkah Profile Management</h4>
                </Col>
                <Col className="text-end">
                  <Button variant="primary" onClick={handleShowCreateModal}>
                    <IconifyIcon icon="mdi:plus" className="me-1" />
                    Add New Profile
                  </Button>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {error && <Alert variant="danger">{error}</Alert>}
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading data...</p>
                </div>
              ) : (
                <ReactTable<NikkahProfile>
                  columns={columns}
                  data={profiles}
                  pagination={pagination}
                  onPaginationChange={setPagination}
                  pageCount={pageCount}
                  options={{ manualPagination: true }}
                  tableClass="table-hover align-middle"
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <ProfileModal
          show={showModal}
          handleClose={handleCloseModal}
          profile={editingProfile}
          onSave={() => {
              handleCloseModal();
              fetchData(); // Refresh data after saving
          }}
      />
    </div>
  );
}