'use client'

import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Badge,
  Button,
  ButtonGroup,
  Spinner,
  Alert,
  Form,
  InputGroup,
} from 'react-bootstrap'
import React, { useState, useEffect } from 'react'
import ReactTable from '@/components/Table'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'

// --- Type Definition ---
type Masjid = {
  id: string
  name: string
  location: string
  isVerified: boolean
  address: {
    city: string
    [key: string]: any
  }
  updatedAt: string
}

// --- Column Definitions ---
const columns: ColumnDef<Masjid>[] = [
  {
    header: 'Masjid Name',
    accessorKey: 'name',
    cell: ({ row }) => (
        <div>
            <p className="m-0 fs-8 fw-semibold">{row.original.name}</p>
            <p className="m-0 text-muted fs-14">{row.original.location}</p>
        </div>
    )
  },
  {
    header: 'City',
    accessorKey: 'address.city',
  },
  {
    header: 'Status',
    accessorKey: 'isVerified',
    // --- UI FIX: Using a more subtle and modern badge style ---
    cell: ({ getValue }) => <Badge pill bg={getValue() ? 'success-lighten' : 'warning-lighten'} text={getValue() ? 'success' : 'warning'}>{getValue() ? 'Verified' : 'Pending'}</Badge>,
  },
  {
    header: 'Last Updated',
    accessorKey: 'updatedAt',
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <ButtonGroup size="sm">
        <Link href={`/masjid-detail/${row.original.id}`} passHref>
          <Button variant="outline-success">
            <span>
              <IconifyIcon icon="mdi:eye-outline" />
            </span>
          </Button>
        </Link>
      </ButtonGroup>
    ),
  },
]

const sizePerPageList = [5, 10, 20, 50]

interface TableMasjidsProps {
  initialSearchTerm?: string
}

export default function TableMasjids({ initialSearchTerm }: TableMasjidsProps) {
  const [masjids, setMasjids] = useState<Masjid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '')
  const [filterBy, setFilterBy] = useState('name')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [pageCount, setPageCount] = useState(0)

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }, 500)
    return () => clearTimeout(timerId)
  }, [searchTerm, filterBy])

  useEffect(() => {
    const fetchMasjids = async () => {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
      })
      if (debouncedSearchTerm) {
        params.append(filterBy, debouncedSearchTerm)
      }
      const url = `/api/masjids?${params.toString()}`

      try {
        const response = await fetch(url)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch data')
        }
        const result = await response.json()
        
        if (result.data) {
          setMasjids(result.data || [])
          setPageCount(result.totalPages || 0)
        } else {
          throw new Error('Data format from API is incorrect')
        }

      } catch (err: any) {
        setError(err.message)
        setMasjids([])
        setPageCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchMasjids()
  }, [pagination, debouncedSearchTerm, filterBy])

  return (
    // --- UI FIX: Wrapped content in a container for better layout and spacing ---
    <div className="container mt-4 mb-4">
        <Row>
            <Col>
                {/* --- UI FIX: Used a Card component for a clean, contained look --- */}
                <Card className="shadow-sm">
                    <CardHeader className="bg-light p-3">
                        <Row className="justify-content-between align-items-center gy-3">
                            <Col xs={12} md={5}>
                                <h4 className="header-title mb-0">Masjids Found</h4>
                                <p className="text-muted mb-0 small">Showing results for your search</p>
                            </Col>
                            <Col xs={12} md={7}>
                                <InputGroup>
                                    <Form.Select value={filterBy} onChange={(e) => setFilterBy(e.target.value)} style={{ flex: '0 0 150px' }}>
                                        <option value="name">Filter by Name</option>
                                        <option value="location">Filter by Location</option>
                                    </Form.Select>
                                    <Form.Control type="text" placeholder={`Search by ${filterBy}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </InputGroup>
                            </Col>
                        </Row>
                    </CardHeader>
                    <CardBody>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        ) : (
                            <ReactTable<Masjid>
                                columns={columns}
                                data={masjids}
                                rowsPerPageList={sizePerPageList}
                                tableClass="table-striped table-hover"
                                showPagination
                                pagination={pagination}
                                onPaginationChange={setPagination}
                                pageCount={pageCount}
                                options={{
                                    manualPagination: true,
                                }}
                            />
                        )}
                    </CardBody>
                </Card>
            </Col>
        </Row>
    </div>
  )
}

