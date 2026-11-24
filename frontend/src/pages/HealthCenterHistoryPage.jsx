import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoArrowBack } from 'react-icons/io5';
import { FaNotesMedical, FaRegEye } from 'react-icons/fa';
import { GrEdit } from 'react-icons/gr';

import Breadcrumbs from '../components/Breadcrumbs';
import ResidentHealthCard from '../components/ResidentHealthCard.jsx';
import { useAuth } from '../components/AuthContext';
import { useDateFormatter } from '../hooks/useDateFormatter';
import cfg from '../../../server/config/domain.js';

const HealthCenterHistoryPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { barangayId } = useAuth();
    const { formatIncidentDate } = useDateFormatter();
    const [resident, setResident] = useState(location.state?.resident || null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const residentId = location.state?.resident?.resident_id || location.state?.residentId;

    useEffect(() => {
        if (!residentId) return;
        fetchHistory();
    }, [residentId, barangayId]);

    const fetchHistory = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/health/resident/${residentId}/records`,
                {
                    params: { barangay_id: barangayId },
                    withCredentials: true,
                }
            );
            setRecords(response.data.records || []);
            if (response.data.resident) {
                setResident(response.data.resident);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load medical history.');
        } finally {
            setLoading(false);
        }
    };

    if (!residentId) {
        return (
            <div className="flex-grow p-6 bg-gray-100">
                <Breadcrumbs />
                <p className="text-sm text-gray-500">No resident selected.</p>
                <button className="mt-4 text-blue-500 text-sm" onClick={() => navigate('/health-center')}>
                    Back to Health Center
                </button>
            </div>
        );
    }

    return (
        <div className="flex-grow p-6 bg-gray-100">
            <Breadcrumbs />
            <button
                onClick={() => navigate('/health-center')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 mb-4"
            >
                <IoArrowBack className="w-4 h-4" />
                Back to Health Center
            </button>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-500">Medical History</h1>
                <button
                    className="bg-blue-600 text-white px-5 py-3 text-sm flex items-center gap-2 rounded-full"
                    onClick={() => navigate('/health-center', { state: { resident } })}
                >
                    <FaNotesMedical className="w-4 h-4" />
                    Add Medical Record
                </button>
            </div>

            <ResidentHealthCard resident={resident} />

            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden text-sm">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="text-left p-3 font-semibold text-gray-700">Visit Date</th>
                            <th className="text-left p-3 font-semibold text-gray-700">Vitals</th>
                            <th className="text-left p-3 font-semibold text-gray-700">Chief Complaint</th>
                            <th className="text-left p-3 font-semibold text-gray-700">Diagnosis</th>
                            <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                            <th className="text-center p-3 font-semibold text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && records.length > 0 ? records.map((record) => (
                            <tr key={record.record_id} className="border-b hover:bg-gray-100 even:bg-gray-50">
                                <td className="p-3 text-gray-500">{formatIncidentDate(record.visit_date)}</td>
                                <td className="p-3 text-gray-500">
                                    BP {record.blood_pressure || 'N/A'} · HR {record.heart_rate || 'N/A'} · {record.temperature || 'N/A'}°C
                                </td>
                                <td className="p-3 text-gray-500">{record.chief_complaint || '—'}</td>
                                <td className="p-3 text-gray-500">{record.diagnosis || '—'}</td>
                                <td className="p-3">
                                    <span className={`px-3 py-1 rounded-full text-xs text-white ${record.is_current ? 'bg-green-500' : 'bg-gray-400'}`}>
                                        {record.is_current ? 'Current' : 'Archived'}
                                    </span>
                                </td>
                                <td className="p-3 flex items-center justify-center gap-2">
                                    <div
                                        className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer"
                                        title="View record"
                                        onClick={() => navigate('/health-center/view', { state: { recordId: record.record_id, resident } })}
                                    >
                                        <FaRegEye className="w-5 h-5 text-gray-500" />
                                    </div>
                                    {record.is_current && (
                                        <div
                                            className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer"
                                            title="Edit current record"
                                            onClick={() => navigate('/health-center/edit', { state: { recordId: record.record_id, resident } })}
                                        >
                                            <GrEdit className="w-5 h-5 text-gray-500" />
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="p-4 text-center text-sm text-gray-500">
                                    {loading ? 'Loading medical history...' : 'No medical records yet for this resident.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HealthCenterHistoryPage;
