'use client'

import { Card, CardBody, CardHeader, Col, Row, Badge, Button, ButtonGroup, Spinner, Alert, Form, InputGroup, Modal } from 'react-bootstrap'
import React, { useState, useEffect, useCallback } from 'react'
import ReactTable from '@/components/Table'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Masjid } from '@/types/masjids'
import MasjidFormModal from './MasjidFormModal'
// NOTE: We no longer need mapApiToForm here
// import { mapApiToForm } from '@/utils/dataMapper'

const sizePerPageList = [5, 10, 20, 50]

export default function TableMasjids() {
  const [data, setData] = useState<Masjid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('name')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 })
  const [pageCount, setPageCount] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [masjidToDelete, setMasjidToDelete] = useState<Masjid | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedMasjid, setSelectedMasjid] = useState<Masjid | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ page: (pagination.pageIndex + 1).toString(), limit: pagination.pageSize.toString() })
    if (debouncedSearchTerm) {
      params.append(filterBy, debouncedSearchTerm)
    }
    const url = `/api/masjids?${params.toString()}`
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to fetch data')
      const result = await response.json()

      // FIX: Remove the mapper. The API data is already in the correct camelCase format.
      setData(result.data || [])
      setPageCount(result.totalPages || 0)
    } catch (err: any) {
      setError(err.message)
      setData([])
      setPageCount(0)
    } finally {
      setLoading(false)
    }
  }, [pagination, debouncedSearchTerm, filterBy])

  const handleShowCreateModal = () => {
    setIsEditMode(false)
    setSelectedMasjid(null)
    setShowFormModal(true)
  }

  const handleShowEditModal = async (masjidId: string) => {
    setIsEditMode(true)
    setLoading(true)
    try {
      const response = await fetch(`/api/masjids/${masjidId}`)
      if (!response.ok) throw new Error('Failed to fetch masjid details for editing.')
      const result = await response.json()
      // No mapper needed here either, as get-by-id is also camelCase
      const masjidData = result;
      if (masjidData && masjidData.prayerTimesConfiguration) {
        masjidData.prayerConfig = masjidData.prayerTimesConfiguration;
        delete masjidData.prayerTimesConfiguration;
      }
      setSelectedMasjid(masjidData)
      setShowFormModal(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSuccess = () => { fetchData() }
  const handleShowDeleteModal = (masjid: Masjid) => { setMasjidToDelete(masjid); setShowDeleteModal(true) }
  const handleCloseDeleteModal = () => { setMasjidToDelete(null); setShowDeleteModal(false) }

  const handleDelete = async () => {
    if (!masjidToDelete) return
    try {
      const response = await fetch(`/api/masjids/${masjidToDelete.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to delete masjid.')
      fetchData()
      handleCloseDeleteModal()
    } catch (err: any) {
      setError(err.message)
      handleCloseDeleteModal()
    }
  }

  const columns: ColumnDef<Masjid>[] = [
    { header: 'Masjid Name', accessorKey: 'name' },
    { header: 'City', accessorKey: 'address.city' },
    {
      header: 'Status',
      accessorKey: 'isVerified',
      cell: ({ getValue }) => <Badge bg={getValue() ? 'success' : 'warning'}>{getValue() ? 'Verified' : 'Pending'}</Badge>,
    },
    {
      header: 'Last Updated',
      accessorKey: 'updatedAt',
      cell: ({ getValue }) => getValue() ? new Date(getValue() as string).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ButtonGroup size="sm">
          <Button variant="outline-primary" onClick={() => handleShowEditModal(row.original.id)}>
            <IconifyIcon icon="ri-edit-box-line" />
          </Button>
          <Button variant="outline-danger" onClick={() => handleShowDeleteModal(row.original)}>
            <IconifyIcon icon="ri-delete-bin-line" />
          </Button>
          <Button
            variant="outline-success"
            onClick={() =>
              window.open(
                `/masjid-detail/${row.original.id}`,
                '_blank'
              )
            }
          >
            <IconifyIcon icon="ri-external-link-line" />
          </Button>
        </ButtonGroup>
      ),
    },
  ]

  useEffect(() => {
    const timerId = setTimeout(() => { setDebouncedSearchTerm(searchTerm); setPagination(p => ({ ...p, pageIndex: 0 })) }, 500)
    return () => clearTimeout(timerId)
  }, [searchTerm, filterBy])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <>
      <Row className="justify-content-end mb-3">
        <Col xs="auto">
          <Button variant="success" onClick={handleShowCreateModal}>
            <IconifyIcon icon="mdi:plus-circle" /> Create New Masjid Data

          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Row className="justify-content-between align-items-center gy-3">
                <Col md={4}><h4 className="header-title">Masjid Data Management</h4></Col>
                <Col md={3} className="text-md-end">
                </Col>
                <Col md={5}>
                  <InputGroup>
                    <Form.Select value={filterBy} onChange={(e) => setFilterBy(e.target.value)} style={{ flex: '0 0 150px' }}>
                      <option value="name">Filter by Name</option>
                      <option value="location">Filter by Location</option>
                    </Form.Select>
                    <Form.Control type="text" placeholder={`Search by ${filterBy}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </InputGroup>
                </Col>
              </Row>
            </Card.Header>
            <CardBody>
              {error && <Alert variant="danger">{error}</Alert>}
              {loading ? <div className="text-center"><Spinner animation="border" /></div> : (
                <ReactTable<Masjid>
                  columns={columns} data={data} rowsPerPageList={sizePerPageList} tableClass="table-striped"
                  showPagination pagination={pagination} onPaginationChange={setPagination} pageCount={pageCount}
                  options={{ manualPagination: true }}
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
      <MasjidFormModal show={showFormModal} onHide={() => setShowFormModal(false)} onSuccess={handleFormSuccess} isEditMode={isEditMode} initialData={selectedMasjid} />
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Deletion</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete the masjid: <strong>{masjidToDelete?.name}</strong>? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}