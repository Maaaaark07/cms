import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardCard from '../components/DashboardCard';
import PopulationChart from '../components/PopulationChart';
import { useAuth } from '../components/AuthContext';
import cfg from '../../../server/config/domain.js';

const ProvincialDashboard = () => {
    const { cityId, provinceId } = useAuth();
    const [cities, setCities] = useState([]);
    const [resolvedProvinceId, setResolvedProvinceId] = useState(provinceId || '');
    const [selectedCity, setSelectedCity] = useState('');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const resolveProvince = async () => {
            if (provinceId) {
                setResolvedProvinceId(provinceId);
                return;
            }
            if (!cityId) return;
            try {
                const response = await axios.get(
                    `http://${cfg.domainname}:${cfg.serverport}/location/city/${cityId}`,
                    { withCredentials: true }
                );
                if (response.data?.province_id) {
                    setResolvedProvinceId(response.data.province_id);
                    return;
                }
            } catch (error) {
                // Fallback below uses city list from province lookup through cities table.
            }
            setResolvedProvinceId('');
        };
        resolveProvince();
    }, [provinceId, cityId]);

    useEffect(() => {
        const fetchCities = async () => {
            if (!resolvedProvinceId) return;
            try {
                const response = await axios.get(
                    `http://${cfg.domainname}:${cfg.serverport}/location/cities/${resolvedProvinceId}`,
                    { withCredentials: true }
                );
                setCities(response.data || []);
            } catch (error) {
                setCities([]);
            }
        };
        fetchCities();
    }, [resolvedProvinceId]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!resolvedProvinceId && !selectedCity) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const url = selectedCity
                    ? `http://${cfg.domainname}:${cfg.serverport}/stats/city/${selectedCity}`
                    : `http://${cfg.domainname}:${cfg.serverport}/stats/province/${resolvedProvinceId}`;
                const response = await axios.get(url, { withCredentials: true });
                setStats({
                    ...response.data,
                    NumberOfResidents: response.data.NumberOfResidents ?? response.data.totalPopulation ?? 0,
                });
            } catch (error) {
                console.error('Error fetching provincial population stats:', error);
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
        fetchStats();
    }, [resolvedProvinceId, selectedCity, cityId]);

    return (
        <>
            <h1 className="text-2xl font-bold text-gray-500 mb-6">Provincial Dashboard</h1>
            <DashboardCard stats={stats} />
            <div className="grid grid-cols-1 gap-6">
                <PopulationChart
                    title="Province Population Statistics"
                    male={stats?.male}
                    female={stats?.female}
                    seniorCitizens={stats?.seniorCitizens}
                    youth={stats?.youth}
                    totalPopulation={stats?.totalPopulation}
                    loading={loading}
                    filterLabel="All Municipalities"
                    filterValue={selectedCity}
                    filterOptions={cities.map((city) => ({
                        value: String(city.iid),
                        label: city.iname,
                    }))}
                    onFilterChange={setSelectedCity}
                />
            </div>
        </>
    );
};

export default ProvincialDashboard;
