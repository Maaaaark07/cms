import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import JuanBataanLogo from '../assets/juanbataan.png';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';
import { BsFillPersonVcardFill } from "react-icons/bs";
import { MdContactPhone } from "react-icons/md";
import { FaHouseUser } from "react-icons/fa6";
import { IoIosFingerPrint } from "react-icons/io";
import { FaMapLocationDot } from "react-icons/fa6";


const AddResidentPage = ({ setSuccess }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        FirstName: '', LastName: '', MiddleName: '', Suffix: '',
        Age: '', birthday: '', BirthPlace: '', Gender: '', Address: '',
        Region_ID: '', Province_ID: '', City_ID: '', Barangay_ID: '', Purok: '',
        IsLocalResident: false, ResidentType: '', ContactNumber: '', Email: '',
        CivilStatus: '', Occupation: '', IsHouseholdHead: false, HouseholdID: '',
        IsRegisteredVoter: false, VoterIDNumber: '', IsJuanBataanMember: false,
        JuanBataanID: '', LastUpdated: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [allRegion, setAllRegion] = useState([]);
    const [allProvinces, setAllProvinces] = useState([]);
    const [allCities, setAllCities] = useState([]);
    const [allBarangay, setAllBarangay] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedBarangay, setSelectedBarangay] = useState('');

    useEffect(() => {
        fetchAllRegion();
    }, []);

    useEffect(() => {
        if (selectedRegion) {
            fetchAllProvince(selectedRegion);
        }
    }, [selectedRegion]);

    useEffect(() => {
        if (selectedProvince) {
            fetchAllCity(selectedProvince);
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedCity) {
            fetchAllBarangay(selectedCity);
        }
    }, [selectedCity]);

    const fetchAllRegion = async () => {
        try {
            const response = await axios.get('http://localhost:8080/location/region', { withCredentials: true });
            setAllRegion(response.data);
        } catch (error) {
            console.error("Error fetching all Region:", error)
        }
    }

    const fetchAllProvince = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/location/provinces/${selectedRegion}`, { withCredentials: true });
            const provinces = response.data;
            setAllProvinces(provinces);

            if (provinces.length > 0) {
                const defaultProvince = provinces[0].iid;
                setSelectedProvince(defaultProvince);
                setFormData((prevState) => ({
                    ...prevState,
                    Province_ID: defaultProvince,
                }));
            } else {
                setSelectedProvince('');
                setAllCities([]);
                setSelectedCity('');
                setFormData((prevState) => ({
                    ...prevState,
                    Province_ID: '',
                    City_ID: '',
                    Barangay_ID: '',
                }));
            }
        } catch (error) {
            console.error("Error fetching all Provinces:", error);
        }
    };

    const fetchAllCity = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/location/cities/${selectedProvince}`, { withCredentials: true });
            const cities = response.data;
            setAllCities(cities);

            if (cities.length > 0) {
                const defaultCity = cities[0].iid;
                setSelectedCity(defaultCity);
                setFormData((prevState) => ({
                    ...prevState,
                    City_ID: defaultCity,
                }));
            } else {
                setSelectedCity('');
                setAllBarangay([]);
                setSelectedBarangay('');
                setFormData((prevState) => ({
                    ...prevState,
                    City_ID: '',
                    Barangay_ID: '',
                }));
            }
        } catch (error) {
            console.error("Error fetching all Cities:", error);
        }
    };

    const fetchAllBarangay = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/location/barangay/${selectedCity}`, { withCredentials: true });
            const barangays = response.data;
            setAllBarangay(barangays);

            if (barangays.length > 0) {
                const defaultBarangay = barangays[0].iid;
                setSelectedBarangay(defaultBarangay);
                setFormData((prevState) => ({
                    ...prevState,
                    Barangay_ID: defaultBarangay,
                }));
            } else {
                setSelectedBarangay('');
                setFormData((prevState) => ({
                    ...prevState,
                    Barangay_ID: '',
                }));
            }
        } catch (error) {
            console.error("Error fetching all Barangays:", error);
        }
    };

    const handleRegionChange = (e) => {
        const regionId = e.target.value;
        setSelectedRegion(regionId);
        setFormData(prevState => ({
            ...prevState,
            Region_ID: regionId
        }));
    };

    const handleProvinceChange = (e) => {
        const provinceId = e.target.value;
        setSelectedProvince(provinceId);
        setFormData(prevState => ({
            ...prevState,
            Province_ID: provinceId
        }));
    };

    const handleCityChange = (e) => {
        const cityId = e.target.value;
        setSelectedCity(cityId);
        setFormData(prevState => ({
            ...prevState,
            City_ID: cityId
        }));
    };

    const handleBarangayChange = (e) => {
        const barangayId = e.target.value;
        setSelectedBarangay(barangayId);
        setFormData(prevState => ({
            ...prevState,
            Barangay_ID: barangayId
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleIsHouseholdHead = (e) => {
        setFormData(prevData => ({
            ...prevData,
            IsHouseholdHead: e.target.value === 'yes' ? 1 : 0,
        }));
    };

    const handleIsRegisteredVoter = (e) => {
        setFormData(prevData => ({
            ...prevData,
            IsRegisteredVoter: e.target.value === 'yes' ? 1 : 0,
        }));
    };

    const handleIsLocalResident = (e) => {
        setFormData(prevData => ({
            ...prevData,
            IsLocalResident: e.target.value === 'yes' ? 1 : 0,
        }));
    }

    const handleIsJuanBataanMember = (e) => {
        setFormData(prevData => ({
            ...prevData,
            IsJuanBataanMember: e.target.value === 'yes' ? 1 : 0
        }));
    };


    const handleCancel = () => {
        navigate('/resident-management');
    }

    const validateFormData = () => {
        const { FirstName, LastName, Age, Gender, Address, ContactNumber } = formData;

        if (!FirstName || !LastName || !Age || !Gender || !Address || !ContactNumber) {
            setErrorMessage('Please fill in all required fields.');
            return false;
        }
        return true;
    };

    const handleAddResident = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        if (!validateFormData()) return;

        setFormData(prevData => ({
            ...prevData,
            Region_ID: selectedRegion,
            Province_ID: selectedProvince,
            City_ID: selectedCity,
            Barangay_ID: selectedBarangay
        }));

        try {
            await axios.post('http://localhost:8080/residents/add', formData, { withCredentials: true });
            sessionStorage.setItem('residentAddedSuccess', 'true');
            navigate('/resident-management');
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to save resident');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-row flex-grow">
                <Sidebar />
                <main className="flex-grow p-4 bg-gray-100">
                    <div className="flex-grow p-6 bg-gray-100">
                        <Breadcrumbs />
                        <div className="mx-auto bg-white p-10 rounded-lg">
                            <div className="mb-6 leading-3">
                                <h1 className="text-xl font-semibold text-gray-500">Add New Resident</h1>
                                <p className="text-xs text-gray-400">Fill out the form below to add a new resident to the system.</p>
                            </div>
                            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                            <form onSubmit={handleAddResident} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Personal Details Section */}
                                <div className="col-span-1 md:col-span-3 mb-4">
                                    <div className='flex items-center gap-3 mb-4'>
                                        <BsFillPersonVcardFill className='w-6 h-6 text-gray-400' />
                                        <h2 className="text-sm font-bold text-gray-500">Personal Details</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">First Name</label>
                                            <input type="text" name="FirstName" value={formData.FirstName} onChange={handleChange} placeholder="First Name" required className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">Last Name</label>
                                            <input type="text" name="LastName" value={formData.LastName} onChange={handleChange} placeholder="Last Name" required className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div className='flex gap-4'>
                                            <div className='flex-2'>
                                                <label className="block mb-2 text-sm font-medium text-gray-500">Middle Name</label>
                                                <input type="text" name="MiddleName" value={formData.MiddleName} onChange={handleChange} placeholder="Middle Name" className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                            <div className='flex-1'>
                                                <label className="block mb-2 text-sm font-medium text-gray-500">Suffix</label>
                                                <select
                                                    name="Suffix"
                                                    value={formData.Suffix || ''}
                                                    onChange={handleChange}
                                                    className="border text-sm border-gray-300 p-2 w-full rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Suffix</option>
                                                    <option value="Jr.">Jr.</option>
                                                    <option value="Sr.">Sr.</option>
                                                    <option value="II">II</option>
                                                    <option value="III">III</option>
                                                    <option value="IV">IV</option>
                                                    <option value="V">V</option>
                                                    <option value="">None</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">Age</label>
                                            <input type="number" name="Age" value={formData.Age} onChange={handleChange} required placeholder='Age' className="border text-sm border-gray-300 p-2 text-gray-500 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">Birthday</label>
                                            <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="border text-sm border-gray-300 p-2 w-full rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">Birth Place</label>
                                            <input type="text" name="BirthPlace" value={formData.BirthPlace} onChange={handleChange} className="border text-sm border-gray-300 p-2 w-full rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">Occupation</label>
                                            <input type="text" name="Occupation" value={formData.Occupation} onChange={handleChange} placeholder="Programmer" className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">
                                                Civil Status
                                            </label>
                                            <select name="CivilStatus" value={formData.CivilStatus} onChange={handleChange} className="border text-sm border-gray-300 text-gray-500 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option value="">Select Civil Status</option>
                                                <option value="Single">Single</option>
                                                <option value="Married">Married</option>
                                                <option value="Widowed">Widowed</option>
                                                <option value="Divorced">Divorced</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">Gender</label>
                                            <select
                                                name="Gender"
                                                value={formData.Gender || ''}
                                                onChange={handleChange}
                                                required
                                                className="border text-sm border-gray-300 p-2 w-full rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information Section */}
                                <div className="col-span-1 md:col-span-3 mb-4">
                                    <div className='flex items-center gap-3 mb-4'>
                                        <FaMapLocationDot className='w-6 h-6 text-gray-400' />
                                        <h2 className="text-sm font-bold text-gray-500">Address Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">Region</label>
                                            <select
                                                value={selectedRegion || ''}
                                                name='Region_ID'
                                                onChange={handleRegionChange}
                                                className="border text-sm border-gray-300 p-2 w-full rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Region</option>
                                                {allRegion.map((region) => (
                                                    <option value={region.iid} key={region.iid}>{region.iname}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">Province</label>
                                            <select
                                                value={selectedProvince || ''}
                                                name='Province_ID'
                                                onChange={handleProvinceChange}
                                                disabled={!selectedRegion}
                                                className="border text-sm border-gray-300 p-2 w-full rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {allProvinces.length > 0 ? (
                                                    allProvinces.map((province) => (
                                                        <option value={province.iid} key={province.iid}>{province.iname}</option>
                                                    ))
                                                ) : (
                                                    <option value="">No Provinces Available</option>
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">City</label>
                                            <select
                                                value={selectedCity || ''}
                                                name='City_ID'
                                                onChange={handleCityChange}
                                                disabled={!selectedProvince}
                                                className="border text-sm border-gray-300 p-2 w-full rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {allCities.length > 0 ? (
                                                    allCities.map((city) => (
                                                        <option value={city.iid} key={city.iid}>{city.iname}</option>
                                                    ))
                                                ) : (
                                                    <option value="">No Cities Available</option>
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">Barangay</label>
                                            <select
                                                value={selectedBarangay || ''}
                                                name='Barangay_ID'
                                                onChange={handleBarangayChange}
                                                disabled={!selectedCity}
                                                className="border text-sm border-gray-300 p-2 w-full rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {allBarangay.length > 0 ? (
                                                    allBarangay.map((barangay) => (
                                                        <option value={barangay.iid} key={barangay.iid}>{barangay.iname}</option>
                                                    ))
                                                ) : (
                                                    <option value="">No Barangay Available</option>
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">Purok / Street</label>
                                            <input type="text" name="Purok" value={formData.Purok} onChange={handleChange} placeholder='Purok' required className="border text-sm border-gray-300 text-gray-500 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <div className='leading-3 mb-4'>
                                                <label className="block text-sm font-medium text-gray-500">Are you a local resident?</label>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="IsLocalResident"
                                                        value="yes"
                                                        checked={formData.IsLocalResident === 1}
                                                        onChange={handleIsLocalResident}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">Yes</span>
                                                </label>
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="IsLocalResident"
                                                        value="no"
                                                        checked={formData.IsLocalResident === 0}
                                                        onChange={handleIsLocalResident}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">No</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information Section */}
                                <div className='col-span-1 md:col-span-3 mb-4'>
                                    <div className='flex items-center gap-3 mb-4'>
                                        <MdContactPhone className='w-6 h-6 text-gray-400' />
                                        <h2 className="text-sm font-bold text-gray-500">Contact Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">Contact Number</label>
                                            <input type="text" name="ContactNumber" value={formData.ContactNumber} onChange={handleChange} placeholder='09134567894' required className="border text-sm border-gray-300 text-gray-500 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">Email</label>
                                            <input type="email" name="Email" value={formData.Email} onChange={handleChange} placeholder='JohnDoe@email.com' className="border border-gray-300 p-2 w-full text-sm rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Household Information Section */}
                                <div className="col-span-1 md:col-span-3 mb-4">
                                    <div className='flex items-center gap-3 mb-4'>
                                        <FaHouseUser className='w-6 h-6 text-gray-400' />
                                        <h2 className="text-sm font-bold text-gray-500">Household Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 mb-4 gap-6">
                                        <div>
                                            <div className='leading-3 mb-4'>
                                                <label className="block text-sm font-medium text-gray-500">Are you head of the family?</label>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="IsHouseholdHead"
                                                        value="yes"
                                                        checked={formData.IsHouseholdHead === 1}
                                                        onChange={handleIsHouseholdHead}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">Yes</span>
                                                </label>
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="IsHouseholdHead"
                                                        value="no"
                                                        checked={formData.IsHouseholdHead === 0}
                                                        onChange={handleIsHouseholdHead}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">No</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">Household ID</label>
                                            <input type="text" name="HouseholdID" value={formData.HouseholdID} onChange={handleChange} placeholder='12345' className="border text-sm text-gray-500 border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 mb-4 gap-6">
                                        <div>
                                            <div className='leading-3 mb-4'>
                                                <label className="block text-sm font-medium text-gray-500">Are you Barangay Registered Voter?</label>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="IsRegisteredVoter"
                                                        value="yes"
                                                        checked={formData.IsRegisteredVoter === 1}
                                                        onChange={handleIsRegisteredVoter}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">Yes</span>
                                                </label>
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="IsRegisteredVoter"
                                                        value="no"
                                                        checked={formData.IsRegisteredVoter === 0}
                                                        onChange={handleIsRegisteredVoter}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">No</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">Voter ID</label>
                                            <input type="text" name="VoterIDNumber" value={formData.VoterIDNumber} onChange={handleChange} placeholder='12345' className="border text-sm text-gray-500 border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 mb-4 gap-6">
                                        <div>
                                            <div className='leading-3 mb-4'>
                                                <label className="block text-sm font-medium text-gray-500">Are you a member of One Bataan?</label>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="IsJuanBataanMember"
                                                        value="yes"
                                                        checked={formData.IsJuanBataanMember === 1}
                                                        onChange={handleIsJuanBataanMember}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">Yes</span>
                                                </label>
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="IsJuanBataanMember"
                                                        value="no"
                                                        checked={formData.IsJuanBataanMember === 0}
                                                        onChange={handleIsJuanBataanMember}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">No</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-500">One Bataan ID</label>
                                            <input type="text" name="JuanBataanID" value={formData.JuanBataanID} onChange={handleChange} placeholder='12345' className="border text-sm text-gray-500 border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-3 flex justify-end mt-4 space-x-4">
                                    <button type="button" onClick={handleCancel} className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400">Cancel</button>
                                    <button type="submit" disabled={loading} className="bg-blue-500 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300">{loading ? 'Saving...' : 'Add Resident'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>

    );
};

export default AddResidentPage;
