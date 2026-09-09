import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { MdOutlineSms } from 'react-icons/md';

import Breadcrumbs from '../components/Breadcrumbs';
import AlertDialog from '../components/AlertDialog';
import ToastMessage from '../components/ToastMessage';
import { useAuth } from '../components/AuthContext';
import cfg from '../../../server/config/domain.js';

const GROUPS = [
    { value: 'barangay-officials', label: 'Barangay Officials' },
    { value: 'sk-officials', label: 'SK Official' },
    { value: 'pwd', label: 'PWD' },
    { value: 'solo-parent', label: 'Solo Parent' },
    { value: 'senior-citizen', label: 'Senior Citizen' },
    { value: 'all', label: 'All' },
    { value: 'manual', label: 'Manual numbers' },
];

const inputClass = 'border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';

const NotificationAdvisoryPage = () => {
    const { barangayId } = useAuth();
    const [group, setGroup] = useState('barangay-officials');
    const [message, setMessage] = useState('');
    const [manualInput, setManualInput] = useState('');
    const [manualNumbers, setManualNumbers] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [modem, setModem] = useState(null);
    const [loadingRecipients, setLoadingRecipients] = useState(false);
    const [sending, setSending] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [sendSummary, setSendSummary] = useState(null);

    const selectedGroupLabel = GROUPS.find((item) => item.value === group)?.label || group;

    useEffect(() => {
        fetchModemStatus();
    }, []);

    useEffect(() => {
        if (!barangayId) return;
        fetchRecipients();
    }, [barangayId, group, manualNumbers]);

    const fetchModemStatus = async () => {
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/notification/modem-status`,
                { withCredentials: true }
            );
            setModem(response.data);
        } catch (error) {
            setModem({ connected: false, message: error.response?.data?.message || 'Unable to check SIM7600 status' });
        }
    };

    const fetchRecipients = async () => {
        setLoadingRecipients(true);
        setErrorMessage('');
        try {
            const params = group === 'manual' ? { numbers: manualNumbers.join(',') } : {};
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/notification/recipients/${group}/${barangayId}`,
                { params, withCredentials: true }
            );
            setRecipients(response.data.recipients || []);
        } catch (error) {
            setRecipients([]);
            setErrorMessage(error.response?.data?.message || 'Failed to load recipients');
        } finally {
            setLoadingRecipients(false);
        }
    };

    const addManualNumber = () => {
        const value = manualInput.trim();
        if (!value) return;
        if (!manualNumbers.includes(value)) {
            setManualNumbers((prev) => [...prev, value]);
        }
        setManualInput('');
    };

    const validate = () => {
        if (!group) return 'Please select a recipient group.';
        if (!message.trim()) return 'Please enter a notification message.';
        if (group === 'manual' && manualNumbers.length === 0) return 'Add at least one mobile number.';
        if (!recipients.length) return 'No valid mobile numbers found for this group.';
        return null;
    };

    const handleSend = async () => {
        const validationError = validate();
        if (validationError) {
            setErrorMessage(validationError);
            setIsConfirmOpen(false);
            return;
        }

        setSending(true);
        setErrorMessage('');
        try {
            const response = await axios.post(
                `http://${cfg.domainname}:${cfg.serverport}/notification/send`,
                {
                    group,
                    message: message.trim(),
                    barangay_id: barangayId,
                    numbers: group === 'manual' ? manualNumbers : [],
                },
                { withCredentials: true }
            );
            setSendSummary(response.data);
            setToastMessage(response.data.message);
            setShowToast(true);
            if (!response.data.failed) {
                setMessage('');
                if (group === 'manual') setManualNumbers([]);
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to send SMS notification');
        } finally {
            setSending(false);
            setIsConfirmOpen(false);
        }
    };

    const modemLabel = useMemo(() => {
        if (!modem) return 'Checking SIM7600G-H...';
        if (modem.dryRun) return 'SIM7600G-H dry run mode';
        if (modem.connected) return `SIM7600G-H connected${modem.port ? ` (${modem.port})` : ''}`;
        return modem.message || 'SIM7600G-H not connected';
    }, [modem]);

    return (
        <div className="flex-grow p-6 bg-gray-100">
            <Breadcrumbs />
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-500">Notification Advisory</h1>
                <span className={`text-xs px-3 py-1 rounded-full ${modem?.connected ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {modemLabel}
                </span>
            </div>

            {errorMessage && <p className="mb-4 text-sm text-red-500">{errorMessage}</p>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
                    <label className="block mb-2 text-sm font-medium text-gray-500">Recipient group</label>
                    <select
                        value={group}
                        onChange={(e) => {
                            setGroup(e.target.value);
                            setSendSummary(null);
                        }}
                        className={`${inputClass} mb-4`}
                    >
                        {GROUPS.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>

                    {group === 'manual' && (
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-500">Add mobile number</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addManualNumber();
                                        }
                                    }}
                                    placeholder="09171234567"
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={addManualNumber}
                                    className="bg-blue-500 text-white text-sm py-2 px-4 rounded-md"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {manualNumbers.map((number) => (
                                    <span key={number} className="flex items-center gap-2 bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">
                                        {number}
                                        <IoCloseCircleOutline
                                            className="w-4 h-4 cursor-pointer"
                                            onClick={() => setManualNumbers((prev) => prev.filter((item) => item !== number))}
                                        />
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <label className="block mb-2 text-sm font-medium text-gray-500">Notification message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={8}
                        maxLength={1000}
                        placeholder="Type the barangay advisory to send via SMS"
                        className={`${inputClass} resize-none`}
                    />
                    <p className="text-xs text-gray-400 mt-2 mb-6">
                        {message.length} characters. Standard SMS is 160 characters; longer text may send as multiple messages.
                    </p>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            disabled={sending}
                            onClick={() => {
                                const validationError = validate();
                                if (validationError) {
                                    setErrorMessage(validationError);
                                    return;
                                }
                                setErrorMessage('');
                                setIsConfirmOpen(true);
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            <MdOutlineSms className="w-4 h-4" />
                            {sending ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-500 mb-1">{selectedGroupLabel}</h2>
                    <p className="text-sm text-gray-400 mb-4">
                        {loadingRecipients ? 'Loading recipients...' : `${recipients.length} barangay-level recipient${recipients.length === 1 ? '' : 's'} with a valid number`}
                    </p>
                    <div className="max-h-[420px] overflow-y-auto">
                        {recipients.length > 0 ? recipients.map((recipient) => (
                            <div key={recipient.phone} className="border-b border-gray-100 py-2 last:border-b-0">
                                <p className="text-sm text-gray-600">{recipient.name}</p>
                                <p className="text-xs text-gray-400">{recipient.phone}</p>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-400">No recipients yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {sendSummary && (
                <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
                    <h2 className="text-lg font-semibold text-gray-500 mb-2">Last send result</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Sent {sendSummary.sent} of {sendSummary.total}. Failed: {sendSummary.failed}.
                    </p>
                    <div className="max-h-56 overflow-y-auto text-sm">
                        {(sendSummary.results || []).map((item) => (
                            <div key={`${item.phone}-${item.status}`} className="flex justify-between border-b border-gray-100 py-2">
                                <span className="text-gray-600">{item.name} · {item.phone}</span>
                                <span className={item.status === 'failed' ? 'text-red-500' : 'text-green-600'}>
                                    {item.status}{item.error ? ` (${item.error})` : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <AlertDialog
                isOpen={isConfirmOpen}
                title="Send SMS advisory"
                message={`Send this message to ${recipients.length} ${selectedGroupLabel} recipient${recipients.length === 1 ? '' : 's'} via SIM7600G-H?`}
                buttonConfig={[
                    { label: 'Cancel', color: 'bg-gray-200 text-gray-600', action: () => setIsConfirmOpen(false) },
                    { label: sending ? 'Sending...' : 'Yes, Send', color: 'bg-blue-600 text-white', action: handleSend },
                ]}
            />

            <ToastMessage
                message={toastMessage}
                variant="default"
                isVisible={showToast}
                duration={3000}
                onClose={() => setShowToast(false)}
            />
        </div>
    );
};

export default NotificationAdvisoryPage;
