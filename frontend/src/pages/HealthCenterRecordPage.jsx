import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoArrowBack, IoSearch } from 'react-icons/io5';

import Breadcrumbs from '../components/Breadcrumbs';
import ResidentHealthCard from '../components/ResidentHealthCard.jsx';
import SearchModal from '../components/SearchModal.jsx';
import AddResidentModal from '../components/AddResidentModal.jsx';
import AlertDialog from '../components/AlertDialog.jsx';
import ToastMessage from '../components/ToastMessage.jsx';
import { useAuth } from '../components/AuthContext';
import { getResidentFullName } from '../components/ResidentHealthCard.jsx';
import cfg from '../../../server/config/domain.js';

const emptyForm = {
    visit_date: '',
    blood_pressure: '',
    heart_rate: '',
    temperature: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    height_cm: '',
    weight_kg: '',
    bmi: '',
    blood_sugar: '',
    chief_complaint: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    medication: '',
    notes: '',
};

const toDateTimeLocal = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
};

const computeBmi = (heightCm, weightKg) => {
    const height = Number(heightCm);
    const weight = Number(weightKg);
    if (!height || !weight) return '';
    const meters = height / 100;
    return (weight / (meters * meters)).toFixed(1);
};

const inputClass = 'border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100';

const HealthCenterRecordPage = ({ mode, isMainPage = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { barangayId } = useAuth();

    const [resident, setResident] = useState(location.state?.resident || null);
    const [formData, setFormData] = useState({
        ...emptyForm,
        visit_date: toDateTimeLocal(new Date()),
    });
    const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
    const [isAddResidentOpen, setIsAddResidentOpen] = useState(false);
    const [addResidentSearch, setAddResidentSearch] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCurrent, setIsCurrent] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState('Add');
    const [toastMessage, setToastMessage] = useState('');

    const recordId = location.state?.recordId;
    const isView = mode === 'view' || (mode === 'edit' && !isCurrent);
    const isEdit = mode === 'edit' && isCurrent;
    const title = isMainPage
        ? 'Health Center'
        : isView
            ? 'View Medical Record'
            : isEdit
                ? 'Edit Current Medical Record'
                : 'Add Medical Record';

    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && recordId) {
            fetchRecord();
        }
    }, [mode, recordId]);

    useEffect(() => {
        const type = location.state?.healthToastType;
        if (isMainPage && type) {
            setToastType(type);
            setToastMessage(`Medical record ${type === 'Add' ? 'added' : 'updated'} successfully!`);
            setShowToast(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, isMainPage, navigate]);

    const fetchRecord = async () => {
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/health/record/${recordId}`,
                { withCredentials: true }
            );
            const record = response.data.record;
            if (response.data.resident) setResident(response.data.resident);
            setIsCurrent(Boolean(record.is_current));
            setFormData({
                visit_date: toDateTimeLocal(record.visit_date),
                blood_pressure: record.blood_pressure || '',
                heart_rate: record.heart_rate ?? '',
                temperature: record.temperature ?? '',
                respiratory_rate: record.respiratory_rate ?? '',
                oxygen_saturation: record.oxygen_saturation ?? '',
                height_cm: record.height_cm ?? '',
                weight_kg: record.weight_kg ?? '',
                bmi: record.bmi ?? '',
                blood_sugar: record.blood_sugar ?? '',
                chief_complaint: record.chief_complaint || '',
                symptoms: record.symptoms || '',
                diagnosis: record.diagnosis || '',
                treatment: record.treatment || '',
                medication: record.medication || '',
                notes: record.notes || '',
            });
        } catch (error) {
            console.error(error);
            setErrorMessage('Failed to load medical record.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const next = { ...prev, [name]: value };
            if (name === 'height_cm' || name === 'weight_kg') {
                next.bmi = computeBmi(
                    name === 'height_cm' ? value : next.height_cm,
                    name === 'weight_kg' ? value : next.weight_kg
                );
            }
            return next;
        });
    };

    const validate = () => {
        if (!resident?.resident_id) return 'Please select a resident.';
        if (!formData.visit_date) return 'Visit date is required.';
        if (!formData.chief_complaint.trim()) return 'Chief complaint is required.';
        return null;
    };

    const handleSubmit = async () => {
        const validationError = validate();
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setLoading(true);
        setErrorMessage('');
        const payload = {
            ...formData,
            resident_id: resident.resident_id,
            barangay_id: barangayId || resident.barangay_id,
            visit_date: formData.visit_date || null,
        };

        try {
            if (isEdit) {
                await axios.put(
                    `http://${cfg.domainname}:${cfg.serverport}/health/record/${recordId}`,
                    payload,
                    { withCredentials: true }
                );
                navigate('/health-center', { state: { healthToastType: 'Update' } });
            } else {
                await axios.post(
                    `http://${cfg.domainname}:${cfg.serverport}/health/record`,
                    payload,
                    { withCredentials: true }
                );
                if (isMainPage) {
                    setFormData({
                        ...emptyForm,
                        visit_date: toDateTimeLocal(new Date()),
                    });
                    setToastType('Add');
                    setToastMessage('Medical record added successfully!');
                    setShowToast(true);
                } else {
                    navigate('/health-center', { state: { healthToastType: 'Add' } });
                }
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to save medical record.');
        } finally {
            setLoading(false);
            setIsConfirmOpen(false);
        }
    };

    const vitals = useMemo(() => ([
        { name: 'blood_pressure', label: 'Blood Pressure', placeholder: '120/80', type: 'text' },
        { name: 'heart_rate', label: 'Heart Rate (bpm)', placeholder: '72', type: 'number' },
        { name: 'temperature', label: 'Temperature (°C)', placeholder: '36.5', type: 'number', step: '0.1' },
        { name: 'respiratory_rate', label: 'Respiratory Rate', placeholder: '16', type: 'number' },
        { name: 'oxygen_saturation', label: 'Oxygen Saturation (%)', placeholder: '98', type: 'number', step: '0.1' },
        { name: 'blood_sugar', label: 'Blood Sugar (mg/dL)', placeholder: '90', type: 'number', step: '0.1' },
        { name: 'height_cm', label: 'Height (cm)', placeholder: '165', type: 'number', step: '0.1' },
        { name: 'weight_kg', label: 'Weight (kg)', placeholder: '60', type: 'number', step: '0.1' },
    ]), []);

    return (
        <div className="flex-grow p-6 bg-gray-100">
            <Breadcrumbs />
            {!isMainPage && (
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 mb-4"
                >
                    <IoArrowBack className="w-4 h-4" />
                    Back
                </button>
            )}
            <h1 className="text-2xl font-bold text-gray-500 mb-4">{title}</h1>

            {isMainPage && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 max-w-3xl w-full mb-6">
                    <div className="relative flex-grow">
                        <IoSearch className="w-5 h-5 text-gray-400 absolute left-3 top-[14px]" />
                        <input
                            type="text"
                            readOnly
                            value={resident ? getResidentFullName(resident) : ''}
                            onClick={() => setIsResidentModalOpen(true)}
                            placeholder="Search resident name or contact"
                            className="rounded-full outline-none text-sm border-2 border-gray-200 text-gray-500 py-3 px-10 w-full cursor-pointer"
                        />
                    </div>
                    <button
                        type="button"
                        className="bg-blue-600 text-white px-5 py-3 text-sm rounded-full whitespace-nowrap hover:bg-blue-700"
                        onClick={() => {
                            setAddResidentSearch('');
                            setIsAddResidentOpen(true);
                        }}
                    >
                        + Add New Resident
                    </button>
                </div>
            )}

            {mode === 'edit' && !isCurrent && (
                <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                    This is an archived record. Only the current medical record can be edited.
                </p>
            )}

            {errorMessage && <p className="mb-4 text-sm text-red-500">{errorMessage}</p>}

            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-500">Resident Information</h2>
                    <div className="flex items-center gap-2">
                        {resident && (
                            <button
                                type="button"
                                className="bg-gray-200 text-gray-600 px-4 py-2 text-sm rounded-full"
                                onClick={() => navigate('/health-center/history', { state: { resident } })}
                            >
                                View History
                            </button>
                        )}
                        {mode === 'add' && !isMainPage && (
                            <button
                                type="button"
                                className="bg-blue-600 text-white px-4 py-2 text-sm flex items-center gap-2 rounded-full"
                                onClick={() => setIsResidentModalOpen(true)}
                            >
                                <IoSearch className="w-4 h-4" />
                                Select Resident
                            </button>
                        )}
                    </div>
                </div>
                {resident ? (
                    <ResidentHealthCard resident={resident} />
                ) : (
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <p className="text-sm text-gray-400">
                            {isMainPage
                                ? 'Search a resident first, or add a new one if they are not yet registered.'
                                : 'Select a resident to load basic information from the residents table.'}
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-500 mb-4">Visit Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-500">Visit Date & Time</label>
                        <input
                            type="datetime-local"
                            name="visit_date"
                            value={formData.visit_date}
                            onChange={handleChange}
                            disabled={isView}
                            className={inputClass}
                        />
                    </div>
                </div>

                <h2 className="text-lg font-semibold text-gray-500 mb-4">Vitals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {vitals.map((field) => (
                        <div key={field.name}>
                            <label className="block mb-2 text-sm font-medium text-gray-500">{field.label}</label>
                            <input
                                type={field.type}
                                step={field.step}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                disabled={isView}
                                placeholder={field.placeholder}
                                className={inputClass}
                            />
                        </div>
                    ))}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-500">BMI</label>
                        <input
                            type="text"
                            name="bmi"
                            value={formData.bmi}
                            disabled
                            className={inputClass}
                            placeholder="Auto-calculated"
                        />
                    </div>
                </div>

                <h2 className="text-lg font-semibold text-gray-500 mb-4">Medical History</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-500">Chief Complaint</label>
                        <textarea
                            name="chief_complaint"
                            value={formData.chief_complaint}
                            onChange={handleChange}
                            disabled={isView}
                            rows={2}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-500">Symptoms</label>
                        <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} disabled={isView} rows={3} className={inputClass} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-500">Diagnosis</label>
                        <textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange} disabled={isView} rows={3} className={inputClass} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-500">Treatment</label>
                        <textarea name="treatment" value={formData.treatment} onChange={handleChange} disabled={isView} rows={3} className={inputClass} />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-500">Medication</label>
                        <textarea name="medication" value={formData.medication} onChange={handleChange} disabled={isView} rows={3} className={inputClass} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-500">Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} disabled={isView} rows={3} className={inputClass} />
                    </div>
                </div>

                {!isView && (
                    <div className="flex justify-end mt-6">
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => {
                                const validationError = validate();
                                if (validationError) {
                                    setErrorMessage(validationError);
                                    return;
                                }
                                setErrorMessage('');
                                setIsConfirmOpen(true);
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : isEdit ? 'Update Record' : 'Save Record'}
                        </button>
                    </div>
                )}
            </div>

            <SearchModal
                isOpen={isResidentModalOpen}
                title="Select Resident"
                onClose={() => setIsResidentModalOpen(false)}
                onSelect={setResident}
                allowAddNew
                onAddNew={(searchTerm) => {
                    setAddResidentSearch(searchTerm || '');
                    setIsAddResidentOpen(true);
                }}
            />

            <AddResidentModal
                isOpen={isAddResidentOpen}
                initialSearch={addResidentSearch}
                onClose={() => setIsAddResidentOpen(false)}
                onCreated={(created) => {
                    setResident(created);
                    setToastType('Resident');
                    setToastMessage('Resident added. You can now save a medical record.');
                    setShowToast(true);
                }}
            />

            <AlertDialog
                isOpen={isConfirmOpen}
                title="Confirm Save"
                message={isEdit ? 'Update this current medical record?' : 'Save this medical record? Older visits will remain view-only.'}
                buttonConfig={[
                    { label: 'Cancel', color: 'bg-gray-200 text-gray-600', action: () => setIsConfirmOpen(false) },
                    { label: isEdit ? 'Yes, Update' : 'Yes, Save', color: 'bg-blue-600 text-white', action: handleSubmit },
                ]}
            />

            <ToastMessage
                message={toastMessage || `Medical record ${toastType === 'Add' ? 'added' : 'updated'} successfully!`}
                variant="default"
                isVisible={showToast}
                duration={3000}
                onClose={() => setShowToast(false)}
            />
        </div>
    );
};

export default HealthCenterRecordPage;
