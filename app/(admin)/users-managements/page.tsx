'use client'

import React from 'react';
import PageTitle from '@/components/PageTitle';
import { Button, Modal } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

import { useUserManagement } from '@/hooks/useUserManagement';
import TableUsers from '@/components/user/TableUsers';
import AddEditUserModal from '@/components/user/AddEditUserModal';

export default function UsersManagementPage() {
    const {
        users,
        loading,
        error,
        pagination,
        setPagination,
        pageCount,
        searchTerm,
        setSearchTerm,
        showEditModal,
        showDeleteModal,
        selectedUser,
        isEditable,
        handleShowCreateModal,
        handleShowEditModal,
        handleShowDeleteModal,
        handleCloseModals,
        handleAddUser,
        handleUpdateUser,
        handleDeleteUser
    } = useUserManagement();

    return (
        <>
            <PageTitle title="Users Management" />
            <div className="d-flex justify-content-end">
                <Button variant="success" className="fs-16 flex-centered gap-1 mb-4" onClick={handleShowCreateModal}>
                    <IconifyIcon icon="ic:baseline-person-add" /> Create New User
                </Button>
            </div>
            
            <TableUsers
                users={users}
                loading={loading}
                error={error}
                pagination={pagination}
                setPagination={setPagination}
                pageCount={pageCount}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onEdit={handleShowEditModal}
                onDelete={handleShowDeleteModal}
            />

            {showEditModal && (
                <AddEditUserModal
                    show={showEditModal}
                    isEditable={isEditable}
                    userData={selectedUser}
                    onClose={handleCloseModals}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                />
            )}

            <Modal show={showDeleteModal} onHide={handleCloseModals} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the user: <strong>@{selectedUser?.username}</strong>? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModals}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteUser}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
