import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';

import Breadcrumbs from '../components/Breadcrumbs';
import StatusBadge from '../components/StatusBadge';
import AlertDialog from '../components/AlertDialog';
import { useAuth } from '../components/AuthContext';
import { isMunicipalityUser } from '../utils/lgu';
import cfg from '../../../server/config/domain.js';

const inputClass = 'border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';

const ResolutionFormPage = ({ mode = 'add' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);
    const { barangayId, cityId, provinceId, lguId } = useAuth();
    const municipalityView = isMunicipalityUser(lguId);
    const resolutionId = location.state?.resolution_id;
    const isView = mode === 'view';
    const isEdit = mode === 'edit';

    const [title, setTitle] = useState('');
    const [resolutionDate, setResolutionDate] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [existingAttachment, setExistingAttachment] = useState(null);
    const [removeAttachment, setRemoveAttachment] = useState(false);
    const [status, setStatus] = useState('Saved');
    const [loading, setLoading] = useState(isEdit || isView);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isAlertApproveOpen, setIsAlertApproveOpen] = useState(false);

    useEffect(() => {
        if ((isEdit || isView) && !resolutionId) {
            navigate('/resolution');
            return;
        }
        if (!resolutionId) return;

        const fetchResolution = async () => {
            try {
                const response = await axios.get(
                    `http://${cfg.domainname}:${cfg.serverport}/resolutions/${resolutionId}`,
                    { withCredentials: true }
                );
                const data = response.data;
                setTitle(data.title || '');
                setResolutionDate(String(data.resolution_date || '').slice(0, 10));
                setDescription(data.description || '');
                setStatus(data.status || 'Saved');
                setExistingAttachment(data.attachment_path ? {
                    path: data.attachment_path,
                    name: data.attachment_name || 'Attachment',
                } : null);
            } catch (error) {
                setErrorMessage(error.response?.data?.message || 'Failed to load resolution.');
            } finally {
                setLoading(false);
            }
        };
        fetchResolution();
    }, [isEdit, isView, resolutionId, navigate]);

    const buildPayload = (nextStatus) => {
        const payload = new FormData();
        payload.append('title', title.trim());
        payload.append('resolution_date', resolutionDate);
        payload.append('description', description.trim());
        payload.append('status', nextStatus);
        payload.append('barangay_id', barangayId || '');
        payload.append('city_id', cityId || '');
        payload.append('province_id', provinceId || '');
        payload.append('remove_attachment', removeAttachment ? '1' : '0');
        if (file) payload.append('attachment', file);
        return payload;
    };

    const submitResolution = async (nextStatus) => {
        if (!title.trim() || !resolutionDate) {
            setErrorMessage('Title and date are required.');
            return;
        }

        setSaving(true);
        setErrorMessage('');
        try {
            const payload = buildPayload(nextStatus);
            if (isEdit) {
                await axios.put(
                    `http://${cfg.domainname}:${cfg.serverport}/resolutions/${resolutionId}`,
                    payload,
                    { withCredentials: true }
                );
            } else {
                await axios.post(
                    `http://${cfg.domainname}:${cfg.serverport}/resolutions`,
                    payload,
                    { withCredentials: true }
                );
            }
            navigate('/resolution');
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to save resolution.');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveAttachment = async () => {
        if (isView) return;
        if (existingAttachment && resolutionId) {
            try {
                await axios.delete(
                    `http://${cfg.domainname}:${cfg.serverport}/resolutions/${resolutionId}/attachment`,
                    { withCredentials: true }
                );
            } catch (error) {
                setErrorMessage(error.response?.data?.message || 'Failed to remove attachment.');
                return;
            }
        }
        setExistingAttachment(null);
        setRemoveAttachment(true);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (loading) {
        return <div className="flex-grow p-6 bg-gray-100 text-gray-500">Loading resolution...</div>;
    }

    return (
        <div className="flex-grow p-6 bg-gray-100">
            <Breadcrumbs />
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-500">
                        {isView ? 'View Resolution' : isEdit ? 'Edit Resolution' : 'Add Resolution'}
                    </h1>
                    {(isView || isEdit) && <StatusBadge status={status} />}
                </div>
                <IoClose className="w-6 h-6 cursor-pointer text-gray-500" onClick={() => navigate('/resolution')} />
            </div>

            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

            <div className="bg-white rounded-md p-6 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Title</label>
                        <input
                            type="text"
                            className={inputClass}
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            disabled={isView}
                            placeholder="Resolution title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                        <input
                            type="date"
                            className={inputClass}
                            value={resolutionDate}
                            onChange={(event) => setResolutionDate(event.target.value)}
                            disabled={isView}
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                    <textarea
                        className={`${inputClass} min-h-[140px]`}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        disabled={isView}
                        placeholder="Resolution details"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Attachment (PDF or Word)</label>
                    {!isView && (
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            className={inputClass}
                            onChange={(event) => {
                                setFile(event.target.files[0] || null);
                                setRemoveAttachment(false);
                            }}
                        />
                    )}
                    {(existingAttachment && !removeAttachment) && (
                        <div className="mt-3 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md p-3">
                            <a
                                className="text-sm text-blue-600 hover:text-blue-700"
                                href={`http://${cfg.domainname}:${cfg.serverport}${existingAttachment.path}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {existingAttachment.name}
                            </a>
                            {!isView && (
                                <button
                                    type="button"
                                    className="text-sm text-red-500"
                                    onClick={handleRemoveAttachment}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    )}
                    {file && <p className="text-xs text-gray-400 mt-2">Selected file: {file.name}</p>}
                </div>

                {!isView && (
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => navigate('/resolution')}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => submitResolution('Saved')}
                            className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded hover:bg-blue-50 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => submitResolution('Submitted')}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                )}
                {isView && (
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/resolution')}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Close
                        </button>
                        {municipalityView && status === 'Submitted' && (
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => setIsAlertApproveOpen(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {saving ? 'Approving...' : 'Approve'}
                            </button>
                        )}
                    </div>
                )}
            </div>
            <AlertDialog
                isOpen={isAlertApproveOpen}
                message="Approve this submitted resolution?"
                title="Approve Resolution"
                buttonConfig={[
                    {
                        label: 'Cancel',
                        color: 'bg-gray-200 text-gray-600',
                        action: () => setIsAlertApproveOpen(false),
                    },
                    {
                        label: 'Approve',
                        color: 'bg-green-600 text-white',
                        action: async () => {
                            setSaving(true);
                            setErrorMessage('');
                            try {
                                await axios.put(
                                    `http://${cfg.domainname}:${cfg.serverport}/resolutions/${resolutionId}/approve`,
                                    {},
                                    { withCredentials: true }
                                );
                                setStatus('Approved');
                                setIsAlertApproveOpen(false);
                            } catch (error) {
                                setErrorMessage(error.response?.data?.message || 'Failed to approve resolution.');
                            } finally {
                                setSaving(false);
                            }
                        },
                    },
                ]}
            />
        </div>
    );
};

export default ResolutionFormPage;
