import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cfg from '../../../server/config/domain.js';
import SearchModal from '../components/SearchModal.jsx'
import { IoSearch } from "react-icons/io5";

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
        resident_name: "",
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
    const [userRoles, setUserRoles] = useState([]); // State to store user roles
    const [lguTypes, setLguTypes] = useState([]); // State to store LGU types
    const [selectedLguTypeId, setSelectedLguTypeId] = useState(null);
    const [selectResidentModal, setSelectResidentModal] = useState(false);
    const [residentId, setResidentId] = useState(null);
    const [residentName, setResidentName] = useState("");
    const [residentAddress, setResidentAddress] = useState("");
    const [residentContact, setResidentContact] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchAllRegion();
            fetchAllLguTypes(); // Fetch LGU types
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
        if (selectedLguTypeId) {
            fetchUserRolesByLguType();
        }
    }, [selectedLguTypeId]);

    useEffect(() => {
        if (selectedCity) {
            fetchAllBarangay();
        }
    }, [selectedCity]);

    // Fetch user roles when lgu_type_id changes
    useEffect(() => {
        if (formData.lgu_type_id) {
            fetchUserRolesByLguType(formData.lgu_type_id);
        }
    }, [formData.lgu_type_id]);

    const fetchAllRegion = async () => {
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/location/region`,
                { withCredentials: true }
            );
            setAllRegion(response.data || []); // Ensure it's always an array
        } catch (error) {
            console.error("Error fetching regions:", error);
            setAllRegion([]); // Fallback to empty array
        }
    };

    const fetchAllProvince = async () => {
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/location/provinces/${selectedRegion}`,
                { withCredentials: true }
            );
            setAllProvinces(response.data || []); // Ensure it's always an array
        } catch (error) {
            console.error("Error fetching provinces:", error);
            setAllProvinces([]); // Fallback to empty array
        }
    };

    const fetchAllCity = async () => {
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/location/cities/${selectedProvince}`,
                { withCredentials: true }
            );
            setAllCities(response.data || []); // Ensure it's always an array
        } catch (error) {
            console.error("Error fetching cities:", error);
            setAllCities([]); // Fallback to empty array
        }
    };

    const fetchAllBarangay = async () => {
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/location/barangay/${selectedCity}`,
                { withCredentials: true }
            );
            setAllBarangay(response.data || []); // Ensure it's always an array
        } catch (error) {
            console.error("Error fetching barangays:", error);
            setAllBarangay([]); // Fallback to empty array
        }
    };

    const fetchAllLguTypes = async () => {
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/user/lgu-type`,
                { withCredentials: true }
            );
            setLguTypes(response.data?.data || []);
            console.log("lgu:", response.data);// Use optional chaining and fallback to empty array
        } catch (error) {
            console.error("Error fetching LGU types:", error);
            setLguTypes([]); // Fallback to empty array
        }
    };

    // Fetch user roles by lgu_type_id
    const fetchUserRolesByLguType = async (lguTypeId) => {
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/user/get-user-role/${lguTypeId}`,
                { withCredentials: true }
            );
            // Make sure to access the data property of the response
            setUserRoles(response.data?.data || []);
            // Reset role_id when LGU type changes
            setFormData(prev => ({ ...prev, role_id: "" }));
        } catch (error) {
            console.error("Error fetching user roles:", error);
            setUserRoles([]);
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

        if (name === 'lgu_type_id') {
            fetchUserRolesByLguType(value);
        }
    };

    const handleSelectResident = (resident) => {
        setResidentId(resident.resident_id);
        setResidentName(`${resident.first_name} ${resident.last_name}`);
        setResidentAddress(`${resident.address || ""} ${resident.purok}, ${resident.barangay}`);
        setResidentContact(resident.contact_number || "");
        setSelectResidentModal(false);
        const fullName = `${resident.first_name} ${resident.last_name}`
        setFormData(prev => ({
            ...prev,
            resident_id: resident.resident_id,
            resident_name: fullName
        }))
        console.log(resident);
    }



    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            barangay_id: barangayId,
            city_id: formData.city_id, // Include other form data if needed
            province_id: formData.province_id,
            user: formData.user,
            password: formData.password,
            role_id: formData.role_id,
            lgu_type_id: formData.lgu_type_id,
            resident_id: formData.resident_id,
            fullname: residentName,
        };

        try {
            const response = await axios.post(
                `http://${cfg.domainname}:${cfg.serverport}/user/add-user`,
                payload,
                { withCredentials: true }
            );
            if (response.status === 201) {
                onSubmit();
                console.log("User Added Succesfully");
            }
        } catch (error) {
            console.error("Error adding user:", error);
            setError("Failed to add user. Please try again.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl">
                <h2 className="text-lg font-bold text-gray-500 mb-6">Add New User</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className='flex-1'>
                                <label className="block mb-2 text-sm font-medium text-gray-500">
                                    Resident<span className="text-red-600">*</span>
                                </label>
                                <div className="relative rounded-md ">
                                    <input type="text" name="resident_name" placeholder="Select Resident" className="text-sm border h-full border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500" value={formData.resident_name} onChange={handleInputChange} />
                                    <div className="h-full w-9 absolute flex items-center justify-center right-0 top-0 bg-blue-600 cursor-pointer rounded-r-md" onClick={() => setSelectResidentModal(true)}>
                                        <IoSearch className="w-5 h-5 text-white" />
                                    </div>
                                    <SearchModal
                                        title="Select Defendant"
                                        isOpen={selectResidentModal}
                                        onClose={() => {
                                            setSelectResidentModal(false)
                                        }}
                                        onSelect={(resident) => handleSelectResident(resident)}
                                    />
                                </div>
                            </div>
                            <div className='flex-1'>
                                <label className="block mb-2 text-sm font-medium text-gray-500">
                                    Username<span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="user"
                                    placeholder="Username"
                                    value={formData.user}
                                    onChange={handleInputChange}
                                    className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className='flex-1'>
                                <label className="block mb-2 text-sm font-medium text-gray-500">
                                    Region<span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={selectedRegion}
                                    onChange={handleRegionChange}
                                    className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Region</option>
                                    {allRegion.map(region => (
                                        <option key={region.iid} value={region.iid}>
                                            {region.iname}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className='flex-1'>
                                <label className="block mb-2 text-sm font-medium text-gray-500">
                                    Province<span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={selectedProvince}
                                    onChange={handleProvinceChange}
                                    className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
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
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className='flex-1'>
                                <label className="block mb-2 text-sm font-medium text-gray-500">
                                    City<span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={selectedCity}
                                    onChange={handleCityChange}
                                    className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
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
                            </div>

                            <div className='flex-1'>
                                <label className="block mb-2 text-sm font-medium text-gray-500">
                                    Barangay<span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={selectedBarangay}
                                    onChange={handleBarangayChange}
                                    className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
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
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className='flex-1'>
                                <label className="block mb-2 text-sm font-medium text-gray-500">
                                    Password<span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className='flex-1'>
                                <label className="block mb-2 text-sm font-medium text-gray-500">
                                    LGU Type<span className="text-red-600">*</span>
                                </label>
                                <select
                                    name="lgu_type_id"
                                    value={formData.lgu_type_id}
                                    onChange={handleInputChange}
                                    className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select LGU Type</option>
                                    {lguTypes.map(lguType => (
                                        <option key={lguType.iid} value={lguType.iid}>
                                            {lguType.iname}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className='flex-1'>
                                <label className="block mb-2 text-sm font-medium text-gray-500">
                                    Role<span className="text-red-600">*</span>
                                </label>
                                <select
                                    name="role_id"
                                    value={formData.role_id}
                                    onChange={handleInputChange}
                                    className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                                    disabled={!formData.lgu_type_id}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    {userRoles.map(role => (
                                        <option key={role.iid} value={role.iid}>
                                            {role.iname}
                                        </option>
                                    ))}
                                </select>
                            </div>
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