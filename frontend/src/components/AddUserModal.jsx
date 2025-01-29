import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cfg from '../../../server/config/domain.js';

const UserManagementModal = ({ isOpen, onClose, onSubmit, barangayId }) => {
    const [formData, setFormData] = useState({
        barangay_id: barangayId,
        city_id: "",
        province_id: "",
        user: "",
        password: "",
        role_id: "",
        lgu_type_id: "",
        resident_id: "",
        fullname: "",
    });

    const [allRegion, setAllRegion] = useState([]);
    const [allProvinces, setAllProvinces] = useState([]);
    const [allCities, setAllCities] = useState([]);
    const [allBarangay, setAllBarangay] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedBarangay, setSelectedBarangay] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchAllRegion();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedRegion) {
            fetchAllProvince();
        }
    }, [selectedRegion]);

    useEffect(() => {
        if (selectedProvince) {
            fetchAllCity();
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedCity) {
            fetchAllBarangay();
        }
    }, [selectedCity]);

    const fetchAllRegion = async () => {
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/location/region`,
                { withCredentials: true }
            );
            setAllRegion(response.data);
        } catch (error) {
            console.error("Error fetching regions:", error);
        }
    };

    const fetchAllProvince = async () => {
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/location/provinces/${selectedRegion}`,
                { withCredentials: true }
            );
            setAllProvinces(response.data);
        } catch (error) {
            console.error("Error fetching provinces:", error);
        }
    };

    const fetchAllCity = async () => {
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/location/cities/${selectedProvince}`,
                { withCredentials: true }
            );
            setAllCities(response.data);
        } catch (error) {
            console.error("Error fetching cities:", error);
        }
    };

    const fetchAllBarangay = async () => {
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/location/barangay/${selectedCity}`,
                { withCredentials: true }
            );
            setAllBarangay(response.data);
        } catch (error) {
            console.error("Error fetching barangays:", error);
        }
    };

    const handleRegionChange = (e) => {
        const regionId = e.target.value;
        setSelectedRegion(regionId);
        setFormData(prevState => ({
            ...prevState,
            region_id: regionId,
            province_id: '',
            city_id: '',
            barangay_id: ''
        }));
        setSelectedProvince('');
        setSelectedCity('');
        setSelectedBarangay('');
    };

    const handleProvinceChange = (e) => {
        const provinceId = e.target.value;
        setSelectedProvince(provinceId);
        setFormData(prevState => ({
            ...prevState,
            province_id: provinceId,
            city_id: '',
            barangay_id: ''
        }));
        setSelectedCity('');
        setSelectedBarangay('');
    };

    const handleCityChange = (e) => {
        const cityId = e.target.value;
        setSelectedCity(cityId);
        setFormData(prevState => ({
            ...prevState,
            city_id: cityId,
            barangay_id: ''
        }));
        setSelectedBarangay('');
    };

    const handleBarangayChange = (e) => {
        const barangayId = e.target.value;
        setSelectedBarangay(barangayId);
        setFormData(prevState => ({
            ...prevState,
            barangay_id: barangayId
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl">
                <h2 className="text-xl font-bold mb-4">Add New User</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="fullname"
                                placeholder="Full Name"
                                value={formData.fullname}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="text"
                                name="user"
                                placeholder="Username"
                                value={formData.user}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <select
                                value={selectedRegion}
                                onChange={handleRegionChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="">Select Region</option>
                                {allRegion.map(region => (
                                    <option key={region.iid} value={region.iid}>
                                        {region.iname}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedProvince}
                                onChange={handleProvinceChange}
                                className="w-full p-2 border rounded"
                                disabled={!selectedRegion}
                                required
                            >
                                <option value="">Select Province</option>
                                {allProvinces.map(province => (
                                    <option key={province.iid} value={province.iid}>
                                        {province.iname}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedCity}
                                onChange={handleCityChange}
                                className="w-full p-2 border rounded"
                                disabled={!selectedProvince}
                                required
                            >
                                <option value="">Select City</option>
                                {allCities.map(city => (
                                    <option key={city.iid} value={city.iid}>
                                        {city.iname}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedBarangay}
                                onChange={handleBarangayChange}
                                className="w-full p-2 border rounded"
                                disabled={!selectedCity}
                                required
                            >
                                <option value="">Select Barangay</option>
                                {allBarangay.map(barangay => (
                                    <option key={barangay.iid} value={barangay.iid}>
                                        {barangay.iname}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="text"
                                name="role_id"
                                placeholder="Role ID"
                                value={formData.role_id}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="text"
                                name="lgu_type_id"
                                placeholder="LGU Type ID"
                                value={formData.lgu_type_id}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="text"
                                name="resident_id"
                                placeholder="Resident ID"
                                value={formData.resident_id}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Add User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserManagementModal;