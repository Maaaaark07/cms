import React, { useState } from 'react';
import axios from 'axios';
import JuanBataanLogo from '../assets/juanbataan.png'

const AddResidentModal = ({ isOpen, onClose, onResidentAdded }) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            const response = await axios.post('http://localhost:8080/add-resident', formData, { withCredentials: true });
            if (response.status === 201) {
                onResidentAdded();
                onClose();
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Failed to add resident');
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
                        <h2 className="text-lg font-semibold text-gray-500 mb-4">Add Resident</h2>
                        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="block mb-1">
                                First Name
                                <input type="text" name="FirstName" onChange={handleChange} required className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                            </label>
                            <label className="block mb-1">
                                Last Name
                                <input type="text" name="LastName" onChange={handleChange} required className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                            </label>
                            <label className="block mb-1">
                                Middle Name
                                <input type="text" name="MiddleName" onChange={handleChange} className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                            </label>
                            <label className="block mb-1">
                                Age
                                <input type="number" name="Age" onChange={handleChange} required className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                            </label>
                            <label className="block mb-1">
                                Birthday
                                <input type="date" name="birthday" onChange={handleChange} className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                            </label>
                            <label className="block mb-1">
                                Gender
                                <select name="Gender" onChange={handleChange} required className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400">
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </label>
                            <label className="block mb-1">
                                Address
                                <input type="text" name="Address" onChange={handleChange} required className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                            </label>
                            <label className="block mb-1">
                                Contact Number
                                <input type="text" name="ContactNumber" onChange={handleChange} required className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                            </label>
                            <label className="block mb-1">
                                Email
                                <input type="email" name="Email" onChange={handleChange} className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                            </label>
                            <label className="block mb-1">
                                Civil Status
                                <select name="CivilStatus" onChange={handleChange} className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400">
                                    <option value="">Select Civil Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Widowed">Widowed</option>
                                    <option value="Divorced">Divorced</option>
                                </select>
                            </label>
                            <label className="block mb-1">
                                Occupation
                                <input type="text" name="Occupation" onChange={handleChange} className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                            </label>
                            <label className="block mb-1">
                                Household ID
                                <input type="text" name="HouseholdID" onChange={handleChange} required className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                            </label>
                            <label className="block mb-1">
                                Juan Bataan ID
                                <div className='relative'>
                                    <img src={JuanBataanLogo} alt="Juan Bataan Logo" className="w-5 h-5 absolute left-2 top-2" />
                                    <input type="text" name="BarangayID" onChange={handleChange} className="border p-2 pl-8 mb-2 w-full rounded-md focus:outline-blue-400" />
                                </div>
                            </label>
                            <label className="block mb-1">
                                Registration Date
                                <input type="date" name="RegistrationDate" onChange={handleChange} className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400" />
                            </label>
                            <label className="block mb-1">
                                Status
                                <select name="Status" onChange={handleChange} className="border p-2 mb-2 w-full rounded-md focus:outline-blue-400">
                                    <option value="">Select Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </label>
                            <label className="flex items-center mb-2 md:col-span-3">
                                <input type="checkbox" name="RegisteredVoter" onChange={handleCheckboxChange} className="mr-2 focus:outline-blue-400" />
                                Registered Voter
                            </label>
                            {formData.RegisteredVoter && (
                                <>
                                    <label className="block mb-1 md:col-span-3">
                                        Voter ID Number
                                        <input
                                            type="text"
                                            name="VoterIDNumber"
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
                                            onChange={handleChange}
                                            className="border p-2 mb-2 w-full rounded-md focus:outline-blue-500"
                                            required
                                        />
                                    </label>
                                </>
                            )}
                            <div className="flex justify-end gap-4 mt-4 md:col-span-3">
                                <div className="flex justify-end gap-4 mt-4 md:col-span-3">
                                    <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
                                    <button type="submit" className={`bg-blue-600 text-white px-4 py-2 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading}>
                                        {loading ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-white rounded-full" />
                                                Loading...
                                            </span>
                                        ) : (
                                            'Add Resident'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddResidentModal;
