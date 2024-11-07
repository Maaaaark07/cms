import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JuanBataanLogo from '../assets/juanbataan.png';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';

const EditResidentPage = ({ }) => {
    const [formData, setFormData] = useState({
        ResidentID: '',
        FirstName: '',
        LastName: '',
        MiddleName: '',
        Age: '',
        birthday: '',
        Gender: '',
        Address: '',
        ContactNumber: '',
        Email: '',
        CivilStatus: '',
        Occupation: '',
        HouseholdID: '',
        JuanBataanID: '',
        RegistrationDate: '',
        Status: '',
        RegisteredVoter: false,
        VoterIDNumber: '',
        VotingPrecinct: '',
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const { residentData } = location.state || {};
    const navigate = useNavigate();

    useEffect(() => {
        if (residentData) {
            setFormData({
                ...residentData,
                birthday: formatDate(residentData.birthday),
                RegistrationDate: formatDate(residentData.RegistrationDate),
            });
        }
    }, [residentData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            RegisteredVoter: e.target.checked,
        }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        try {
            const response = await axios.put(`http://localhost:8080/update-resident/${formData.ResidentID}`, formData, { withCredentials: true });

            if (response.status === 200) {
                navigate('/resident-management');
            } else {
                setErrorMessage('Failed to update resident. Response status: ' + response.status);
            }
        } catch (error) {
            console.error('Error during update:', error);

            if (error.response) {
                setErrorMessage(`Failed to update resident. ${error.response.data.message || 'Unknown server error'}`);
            } else if (error.request) {
                setErrorMessage('Failed to update resident. No response from the server.');
            } else {
                setErrorMessage(`Failed to update resident. Error: ${error.message}`);
            }
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
                        <div className="mx-auto">
                            <h2 className="text-2xl font-semibold text-gray-500 mb-6">Edit Resident</h2>
                            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <label className="block mb-1">
                                    First Name
                                    <input type="text" name="FirstName" value={formData.FirstName} onChange={handleChange} required className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                                </label>
                                <label className="block mb-1">
                                    Last Name
                                    <input type="text" name="LastName" value={formData.LastName} onChange={handleChange} required className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                                </label>
                                <label className="block mb-1">
                                    Middle Name
                                    <input type="text" name="MiddleName" value={formData.MiddleName} onChange={handleChange} className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                                </label>
                                <label className="block mb-1">
                                    Age
                                    <input type="number" name="Age" value={formData.Age} onChange={handleChange} required className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                                </label>
                                <label className="block mb-1">
                                    Birthday
                                    <input
                                        type="date"
                                        name="birthday"
                                        value={formData.birthday}
                                        onChange={handleChange}
                                        className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400"
                                    />
                                </label>
                                <label className="block mb-1">
                                    Gender
                                    <select name="Gender" value={formData.Gender} onChange={handleChange} required className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400">
                                        <option value="">Select Gender</option>
                                        <option value="M">Male</option>
                                        <option value="F">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </label>
                                <label className="block mb-1">
                                    Address
                                    <input type="text" name="Address" value={formData.Address} onChange={handleChange} required className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                                </label>
                                <label className="block mb-1">
                                    Contact Number
                                    <input type="text" name="ContactNumber" value={formData.ContactNumber} onChange={handleChange} required className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                                </label>
                                <label className="block mb-1">
                                    Email
                                    <input type="email" name="Email" value={formData.Email} onChange={handleChange} className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                                </label>
                                <label className="block mb-1">
                                    Civil Status
                                    <select name="CivilStatus" value={formData.CivilStatus} onChange={handleChange} className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400">
                                        <option value="">Select Civil Status</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Widowed">Widowed</option>
                                        <option value="Divorced">Divorced</option>
                                    </select>
                                </label>
                                <label className="block mb-1">
                                    Occupation
                                    <input type="text" name="Occupation" value={formData.Occupation} onChange={handleChange} className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                                </label>
                                <label className="block mb-1">
                                    Household ID
                                    <input type="text" name="HouseholdID" value={formData.HouseholdID} onChange={handleChange} required className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                                </label>
                                <label className="block mb-1">
                                    Juan Bataan ID
                                    <div className='relative'>
                                        <img src={JuanBataanLogo} alt="Juan Bataan Logo" className="w-5 h-5 absolute left-2 top-2" />
                                        <input type="text" name="JuanBataanID" value={formData.JuanBataanID} onChange={handleChange} className="border p-2 pl-8 mb-2 w-full rounded-md focus:outline-blue-400" />
                                    </div>
                                </label>
                                <label className="block mb-1">
                                    Registration Date
                                    <input
                                        type="date"
                                        name="RegistrationDate"
                                        value={formData.RegistrationDate}
                                        onChange={handleChange}
                                        className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400"
                                    />
                                </label>
                                <label className="block mb-1">
                                    Status
                                    <select name="Status" value={formData.Status} onChange={handleChange} className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400">
                                        <option value="">Select Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </label>
                                <label className="flex items-center mb-2 md:col-span-3">
                                    <input type="checkbox" name="RegisteredVoter" checked={formData.RegisteredVoter} onChange={handleCheckboxChange} className="mr-2 focus:outline-blue-400" />
                                    Registered Voter
                                </label>
                                {formData.RegisteredVoter ? (
                                    <>
                                        <label className="block mb-1 md:col-span-3">
                                            Voter ID Number
                                            <input
                                                type="text"
                                                name="VoterIDNumber"
                                                value={formData.VoterIDNumber}
                                                onChange={handleChange}
                                                className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400"
                                            />
                                        </label>
                                        <label className="block mb-1 md:col-span-3">
                                            Voting Precinct
                                            <input
                                                type="text"
                                                name="VotingPrecinct"
                                                value={formData.VotingPrecinct}
                                                onChange={handleChange}
                                                className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400"
                                            />
                                        </label>
                                    </>
                                ) : null}
                                <div className="col-span-full mt-4">
                                    <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded-md w-full">
                                        {loading ? 'Updating...' : 'Update Resident'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div >
    );
};

export default EditResidentPage;
