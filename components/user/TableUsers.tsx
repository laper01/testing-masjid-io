'use client'

import React, { useMemo } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Button, ButtonGroup, Spinner, Form, InputGroup, Alert } from 'react-bootstrap';
import ReactTable from '@/components/Table';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { User } from '@/types/auth';


type TableUsersProps = {
    users: User[];
    loading: boolean;
    error: string | null;
    pagination: PaginationState;
    setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
    pageCount: number;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
};

const sizePerPageList = [5, 10, 20, 50];

export default function TableUsers({ users, loading, error, pagination, setPagination, pageCount, searchTerm, setSearchTerm, onEdit, onDelete }: TableUsersProps) {

    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                header: 'User',
                accessorKey: 'username',
                cell: ({ row }) => (
                    <div>
                        <h5 className="m-0">{row.original.username}</h5>
                        <p className="m-0 text-muted fs-13">{row.original.email}</p>
                    </div>
                ),
            },
            {
                header: 'Role',
                accessorKey: 'role',
                cell: ({ getValue }) => {
                    const role = getValue<string>() || '';
                    return <span className="text-capitalize">{role.replace(/_/g, ' ')}</span>;
                },
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <ButtonGroup size="sm">
                        <Button variant="outline-primary" onClick={() => onEdit(row.original)}>
                            <IconifyIcon icon="ri-edit-box-line" />
                        </Button>
                        <Button variant="outline-danger" onClick={() => onDelete(row.original)}>
                            <IconifyIcon icon="ri-delete-bin-line" />
                        </Button>
                    </ButtonGroup>
                ),
            },
        ],
        [onEdit, onDelete]
    );

    return (
        <Row>
            <Col>
                <Card>
                    <CardHeader>
                        <Row className="justify-content-between align-items-center gy-3">
                            <Col md={5}>
                                <h4 className="header-title">User Data Management</h4>
                                <p className="text-muted mb-0">Search, manage, and delete user accounts.</p>
                            </Col>
                            <Col md={5}>
                                <InputGroup>
                                    <InputGroup.Text><IconifyIcon icon="ri-search-line" /></InputGroup.Text>
                                    <Form.Control type="text" placeholder="Search by username..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </InputGroup>
                            </Col>
                        </Row>
                    </CardHeader>
                    <CardBody>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {loading ? (
                            <div className="text-center p-5"><Spinner animation="border" /></div>
                        ) : (
                            <ReactTable<User>
                                columns={columns}
                                data={users}
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
    );
}
