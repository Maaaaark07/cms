import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GrEdit } from 'react-icons/gr';
import { FaRegEye, FaRegTrashAlt, FaCheck } from 'react-icons/fa';
import { IoPersonAddOutline } from 'react-icons/io5';

import Breadcrumbs from '../components/Breadcrumbs';
import Pagination from '../components/Pagination';
import Search from '../components/Search';
import StatusBadge from '../components/StatusBadge';
import AlertDialog from '../components/AlertDialog';
import ToastMessage from '../components/ToastMessage';
import Loader from '../components/Loader';
import { useAuth } from '../components/AuthContext';
import { useDateFormatter } from '../hooks/useDateFormatter';
import { isMunicipalityUser } from '../utils/lgu';
import cfg from '../../../server/config/domain.js';

const ResolutionPage = () => {
    const navigate = useNavigate();
    const { barangayId, cityId, lguId } = useAuth();
    const { formatIncidentDate } = useDateFormatter();
    const municipalityView = isMunicipalityUser(lguId);

    const [resolutions, setResolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [selectedApproveId, setSelectedApproveId] = useState(null);
    const [isAlertDeleteOpen, setIsAlertDeleteOpen] = useState(false);
    const [isAlertApproveOpen, setIsAlertApproveOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const fetchResolutions = async () => {
        setLoading(true);
        setError('');
        try {
            const url = municipalityView
                ? `http://${cfg.domainname}:${cfg.serverport}/resolutions/city/${cityId}`
                : `http://${cfg.domainname}:${cfg.serverport}/resolutions`;
            const response = await axios.get(url, {
                withCredentials: true,
                params: municipalityView ? {} : { barangay_id: barangayId },
            });
            setResolutions(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load resolutions.');
            setResolutions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (municipalityView && !cityId) return;
        if (!municipalityView && !barangayId) return;
        fetchResolutions();
    }, [barangayId, cityId, municipalityView]);

    const filtered = resolutions.filter((item) => {
        const haystack = `${item.title || ''} ${item.barangay || ''} ${item.status || ''}`.toLowerCase();
        return haystack.includes(searchQuery.toLowerCase());
    });
    const totalPages = Math.ceil((filtered.length || 0) / itemsPerPage) || 1;
    const displayed = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleApprove = async () => {
        try {
            await axios.put(
                `http://${cfg.domainname}:${cfg.serverport}/resolutions/${selectedApproveId}/approve`,
                {},
                { withCredentials: true }
            );
            setToastMessage('Resolution approved successfully.');
            setShowToast(true);
            setSelectedApproveId(null);
            fetchResolutions();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve resolution.');
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(
                `http://${cfg.domainname}:${cfg.serverport}/resolutions/${selectedDeleteId}`,
                { withCredentials: true }
            );
            setToastMessage('Resolution deleted successfully.');
            setShowToast(true);
            setSelectedDeleteId(null);
            fetchResolutions();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete resolution.');
        }
    };

    if (loading) return <Loader type="block" />;

    return (
        <div className="flex-grow p-6 bg-gray-100">
            <Breadcrumbs />
            <h1 className="text-2xl font-bold text-gray-500 mb-6">
                {municipalityView ? 'Submitted Resolutions' : 'Resolution'}
            </h1>
            <div className="flex items-center justify-between mb-6">
                <div className="relative max-w-96 w-full">
                    <Search
                        searchQuery={searchQuery}
                        onSearchChange={(event) => {
                            setSearchQuery(event.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder={municipalityView ? 'Search title or barangay' : 'Search title or status'}
                    />
                </div>
                {!municipalityView && (
                    <button
                        className="bg-blue-600 text-white px-5 py-3 text-sm flex items-center gap-2 rounded-full"
                        onClick={() => navigate('/resolution/add')}
                    >
                        <IoPersonAddOutline className="w-4 h-4 text-white font-bold" />
                        Add Resolution
                    </button>
                )}
            </div>
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}
            <div className="overflow-x-auto rounded-lg mt-4">
                <table className="min-w-full bg-white shadow-md overflow-hidden text-sm">
                    <thead className="bg-gray-200">
                        <tr>
                            {municipalityView && <th className="text-left p-3 font-semibold text-gray-700">Barangay</th>}
                            <th className="text-left p-3 font-semibold text-gray-700">Title</th>
                            <th className="text-left p-3 font-semibold text-gray-700">Date</th>
                            <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                            <th className="text-center p-3 font-semibold text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayed.length > 0 ? displayed.map((item) => (
                            <tr key={item.resolution_id} className="border-b hover:bg-gray-100 even:bg-gray-50">
                                {municipalityView && <td className="p-3 text-gray-500">{item.barangay || 'N/A'}</td>}
                                <td className="p-3 text-gray-500">{item.title}</td>
                                <td className="p-3 text-gray-500">{formatIncidentDate(item.resolution_date)}</td>
                                <td className="p-3 text-gray-500"><StatusBadge status={item.status} /></td>
                                <td className="p-3 text-gray-500 flex items-center justify-center gap-2">
                                    {!municipalityView && item.status !== 'Approved' && (
                                        <div
                                            className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer"
                                            onClick={() => navigate('/resolution/edit', {
                                                state: { resolution_id: item.resolution_id },
                                            })}
                                        >
                                            <GrEdit className="w-5 h-5 text-gray-500" />
                                        </div>
                                    )}
                                    <div
                                        className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer"
                                        onClick={() => navigate('/resolution/view', {
                                            state: { resolution_id: item.resolution_id },
                                        })}
                                    >
                                        <FaRegEye className="w-5 h-5 text-gray-500" />
                                    </div>
                                    {municipalityView && item.status === 'Submitted' && (
                                        <button
                                            type="button"
                                            className="bg-green-600 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-green-700"
                                            onClick={() => {
                                                setSelectedApproveId(item.resolution_id);
                                                setIsAlertApproveOpen(true);
                                            }}
                                        >
                                            <FaCheck className="w-3 h-3" />
                                            Approve
                                        </button>
                                    )}
                                    {!municipalityView && item.status !== 'Submitted' && item.status !== 'Approved' && (
                                        <div
                                            className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer"
                                            onClick={() => {
                                                setSelectedDeleteId(item.resolution_id);
                                                setIsAlertDeleteOpen(true);
                                            }}
                                        >
                                            <FaRegTrashAlt className="w-5 h-5 text-red-500" />
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={municipalityView ? 5 : 4} className="p-4 text-center text-sm text-gray-500">
                                    No Data Available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={(value) => {
                    setItemsPerPage(value);
                    setCurrentPage(1);
                }}
            />
            <AlertDialog
                isOpen={isAlertApproveOpen}
                message="Approve this submitted resolution?"
                title="Approve Resolution"
                buttonConfig={[
                    {
                        label: 'Cancel',
                        color: 'bg-gray-200 text-gray-600',
                        action: () => {
                            setIsAlertApproveOpen(false);
                            setSelectedApproveId(null);
                        },
                    },
                    {
                        label: 'Approve',
                        color: 'bg-green-600 text-white',
                        action: async () => {
                            await handleApprove();
                            setIsAlertApproveOpen(false);
                        },
                    },
                ]}
            />
            <AlertDialog
                isOpen={isAlertDeleteOpen}
                message="Are you sure you want to delete this saved resolution? This action cannot be undone."
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
                            await handleDelete();
                            setIsAlertDeleteOpen(false);
                        },
                    },
                ]}
            />
            <ToastMessage
                message={toastMessage}
                isVisible={showToast}
                duration={3000}
                onClose={() => setShowToast(false)}
            />
        </div>
    );
};

export default ResolutionPage;
