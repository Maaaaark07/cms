import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JuanBataanLogo from '../assets/juanbataan.png';

const EditResidentModal = ({ isOpen, onClose, onResidentUpdated, residentData }) => {
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

    useEffect(() => {
        if (isOpen && residentData) {
            setFormData({
                ...residentData,
                birthday: formatDate(residentData.birthday),
                RegistrationDate: formatDate(residentData.RegistrationDate),
            });
        }
    }, [isOpen, residentData]);

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
                onResidentUpdated();
                onClose();
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Failed to update resident');
            }
        } finally {
            setLoading(false); // Stop loading
        }
    };


    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white text-sm rounded-lg text-gray-500 shadow-xl p-6 w-11/12 md:w-3/4 lg:w-2/3">
                        <h2 className="text-lg font-semibold text-gray-500 mb-4">Edit Resident</h2>
                        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Reusing the same labels and inputs as in the Add Resident Modal */}
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
                                            className="border p-2 mb-2 w-full rounded-md focus:outline-blue-500"
                                            required
                                        />
                                    </label>
                                    <label className="block mb-1 md:col-span-3">
                                        Voting Precinct
                                        <input
                                            type="text"
                                            name="VotingPrecinct"
                                            value={formData.VotingPrecinct}
                                            onChange={handleChange}
                                            className="border p-2 mb-2 w-full rounded-md focus:outline-blue-500"
                                            required
                                        />
                                    </label>
                                </>
                            ) : null}
                            <div className="mt-4 md:col-span-3">
                                <button type="button" onClick={onClose} className="bg-gray-300 text-gray-600 p-2 rounded-md mr-2">Cancel</button>
                                <button type="submit" className={`bg-blue-500 text-white p-2 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Resident'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default EditResidentModal;
