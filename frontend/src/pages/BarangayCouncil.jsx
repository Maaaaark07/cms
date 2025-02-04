import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import cfg from '../../../server/config/domain';
import SearchModal from '../components/SearchModal'

const BarangayCouncil = () => {
    const { barangayId } = useAuth();
    const [barangayOfficials, setBarangayOfficials] = useState([]);
    const [barangayOfficialType, setBarangayOfficialType] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (barangayId) {
            fetchBarangayOfficials();
        }
        fetchBarangayOfficialType();
    }, [barangayId]);

    const fetchBarangayOfficials = async () => {
        try {
            const response = await axios.get(`http://${cfg.domainname}:${cfg.serverport}/official/1/${barangayId}`, {
                withCredentials: true,
            });
            if (response.status !== 200) throw new Error("Something went wrong with fetching data");
            setBarangayOfficials(response.data.data);
        } catch (error) {
            console.error(error.message);
        }
    };

    const fetchBarangayOfficialType = async () => {
        try {
            const response = await axios.get(`http://${cfg.domainname}:${cfg.serverport}/official/official-type/${1}`, {
                withCredentials: true,
            });
            if (response.status !== 200) throw new Error("Something went wrong with fetching data");
            setBarangayOfficialType(response.data);
            console.log(response.data);
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <div className="">
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded-md mb-6 shadow hover:bg-blue-600 transition duration-200"
            >
                + Add Member
            </button>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden text-sm">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="text-left p-4 font-semibold text-gray-800">Name</th>
                            <th className="text-left p-4 font-semibold text-gray-800">Position</th>
                            <th className="text-left p-4 font-semibold text-gray-800">Designated Role</th>
                            <th className="text-center p-4 font-semibold text-gray-800">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {barangayOfficials.map((official) => (
                            <tr key={official.official_id} className="hover:bg-blue-50">
                                <td className="px-4 py-3 text-gray-500 border-b">{official.full_name}</td>
                                <td className="px-4 py-3 text-gray-500 border-b">{official.official_position}</td>
                                <td className="px-4 py-3 text-gray-500 border-b">{official.committee}</td>
                                <td className="px-4 py-3 text-center border-b">
                                    <button className="text-blue-500 hover:underline mx-2">Edit</button>
                                    <button className="text-red-500 hover:underline mx-2">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <AddOfficialModal
                    onClose={() => setIsModalOpen(false)}
                    refreshData={fetchBarangayOfficials}
                    barangayId={barangayId}
                    officialTypes={barangayOfficialType}
                />
            )}
        </div>
    );
};

const AddOfficialModal = ({ onClose, refreshData, barangayId, officialTypes }) => {

    const [formData, setFormData] = useState({
        official_type_id: "",
        resident_id: "",
        full_name: "",
        position_rank: "",
        committee: "",
        barangay_id: barangayId,
        city_id: "",
        province_id: ""
    });

    const handleSelectResident = (resident) => {
        setFormData(prev => ({
            ...prev,
            resident_id: resident.resident_id,
            full_name: `${resident.first_name} ${resident.last_name}`,
            city_id: resident.city_id,
            province_id: resident.province_id
        }));
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `http://${cfg.domainname}:${cfg.serverport}/official/add-official`,
                formData,
                { withCredentials: true }
            );

            if (response.data.success) {
                alert("Official added successfully!");
                refreshData();
                onClose();
            } else {
                throw new Error(response.data.error || "Failed to add official");
            }
        } catch (error) {
            console.error("Error adding official:", error);
            alert(error.message || "Failed to add official. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6">Add New Official</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 font-medium text-gray-500">Official Type</label>
                        <select
                            name="official_type_id"
                            value={formData.official_type_id}
                            onChange={handleInputChange}
                            className="border text-sm border-gray-300 p-2 w-full rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Official Type</option>
                            {officialTypes.map((type) => (
                                <option className='text-gray-700' key={type.iid} value={type.iid}>
                                    {type.iname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <SearchModal
                        title="Select Complainant"
                        isOpen={isComplainantModalOpen}
                        onClose={() => setIsComplainantModalOpen(false)}
                        onSelect={handleSelectComplainant}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Position Rank</label>
                        <input
                            type="text"
                            name="position_rank"
                            value={formData.position_rank}
                            onChange={handleInputChange}
                            className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Committee</label>
                        <input
                            type="text"
                            name="committee"
                            value={formData.committee}
                            onChange={handleInputChange}
                            className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                        >
                            Add Official
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BarangayCouncil;