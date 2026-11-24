import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaRegEye, FaCheck } from 'react-icons/fa';
import { FaArrowRightLong } from 'react-icons/fa6';

import DashboardCard from '../components/DashboardCard';
import PopulationChart from '../components/PopulationChart';
import StatusBadge from '../components/StatusBadge';
import AlertDialog from '../components/AlertDialog';
import { useAuth } from '../components/AuthContext';
import { useDateFormatter } from '../hooks/useDateFormatter';
import cfg from '../../../server/config/domain.js';

const MunicipalityDashboard = () => {
    const navigate = useNavigate();
    const { cityId } = useAuth();
    const { formatIncidentDate } = useDateFormatter();
    const [barangays, setBarangays] = useState([]);
    const [selectedBarangay, setSelectedBarangay] = useState('');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [blotters, setBlotters] = useState([]);
    const [resolutions, setResolutions] = useState([]);
    const [selectedApproveId, setSelectedApproveId] = useState(null);
    const [isAlertApproveOpen, setIsAlertApproveOpen] = useState(false);

    const fetchLocationOptions = async () => {
        if (!cityId) return;
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/location/barangay/${cityId}`,
                { withCredentials: true }
            );
            setBarangays(response.data || []);
        } catch (error) {
            setBarangays([]);
        }
    };

    const fetchStats = async () => {
        if (!cityId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const url = selectedBarangay
                ? `http://${cfg.domainname}:${cfg.serverport}/stats/all-population-stats/${selectedBarangay}`
                : `http://${cfg.domainname}:${cfg.serverport}/stats/city/${cityId}`;
            const response = await axios.get(url, { withCredentials: true });
            setStats({
                ...response.data,
                NumberOfResidents: response.data.NumberOfResidents ?? response.data.totalPopulation ?? 0,
            });
        } catch (error) {
            console.error('Error fetching municipality population stats:', error);
            setStats({
                male: 0,
                female: 0,
                seniorCitizens: 0,
                youth: 0,
                totalPopulation: 0,
                NumberOfResidents: 0,
                NumberOfHousehold: 0,
                NumberOfPWD: 0,
                NumberOfRegisteredVoters: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchLists = async () => {
        if (!cityId) return;
        try {
            const [blotterResponse, resolutionResponse] = await Promise.all([
                axios.get(`http://${cfg.domainname}:${cfg.serverport}/blotter/city/${cityId}`, { withCredentials: true }),
                axios.get(`http://${cfg.domainname}:${cfg.serverport}/resolutions/city/${cityId}`, { withCredentials: true }),
            ]);
            setBlotters(blotterResponse.data || []);
            setResolutions(resolutionResponse.data || []);
        } catch (error) {
            console.error('Error fetching municipality lists:', error);
            setBlotters([]);
            setResolutions([]);
        }
    };

    const handleApprove = async () => {
        try {
            await axios.put(
                `http://${cfg.domainname}:${cfg.serverport}/resolutions/${selectedApproveId}/approve`,
                {},
                { withCredentials: true }
            );
            setSelectedApproveId(null);
            fetchLists();
        } catch (error) {
            console.error('Error approving resolution:', error);
        }
    };

    useEffect(() => {
        fetchLocationOptions();
        fetchLists();
    }, [cityId]);

    useEffect(() => {
        fetchStats();
    }, [cityId, selectedBarangay]);

    return (
        <>
            <h1 className="text-2xl font-bold text-gray-500 mb-6">Municipality Dashboard</h1>
            <DashboardCard stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <PopulationChart
                    title="Municipality Population Statistics"
                    male={stats?.male}
                    female={stats?.female}
                    seniorCitizens={stats?.seniorCitizens}
                    youth={stats?.youth}
                    totalPopulation={stats?.totalPopulation}
                    loading={loading}
                    filterLabel="All Barangays"
                    filterValue={selectedBarangay}
                    filterOptions={barangays.map((barangay) => ({
                        value: String(barangay.iid),
                        label: barangay.iname,
                    }))}
                    onFilterChange={setSelectedBarangay}
                />
                <div className="p-4 bg-white rounded-md">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-xl font-bold">Blotter</h3>
                        <button
                            type="button"
                            className="flex items-center gap-2 text-sm text-blue-500"
                            onClick={() => navigate('/blotter-report')}
                        >
                            View All
                            <FaArrowRightLong className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left p-3 font-semibold text-gray-700">Barangay</th>
                                    <th className="text-left p-3 font-semibold text-gray-700">Complainant</th>
                                    <th className="text-left p-3 font-semibold text-gray-700">Incident</th>
                                    <th className="text-left p-3 font-semibold text-gray-700">Date</th>
                                    <th className="text-center p-3 font-semibold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blotters.slice(0, 8).length > 0 ? blotters.slice(0, 8).map((blotter) => (
                                    <tr key={blotter.blotter_id} className="border-b even:bg-gray-50">
                                        <td className="p-3 text-gray-500">{blotter.barangay || 'N/A'}</td>
                                        <td className="p-3 text-gray-500">{blotter.complainant || 'N/A'}</td>
                                        <td className="p-3 text-gray-500">{blotter.incident_type || 'N/A'}</td>
                                        <td className="p-3 text-gray-500">{formatIncidentDate(blotter.incident_date)}</td>
                                        <td className="p-3 flex justify-center">
                                            <div
                                                className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer"
                                                onClick={() => navigate('/blotter-report/blotter-report-view', {
                                                    state: { blotter_id: blotter.blotter_id, viewOnly: true },
                                                })}
                                            >
                                                <FaRegEye className="w-5 h-5 text-gray-500" />
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="p-4 text-center text-sm text-gray-500">No blotter records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-white rounded-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 text-xl font-bold">Submitted Resolutions</h3>
                    <button
                        type="button"
                        className="flex items-center gap-2 text-sm text-blue-500"
                        onClick={() => navigate('/resolution')}
                    >
                        View All
                        <FaArrowRightLong className="w-3 h-3" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left p-3 font-semibold text-gray-700">Barangay</th>
                                <th className="text-left p-3 font-semibold text-gray-700">Title</th>
                                <th className="text-left p-3 font-semibold text-gray-700">Date</th>
                                <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                                <th className="text-center p-3 font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resolutions.slice(0, 8).length > 0 ? resolutions.slice(0, 8).map((item) => (
                                <tr key={item.resolution_id} className="border-b even:bg-gray-50">
                                    <td className="p-3 text-gray-500">{item.barangay || 'N/A'}</td>
                                    <td className="p-3 text-gray-500">{item.title}</td>
                                    <td className="p-3 text-gray-500">{formatIncidentDate(item.resolution_date)}</td>
                                    <td className="p-3 text-gray-500"><StatusBadge status={item.status} /></td>
                                    <td className="p-3 flex justify-center gap-2">
                                        <div
                                            className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer"
                                            onClick={() => navigate('/resolution/view', {
                                                state: { resolution_id: item.resolution_id },
                                            })}
                                        >
                                            <FaRegEye className="w-5 h-5 text-gray-500" />
                                        </div>
                                        {item.status === 'Submitted' && (
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
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-4 text-center text-sm text-gray-500">No submitted resolutions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
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
        </>
    );
};

export default MunicipalityDashboard;
