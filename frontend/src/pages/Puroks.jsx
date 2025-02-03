import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { useAuth } from '../components/AuthContext';
import ToastMessage from '../components/ToastMessage'
import cfg from '../../../server/config/domain';

const Puroks = () => {

    const [puroks, setPuroks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [purokName, setPurokName] = useState('');
    const [showToasTmessage, setShowToastMessage] = useState(false);

    const { barangayId } = useAuth();

    useEffect(() => {
        fetchPurok();
    }, []);

    const fetchPurok = async () => {
        try {
            const response = await axios.get(`http://${cfg.domainname}:${cfg.serverport}/purok/get-puroks/` + barangayId, { withCredentials: true });
            setPuroks(response.data[0]);
        } catch (error) {
            console.error("Error fetching residents data:", error);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();

        // if (!purokName) {
        //     alert("Please enter an address.");
        //     return;
        // }

        try {
            const payload = {
                p_puroks: [purokName],
                p_barangay_id: barangayId,
            };

            await axios.post(`http://${cfg.domainname}:${cfg.serverport}/purok/add-puroks`, payload, { withCredentials: true });
            fetchPurok();
            setShowModal(false);
            setPurokName('');
            setShowToastMessage(true)
        } catch (error) {
            console.error("Error adding purok data:", error);
        }
    };

    return (
        <div>
            <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded-md mb-6 shadow hover:bg-blue-600 transition duration-200"
            >
                + Add Address
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-xl font-semibold mb-4">Add Address</h2>
                        <form onSubmit={handleAddAddress}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Street/Subdivision Name
                                </label>
                                <input
                                    type="text"
                                    value={purokName}
                                    onChange={(e) => setPurokName(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter address"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden text-sm">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="text-left p-4 font-semibold text-gray-800">Street/Subdivision</th>
                            <th className="text-center p-4 font-semibold text-gray-800">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {puroks.map((purok) => (
                            <tr key={purok.purok_id} className="hover:bg-blue-50">
                                <td className="px-4 py-3 text-gray-700 border-b">{purok.purok_name}</td>
                                <td className="px-4 py-3 text-center border-b">
                                    <button className="text-blue-500 hover:underline mx-2">Edit</button>
                                    <button className="text-red-500 hover:underline mx-2">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ToastMessage
                message={`Purok Added Successfully`}
                variant="default"
                isVisible={showToasTmessage}
                duration={3000}
                onClose={() => setShowToastMessage(false)}
            />
        </div>

    )
}

export default Puroks