import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import JuanBataanLogo from '../assets/juanbataan.png';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';

const AddResidentPage = () => {
    const navigate = useNavigate();
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

    const validateFormData = () => {
        const { FirstName, LastName, Age, Gender, Address, ContactNumber, RegisteredVoter, VoterIDNumber, VotingPrecinct } = formData;

        if (!FirstName || !LastName || !Age || !Gender || !Address || !ContactNumber) {
            setErrorMessage('Please fill in all required fields.');
            return false;
        }

        if (RegisteredVoter && (!VoterIDNumber || !VotingPrecinct)) {
            setErrorMessage('Please provide Voter ID Number and Voting Precinct for registered voters.');
            return false;
        }

        return true;
    };

    const handleAddResident = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        if (!validateFormData()) return;

        try {
            await axios.post('http://localhost:8080/add-resident', formData, { withCredentials: true });
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
                        <div className="mx-auto">
                            <div className=' mb-6 leading-3'>
                                <h1 className="text-2xl font-semibold text-gray-500">Add New Resident</h1>
                                <p className='text-sm text-gray-500'>Fill out the form below to add a new resident to the system.</p>
                            </div>
                            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                            <form onSubmit={handleAddResident} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="col-span-1">
                                    <label className="block mb-2 font-medium text-gray-600">
                                        First Name
                                        <input
                                            type="text"
                                            name="FirstName"
                                            value={formData.FirstName}
                                            onChange={handleChange}
                                            required
                                            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                    </label>
                                </div>
                                <div className="col-span-1">
                                    <label className="block mb-2 font-medium text-gray-600">
                                        Last Name
                                        <input
                                            type="text"
                                            name="LastName"
                                            value={formData.LastName}
                                            onChange={handleChange}
                                            required
                                            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                    </label>
                                </div>
                                <div className="col-span-1">
                                    <label className="block mb-2 font-medium text-gray-600">
                                        Middle Name
                                        <input
                                            type="text"
                                            name="MiddleName"
                                            value={formData.MiddleName}
                                            onChange={handleChange}
                                            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                    </label>
                                </div>
                                <div className="col-span-1">
                                    <label className="block mb-2 font-medium text-gray-600">
                                        Age
                                        <input
                                            type="number"
                                            name="Age"
                                            value={formData.Age}
                                            onChange={handleChange}
                                            required
                                            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                    </label>
                                </div>
                                <div className="col-span-1">
                                    <label className="block mb-2 font-medium text-gray-600">
                                        Birthday
                                        <input
                                            type="date"
                                            name="birthday"
                                            value={formData.birthday}
                                            onChange={handleChange}
                                            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                    </label>
                                </div>
                                <div className="col-span-1">
                                    <label className="block mb-2 font-medium text-gray-600">
                                        Gender
                                        <select
                                            name="Gender"
                                            value={formData.Gender}
                                            onChange={handleChange}
                                            required
                                            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </label>
                                </div>
                                <div className="col-span-1">
                                    <label className="block mb-2 font-medium text-gray-600">
                                        Address
                                        <input
                                            type="text"
                                            name="Address"
                                            value={formData.Address}
                                            onChange={handleChange}
                                            required
                                            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                    </label>
                                </div>
                                <div className="col-span-1">
                                    <label className="block mb-2 font-medium text-gray-600">
                                        Contact Number
                                        <input
                                            type="text"
                                            name="ContactNumber"
                                            value={formData.ContactNumber}
                                            onChange={handleChange}
                                            required
                                            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                    </label>
                                </div>
                                <div className="col-span-1">
                                    <label className="block mb-2 font-medium text-gray-600">
                                        Email
                                        <input
                                            type="email"
                                            name="Email"
                                            value={formData.Email}
                                            onChange={handleChange}
                                            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                    </label>
                                </div>
                                <div className="col-span-1">
                                    <label className="block mb-2 font-medium text-gray-600">
                                        Civil Status
                                        <select
                                            name="CivilStatus"
                                            value={formData.CivilStatus}
                                            onChange={handleChange}
                                            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        >
                                            <option value="">Select Civil Status</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Widowed">Widowed</option>
                                            <option value="Divorced">Divorced</option>
                                        </select>
                                    </label>
                                </div>
                                <div className="col-span-1">
                                    <label className="block mb-2 font-medium text-gray-600">
                                        Occupation
                                        <input
                                            type="text"
                                            name="Occupation"
                                            value={formData.Occupation}
                                            onChange={handleChange}
                                            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                    </label>
                                </div>
                                <div className="col-span-1">
                                    <label className="block mb-2 font-medium text-gray-600">
                                        Household ID
                                        <input
                                            type="text"
                                            name="HouseholdID"
                                            value={formData.HouseholdID}
                                            onChange={handleChange}
                                            required
                                            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                    </label>
                                </div>
                                <div className="col-span-1">
                                    <label className="block mb-2 font-medium text-gray-600">
                                        Juan Bataan ID
                                        <input
                                            type="text"
                                            name="JuanBataanID"
                                            value={formData.JuanBataanID}
                                            onChange={handleChange}
                                            className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                    </label>
                                </div>

                                <div className="col-span-1">
                                    <label className="block mb-2 font-medium text-gray-600">
                                        Registered Voter
                                        <input
                                            type="checkbox"
                                            name="RegisteredVoter"
                                            checked={formData.RegisteredVoter}
                                            onChange={handleCheckboxChange}
                                            className="p-2"
                                        />
                                    </label>
                                </div>

                                {formData.RegisteredVoter && (
                                    <>
                                        <div className="col-span-1">
                                            <label className="block mb-2 font-medium text-gray-600">
                                                Voter ID Number
                                                <input
                                                    type="text"
                                                    name="VoterIDNumber"
                                                    value={formData.VoterIDNumber}
                                                    onChange={handleChange}
                                                    className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                    required
                                                />
                                            </label>
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block mb-2 font-medium text-gray-600">
                                                Voting Precinct
                                                <input
                                                    type="text"
                                                    name="VotingPrecinct"
                                                    value={formData.VotingPrecinct}
                                                    onChange={handleChange}
                                                    className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                    required
                                                />
                                            </label>
                                        </div>
                                    </>
                                )}
                                <div className="col-span-1 md:col-span-3 flex justify-end mt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-500 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    >
                                        {loading ? 'Saving...' : 'Add Resident'}
                                    </button>
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
