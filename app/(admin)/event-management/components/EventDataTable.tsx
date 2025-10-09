'use client'

import React, { useState, useMemo } from 'react';
import { Button, ButtonGroup, Spinner, Alert, Modal, Card, CardBody, CardHeader, Row, Col } from 'react-bootstrap';
import ReactTable from '@/components/Table';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { EventType } from '@/types/event.types';

// Define the props the component will accept
type EventDataTableProps = {
  events: EventType[];
  onEdit: (id: string) => void; // Function to open the edit modal
  onDelete: (event: EventType) => void; // Function to open the delete confirmation
};

const sizePerPageList = [5, 10, 20, 50];

export default function EventDataTable({ events, onEdit, onDelete }: EventDataTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo<ColumnDef<EventType>[]>(
    () => [
      {
        header: 'Event Name',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div>
            <h5 className="m-0">{row.original.name}</h5>
            <p className="m-0 text-muted fs-13">{row.original.description}</p>
          </div>
        ),
      },
      {
        header: 'Start Time',
        accessorKey: 'startTime',
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString(),
      },
      {
        header: 'End Time',
        accessorKey: 'endTime',
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <ButtonGroup size="sm">
            {/* This button now calls the onEdit prop with the event ID */}
            <Button variant="outline-primary" onClick={() => onEdit(row.original.id)}>
              <IconifyIcon icon="ri-edit-box-line" /> Edit
            </Button>
            {/* This button calls the onDelete prop with the full event object */}
            <Button variant="outline-danger" onClick={() => onDelete(row.original)}>
              <IconifyIcon icon="ri-delete-bin-line" /> Delete
            </Button>
          </ButtonGroup>
        ),
      },
    ],
    [onEdit, onDelete] // Add dependencies
  );

  return (
    <Card>
       <CardHeader>
            <h4 className="header-title">Event List</h4>
            <p className="text-muted mb-0">Browse and manage all scheduled events.</p>
       </CardHeader>
       <CardBody>
            <ReactTable<EventType>
                columns={columns}
                data={events}
                rowsPerPageList={sizePerPageList}
                tableClass="table-striped"
                showPagination
                pagination={pagination}
                onPaginationChange={setPagination}
                pageCount={Math.ceil(events.length / pagination.pageSize)}
                options={{ manualPagination: false }} // Use built-in pagination
            />
       </CardBody>
    </Card>
  );
}
