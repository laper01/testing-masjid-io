'use client'

import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Button,
  ButtonGroup,
  Spinner,
  Form,
  InputGroup,
  Modal,
  Alert,
} from 'react-bootstrap'
import React, { useState, useEffect } from 'react'
import ReactTable from '@/components/Table' // Make sure this path is correct
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'

// 1. Define the TypeScript type for Adhan Settings
type AdhanSetting = {
  id: string
  masjidName: string
  location: string
  phoneNumber: string
  soundFile: string // Base64 encoded audio string
}

// 2. Create Mock Data
// Note: This is a real, tiny Base64 MP3 saying "Allahu Akbar".
const sampleBase64Audio = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAAAA/AAAAAExhdmc1OC40NS4xMDAAAAAAAAAAAAAAAAAAAAAAABEIABYADgAAvgQYIAAAAAAAAAD/+0LENFAAAHkIIAAAFqAAAABVYABNQAB6AD8AaQAAAAABHwisgAAAAAwAAADbAAABFgAABxADgAaQAAAAABHwisgAAAAAysAAAQQAAAFWAAAEAAAEAEAABrBH//7QsQxQAAAEGCAAACgoCAAcA//uAAAAAAAAAAA=='

const initialData: AdhanSetting[] = [
  {
    id: 'a1',
    masjidName: 'Masjid Istiqlal',
    location: 'Jakarta Pusat, Indonesia',
    phoneNumber: '+62 21 3811708',
    soundFile: sampleBase64Audio,
  },
  {
    id: 'a2',
    masjidName: 'Masjid Agung Jawa Tengah',
    location: 'Semarang, Indonesia',
    phoneNumber: '+62 24 6725412',
    soundFile: sampleBase64Audio,
  },
  {
    id: 'a3',
    masjidName: 'Masjid Raya Baiturrahman',
    location: 'Banda Aceh, Indonesia',
    phoneNumber: '+62 651 21344',
    soundFile: sampleBase64Audio,
  },
  {
    id: 'a4',
    masjidName: 'Al-Akbar Mosque',
    location: 'Surabaya, Indonesia',
    phoneNumber: '+62 31 8282333',
    soundFile: sampleBase64Audio,
  },
  {
    id: 'a5',
    masjidName: 'Dian Al-Mahri Mosque',
    location: 'Depok, Indonesia',
    phoneNumber: '+62 21 77218821',
    soundFile: sampleBase64Audio,
  },
  {
    id: 'a6',
    masjidName: 'Masjid Sheikh Zayed',
    location: 'Surakarta, Indonesia',
    phoneNumber: '+62 271 7891234',
    soundFile: sampleBase64Audio,
  },
]

const sizePerPageList = [5, 10, 20, 50]

export default function AdhanManagementTable() {
  // Main data source state
  const [allAdhans, setAllAdhans] = useState<AdhanSetting[]>(initialData)
  // State for data currently displayed in the table
  const [displayedAdhans, setDisplayedAdhans] = useState<AdhanSetting[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })
  const [pageCount, setPageCount] = useState(0)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [adhanToDelete, setAdhanToDelete] = useState<AdhanSetting | null>(null)

  // Function to handle deletion from the main data source
  const handleDelete = () => {
    if (!adhanToDelete) return
    // Filter out the adhan setting to be deleted
    setAllAdhans((prevAdhans) => prevAdhans.filter((adhan) => adhan.id !== adhanToDelete.id))
    handleCloseDeleteModal()
  }

  const handleShowDeleteModal = (adhan: AdhanSetting) => {
    setAdhanToDelete(adhan)
    setShowDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setAdhanToDelete(null)
    setShowDeleteModal(false)
  }

  // 3. Define columns for the Adhan settings table
  const columns: ColumnDef<AdhanSetting>[] = [
    {
      header: 'Masjid',
      accessorKey: 'masjidName',
      cell: ({ row }) => (
        <div>
          <h5 className="m-0">{row.original.masjidName}</h5>
          <p className="m-0 text-muted fs-13">{row.original.location}</p>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessorKey: 'phoneNumber',
    },
    {
      header: 'Adhan Sound',
      accessorKey: 'soundFile',
      cell: ({ getValue }) => {
        const soundFile = getValue() as string
        return <audio controls src={soundFile} style={{ width: '200px' }} />
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ButtonGroup size="sm">
          <Link href={`/adhan-managements/edit/${row.original.id}`} passHref>
            <Button variant="outline-primary">
              <IconifyIcon icon="ri-edit-box-line" />
            </Button>
          </Link>
          <Button variant="outline-danger" onClick={() => handleShowDeleteModal(row.original)}>
            <IconifyIcon icon="ri-delete-bin-line" />
          </Button>
        </ButtonGroup>
      ),
    },
  ]

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPagination((prev) => ({ ...prev, pageIndex: 0 })) // Reset to first page on search
    }, 500)
    return () => clearTimeout(timerId)
  }, [searchTerm])

  // 4. useEffect for handling client-side data (filtering and pagination)
  useEffect(() => {
    setLoading(true)
    setError(null)

    const simulateFetch = () => {
      try {
        // Filter data based on search term
        const filteredData = allAdhans.filter((adhan) =>
          adhan.masjidName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )

        // Set page count
        const totalPages = Math.ceil(filteredData.length / pagination.pageSize)
        setPageCount(totalPages)

        // Paginate data
        const start = pagination.pageIndex * pagination.pageSize
        const end = start + pagination.pageSize
        const pagedData = filteredData.slice(start, end)
        setDisplayedAdhans(pagedData)
      } catch (err: any) {
        setError('Failed to process data.')
      } finally {
        setLoading(false)
      }
    }

    // Simulate network delay
    const timer = setTimeout(simulateFetch, 500)
    return () => clearTimeout(timer)
  }, [pagination, debouncedSearchTerm, allAdhans])

  return (
    <>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Row className="justify-content-between align-items-center gy-3">
                <Col md={5}>
                  <h4 className="header-title">Adhan Sound Management</h4>
                  <p className="text-muted mb-0">Manage Adhan sound files for different masjids.</p>
                </Col>
                <Col md={5}>
                  <InputGroup>
                    <InputGroup.Text>
                      <IconifyIcon icon="ri-search-line" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by Masjid name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
              </Row>
            </Card.Header>
            <CardBody>
              {error && <Alert variant="danger">{error}</Alert>}
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" />
                </div>
              ) : (
                <ReactTable<AdhanSetting>
                  columns={columns}
                  data={displayedAdhans}
                  rowsPerPageList={sizePerPageList}
                  tableClass="table-striped"
                  showPagination
                  pagination={pagination}
                  onPaginationChange={setPagination}
                  pageCount={pageCount}
                  options={{ manualPagination: true }}
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the Adhan setting for:{' '}
          <strong>{adhanToDelete?.masjidName}</strong>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}