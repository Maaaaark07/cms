import React, { useEffect, useState } from 'react';
import axios from 'axios';
import cfg from '../../../server/config/domain.js';
import { GrEdit } from 'react-icons/gr';
import { FaRegTrashAlt } from 'react-icons/fa';
import RoleModal from './RoleModal.jsx';
import AlertDialog from './AlertDialog.jsx';
import ToastMessage from './ToastMessage.jsx';

const RoleManagementTab = ({ barangayId, lguTypeId }) => {
    const [roles, setRoles] = useState([]);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [isAlertDeleteOpen, setIsAlertDeleteOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [showDeleteToast, setShowDeleteToast] = useState(false);

    useEffect(() => {
        fetchPages();
    }, []);

    useEffect(() => {
        if (barangayId) {
            fetchRoles();
        }
    }, [barangayId, lguTypeId]);

    const fetchPages = async () => {
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/user/pages`,
                { withCredentials: true }
            );
            setPages(response.data?.data || []);
        } catch (err) {
            console.error('Error fetching pages:', err);
        }
    };

    const fetchRoles = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/user/app-roles`,
                {
                    params: { barangay_id: barangayId, lgu_type_id: lguTypeId },
                    withCredentials: true,
                }
            );
            setRoles(response.data?.data || []);
        } catch (err) {
            console.error('Error fetching roles:', err);
            setError('Failed to fetch roles. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const pageLabel = (key) => pages.find((page) => page.key === key)?.label || key;

    const handleOpenAdd = () => {
        setEditingRole(null);
        setModalError('');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (role) => {
        setEditingRole(role);
        setModalError('');
        setIsModalOpen(true);
    };

    const handleSaveRole = async ({ role_name, description, pages: selectedPages }) => {
        try {
            const payload = {
                role_name,
                description,
                pages: selectedPages,
                barangay_id: barangayId,
                lgu_type_id: lguTypeId,
            };

            if (editingRole) {
                await axios.put(
                    `http://${cfg.domainname}:${cfg.serverport}/user/app-roles/${editingRole.role_id}`,
                    payload,
                    { withCredentials: true }
                );
                setToastMessage('Role updated successfully');
            } else {
                await axios.post(
                    `http://${cfg.domainname}:${cfg.serverport}/user/app-roles`,
                    payload,
                    { withCredentials: true }
                );
                setToastMessage('Role added successfully');
            }

            setIsModalOpen(false);
            setEditingRole(null);
            setShowToast(true);
            fetchRoles();
        } catch (err) {
            console.error('Error saving role:', err);
            setModalError(err.response?.data?.error || 'Failed to save role. Please try again.');
        }
    };

    const handleDeleteRole = async () => {
        if (!selectedDeleteId) return;
        try {
            await axios.delete(
                `http://${cfg.domainname}:${cfg.serverport}/user/app-roles/${selectedDeleteId}`,
                { withCredentials: true }
            );
            setShowDeleteToast(true);
            fetchRoles();
        } catch (err) {
            console.error('Error deleting role:', err);
            setError(err.response?.data?.error || 'Failed to delete role.');
        } finally {
            setSelectedDeleteId(null);
        }
    };

    return (
        <div>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="mb-6 flex justify-end">
                <button
                    className="bg-blue-500 text-white rounded-full px-6 py-2 shadow hover:bg-blue-600 transition duration-200"
                    onClick={handleOpenAdd}
                >
                    + Add Role
                </button>
            </div>

            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden text-sm">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="text-left p-4 font-semibold text-gray-800">Role</th>
                                <th className="text-left p-4 font-semibold text-gray-800">Description</th>
                                <th className="text-left p-4 font-semibold text-gray-800">Pages</th>
                                <th className="text-center p-4 font-semibold text-gray-800">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((role) => (
                                <tr key={role.role_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-700 border-b">{role.role_name}</td>
                                    <td className="px-4 py-3 text-gray-700 border-b">{role.description || '—'}</td>
                                    <td className="px-4 py-3 text-gray-700 border-b">
                                        {role.pages
                                            .filter((key) => key !== 'home')
                                            .map(pageLabel)
                                            .join(', ') || 'Dashboard only'}
                                    </td>
                                    <td className="p-3 text-gray-500 flex items-center border-b justify-center gap-2">
                                        <div
                                            className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer"
                                            onClick={() => handleOpenEdit(role)}
                                        >
                                            <GrEdit className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div
                                            className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer"
                                            onClick={() => {
                                                setSelectedDeleteId(role.role_id);
                                                setIsAlertDeleteOpen(true);
                                            }}
                                        >
                                            <FaRegTrashAlt className="w-5 h-5 text-red-500" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {roles.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-4 py-3 text-center text-gray-500">
                                        No roles found. Add a role and assign the pages it can access.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <RoleModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingRole(null);
                    setModalError('');
                }}
                onSubmit={handleSaveRole}
                pages={pages}
                role={editingRole}
                error={modalError}
            />

            <ToastMessage
                message={toastMessage}
                variant="default"
                isVisible={showToast}
                duration={3000}
                onClose={() => setShowToast(false)}
            />
            <ToastMessage
                message="Role deleted successfully"
                variant="delete"
                isVisible={showDeleteToast}
                duration={3000}
                onClose={() => setShowDeleteToast(false)}
            />
            <AlertDialog
                isOpen={isAlertDeleteOpen}
                message="Are you sure you want to delete this role? Users must be unassigned from it first."
                title="Delete Confirmation"
                buttonConfig={[
                    {
                        label: 'Cancel',
                        color: 'bg-gray-200 text-gray-600',
                        action: () => {
                            setIsAlertDeleteOpen(false);
                            setSelectedDeleteId(null);
                        },
                    },
                    {
                        label: 'Yes, Delete',
                        color: 'bg-red-600 text-white',
                        action: async () => {
                            await handleDeleteRole();
                            setIsAlertDeleteOpen(false);
                        },
                    },
                ]}
            />
        </div>
    );
};

export default RoleManagementTab;
