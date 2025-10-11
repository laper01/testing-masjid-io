'use client';

import { Card, CardBody, CardHeader, Col, Row, Button, ButtonGroup, Spinner, Modal, Alert } from 'react-bootstrap';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactTable from '@/components/Table';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { toast } from 'react-hot-toast';
import type { AdhanFile, Masjid, Preference } from '@/types/adhan.type';

import UpdateAdhanModal from './UpdateAdhanForm';
import CreateAdhanModal from './CreateAdhanForm';
import PreferenceManagerModalTable from './PreferenceManagerModaltable';


const sizePerPageList = [5, 10, 20, 50];

export default function AdhanManagementTable() {
    // State for table data
    const [adhans, setAdhans] = useState<AdhanFile[]>([]);
    const [masjidMap, setMasjidMap] = useState<Map<string, Masjid>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [pageCount, setPageCount] = useState(0);

    // State for preferences
    const [preference, setPreference] = useState<Preference | null>(null);

    // State for modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPreferenceModal, setShowPreferenceModal] = useState(false); 
    const [selectedAdhan, setSelectedAdhan] = useState<AdhanFile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Main data fetching function
    const fetchPageData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [adhanRes, prefRes] = await Promise.all([
                fetch(`/api/adhan?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`),
                fetch('/api/preferences', { cache: 'no-store' })
            ]);

            if (!adhanRes.ok) throw new Error('Failed to fetch Adhan files.');
            const adhanResult = await adhanRes.json();
            const fetchedAdhans: AdhanFile[] = adhanResult.data?.adhanFiles || [];
            setAdhans(fetchedAdhans);
            setPageCount(Math.ceil((adhanResult.data?.totalCount || 0) / pagination.pageSize));

            if (prefRes.ok) {
                const prefResult = await prefRes.json();
                const prefs: Preference[] = prefResult.preferences;

                if (prefs && prefs.length > 0) {
                    const sortedPrefs = [...prefs].sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime());
                    setPreference(sortedPrefs[0]);
                } else {
                    setPreference(null);
                }
            } else {
                console.error("Could not fetch user preferences.");
            }

            const uniqueMasjidIds = [...new Set(fetchedAdhans.map(adhan => adhan.masjidId))];
            if (uniqueMasjidIds.length > 0) {
                const masjidPromises = uniqueMasjidIds.map(id =>
                    fetch(`/api/masjids/${id}`).then(res => res.ok ? res.json() : null)
                );
                const masjidResults = await Promise.all(masjidPromises);
                const newMasjidMap = new Map<string, Masjid>();
                masjidResults.forEach((masjid: Masjid | null) => {
                    if (masjid?.id) newMasjidMap.set(masjid.id, masjid);
                });
                setMasjidMap(newMasjidMap);
            }
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    // --- Modal Handlers ---
    const handleShowUpdateModal = (adhan: AdhanFile) => {
        setSelectedAdhan(adhan);
        setShowUpdateModal(true);
    };

    const handleShowDeleteModal = (adhan: AdhanFile) => {
        setSelectedAdhan(adhan);
        setShowDeleteModal(true);
    };

    const handleHideModals = () => {
        setShowCreateModal(false);
        setShowUpdateModal(false);
        setShowDeleteModal(false);
        setShowPreferenceModal(false); 
        setSelectedAdhan(null);
    };

    const handleSuccess = () => {
        handleHideModals();
        fetchPageData();
    };

    // --- Delete Handler ---
    const handleDelete = async () => {
        if (!selectedAdhan) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/adhan/${selectedAdhan.id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete adhan file.');
            }
            toast.success(`Adhan file "${selectedAdhan.name}" deleted successfully!`);
            handleSuccess();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Table Column Definitions (UPDATED) ---
    const columns: ColumnDef<AdhanFile>[] = useMemo(() => [
        { 
            header: 'Adhan Name', 
            accessorKey: 'name',
            cell: ({ row }) => {
                // The star is now just a visual indicator
                const isCurrentPreference = preference?.adhanFileId === row.original.id;
                return (
                    <div className="d-flex align-items-center">
                        {row.original.name}
                        {isCurrentPreference && (
                            <IconifyIcon icon="ri-star-fill" className="ms-2 text-warning" />
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Masjid',
            accessorKey: 'masjidId',
            cell: ({ row }) => {
                const masjid = masjidMap.get(row.original.masjidId);
                if (!masjid) return <Spinner animation="border" size="sm" />;
                return (
                    <div>
                        <h5 className="m-0">{masjid.name}</h5>
                        <p className="m-0 text-muted fs-13">{masjid.location}</p>
                    </div>
                );
            },
        },
        {
            header: 'Adhan Sound',
            accessorKey: 'url',
            cell: ({ getValue }) => <audio controls src={getValue() as string} style={{ width: '250px' }} />,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                // --- FIX: The star button has been removed from the actions ---
                <ButtonGroup size="sm">
                    <Button variant="outline-primary" onClick={() => handleShowUpdateModal(row.original)}>
                        <IconifyIcon icon="ri-edit-box-line" />
                    </Button>
                    <Button variant="outline-danger" onClick={() => handleShowDeleteModal(row.original)}>
                        <IconifyIcon icon="ri-delete-bin-line" />
                    </Button>
                </ButtonGroup>
            ),
        },
    ], [masjidMap, preference]);

    return (
        <>
            <Row>
                <Col>
                    <Card>
                        <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <h4 className="header-title">Adhan Sound Management</h4>
                                <p className="text-muted mb-0">Manage and set default Adhan sounds.</p>
                            </div>
                            <ButtonGroup>
                               <Button variant="light" onClick={() => setShowPreferenceModal(true)}>
                                    <IconifyIcon icon="ri-settings-3-line" /> Manage Preferences
                                </Button>
                                <Button variant="success" onClick={() => setShowCreateModal(true)}>
                                    <IconifyIcon icon="ic:baseline-add" /> Add New Adhan
                                </Button>
                            </ButtonGroup>
                        </CardHeader>
                        <CardBody>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {loading ? (
                                <div className="text-center p-5">
                                    <Spinner animation="border" />
                                    <p className="mt-2">Loading Adhan Data...</p>
                                </div>
                            ) : (
                                <ReactTable<AdhanFile>
                                    columns={columns}
                                    data={adhans}
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

            {/* Modals */}
            <CreateAdhanModal show={showCreateModal} onHide={handleHideModals} onSuccess={handleSuccess} />
            
            <PreferenceManagerModalTable show={showPreferenceModal} onHide={handleHideModals} onSuccess={handleSuccess} />
            
            {selectedAdhan && (
                <UpdateAdhanModal
                    show={showUpdateModal}
                    onHide={handleHideModals}
                    onSuccess={handleSuccess}
                    adhanId={selectedAdhan.id}
                />
            )}

            <Modal show={showDeleteModal} onHide={handleHideModals} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the Adhan file: <strong>{selectedAdhan?.name}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleHideModals} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? <Spinner as="span" animation="border" size="sm" /> : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

