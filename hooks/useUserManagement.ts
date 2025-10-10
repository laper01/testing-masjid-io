'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import type { PaginationState } from '@tanstack/react-table';
import { User } from '@/types/auth';


export const useUserManagement = () => {
    // Data and loading states
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Table control states
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [pageCount, setPageCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Modal control states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
    const [isEditable, setIsEditable] = useState(false);

    // Debounce search input to avoid excessive API calls
    useEffect(() => {
        const timerId = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    // Main data fetching function
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
            page: (pagination.pageIndex + 1).toString(),
            limit: pagination.pageSize.toString(),
        });
        if (debouncedSearchTerm) {
            params.append('username', debouncedSearchTerm);
        }

        try {
            const response = await fetch(`/api/user?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch user data.');
            
            const result = await response.json();
            setUsers(result.data || []);
            setPageCount(result.totalPages || 0);
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [pagination, debouncedSearchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // --- Modal Handlers ---
    const handleShowCreateModal = () => {
        setIsEditable(false);
        setSelectedUser({}); // Start with an empty object for a new user
        setShowEditModal(true);
    };

    const handleShowEditModal = (user: User) => {
        setIsEditable(true);
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleShowDeleteModal = (user: User) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleCloseModals = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedUser(null);
    };

    // --- CRUD API Functions ---
    const handleAddUser = async (userData: Partial<User>) => {
        try {
            const response = await fetch('/api/user/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || 'Failed to create user.');
            }
            toast.success('User created successfully!');
            fetchUsers(); // Refresh data
            handleCloseModals();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleUpdateUser = async (userData: Partial<User>) => {
        if (!userData.id) return;
        try {
            const response = await fetch(`/api/user/update/${userData.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || 'Failed to update user.');
            }
            toast.success('User updated successfully!');
            fetchUsers(); // Refresh data
            handleCloseModals();
        } catch (error: any) {
            toast.error(error.message);
        }
    };
    
    const handleDeleteUser = async () => {
        if (!selectedUser?.id) return;
        try {
            const response = await fetch(`/api/user/delete/${selectedUser.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete user.');
            
            toast.success('User deleted successfully!');
            fetchUsers(); // Refresh data
            handleCloseModals();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return {
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
    };
};
