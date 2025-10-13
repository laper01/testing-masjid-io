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
import React, { useState, useEffect, useCallback } from 'react'
import ReactTable from '@/components/Table'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import LocationPicker from '@/components/LocationPicker'
import "leaflet/dist/leaflet.css"; // <-- FIX: ADD THIS IMPORT
import LocationPickerSearch from '@/components/LocationPickerSearch'

// --- Type Definitions ---
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

type BoundingBox = {
  south_west: { latitude: number; longitude: number };
  north_east: { latitude: number; longitude: number };
};

type Filters = {
  name: string;
  bounding_box: BoundingBox | null;
};

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
      <Button variant="outline-success">
        <Link href={`/masjid-detail/${row.original.id}`} passHref>

          <span>
            <IconifyIcon icon="mdi:eye-outline" />
          </span>

        </Link>
      </Button>
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

  const [filters, setFilters] = useState<Filters>({
    name: initialSearchTerm || '',
    bounding_box: null,
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [pageCount, setPageCount] = useState(0)

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedFilters(filters)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }, 800)
    return () => clearTimeout(timerId)
  }, [filters])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({
      page: (pagination.pageIndex + 1).toString(),
      limit: pagination.pageSize.toString(),
    })

    if (debouncedFilters.name) {
      params.append('name', debouncedFilters.name)
    }

    if (debouncedFilters.bounding_box) {
      const bb = debouncedFilters.bounding_box;
      params.append('bounding_box_filter.south_west.latitude', bb.south_west.latitude.toString());
      params.append('bounding_box_filter.south_west.longitude', bb.south_west.longitude.toString());
      params.append('bounding_box_filter.north_east.latitude', bb.north_east.latitude.toString());
      params.append('bounding_box_filter.north_east.longitude', bb.north_east.longitude.toString());
    }

    const url = `/api/masjids?${params.toString()}`

    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch data')
      const result = await response.json()
      setMasjids(result.data || [])
      setPageCount(result.totalPages || 0)
    } catch (err: any) {
      setError(err.message)
      setMasjids([])
      setPageCount(0)
    } finally {
      setLoading(false)
    }
  }, [pagination, debouncedFilters])

  const handleLocationChange = ({ lat, lng }: { lat: number; lng: number }) => {
    const radius = 0.05;
    const newBoundingBox: BoundingBox = {
      south_west: { latitude: lat - radius, longitude: lng - radius },
      north_east: { latitude: lat + radius, longitude: lng + radius },
    };
    setFilters(prev => ({ ...prev, bounding_box: newBoundingBox }));
  };

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="container mt-4 mb-4">
      <Row>
        <Col>
          <Card className="shadow-sm">
            <CardHeader className="bg-light p-3">
              <Row className="justify-content-between align-items-center gy-3">
                <Col xs={12}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search by name..."
                      value={filters.name}
                      onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Button variant="primary" onClick={() => setDebouncedFilters(filters)}>
                      <IconifyIcon icon="mdi:magnify" />
                    </Button>
                  </InputGroup>
                </Col>
              </Row>
            </CardHeader>
            <div className="p-3 border-bottom">
              <h6 className="fw-semibold">
                <IconifyIcon icon="mdi:map-marker-outline" className="me-2" />
                Filter by Location
              </h6>
              <p className="text-muted small mb-2">Click or drag the marker on the map to search for masjids in that area. Results will update automatically.</p>
              <LocationPickerSearch onLocationChange={handleLocationChange} />
              <Button
                variant="outline-secondary"
                size="sm"
                className="mt-3"
                onClick={() => setFilters(prev => ({ ...prev, bounding_box: null }))}
                disabled={!filters.bounding_box}
              >
                Clear Map Filter
              </Button>
            </div>
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