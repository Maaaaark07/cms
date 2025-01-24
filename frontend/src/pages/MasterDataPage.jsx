import React, { useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';

const MasterDataPage = () => {
    const [activeTab, setActiveTab] = useState('Street/Subdivision Address');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Street/Subdivision Address':
                return (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Street/Subdivision Address</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Manage and view details about streets and subdivisions under your barangay. Add, edit, or delete addresses to maintain accurate records.
                        </p>
                        <button className="bg-blue-500 text-white px-6 py-2 rounded-md mb-6 shadow hover:bg-blue-600 transition duration-200">
                            + Add Address
                        </button>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden text-sm">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-800">Street/Subdivision</th>
                                        <th className="text-left p-4 font-semibold text-gray-800">Barangay</th>
                                        <th className="text-center p-4 font-semibold text-gray-800">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-blue-50">
                                        <td className="px-4 py-3 text-gray-700 border-b">Sample Street</td>
                                        <td className="px-4 py-3 text-gray-700 border-b">Barangay 1</td>
                                        <td className="px-4 py-3 text-center border-b">
                                            <button className="text-blue-500 hover:underline mx-2">Edit</button>
                                            <button className="text-red-500 hover:underline mx-2">Delete</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'Barangay Council':
                return (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Barangay Council</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Manage information about barangay council members, their designations, and terms of service.
                        </p>
                        <button className="bg-blue-500 text-white px-6 py-2 rounded-md mb-6 shadow hover:bg-blue-600 transition duration-200">
                            + Add Member
                        </button>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden text-sm">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-800">Name</th>
                                        <th className="text-left p-4 font-semibold text-gray-800">Position</th>
                                        <th className="text-center p-4 font-semibold text-gray-800">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-blue-50">
                                        <td className="px-4 py-3 text-gray-700 border-b">Juan Dela Cruz</td>
                                        <td className="px-4 py-3 text-gray-700 border-b">Chairman</td>
                                        <td className="px-4 py-3 text-center border-b">
                                            <button className="text-blue-500 hover:underline mx-2">Edit</button>
                                            <button className="text-red-500 hover:underline mx-2">Delete</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'Certification & Permit':
                return (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Certification & Permit</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Issue, track, and manage certifications and permits issued by the barangay.
                        </p>
                        <button className="bg-blue-500 text-white px-6 py-2 rounded-md mb-6 shadow hover:bg-blue-600 transition duration-200">
                            + Issue Document
                        </button>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden text-sm">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-800">Document Type</th>
                                        <th className="text-left p-4 font-semibold text-gray-800">Issued To</th>
                                        <th className="text-left p-4 font-semibold text-gray-800">Date Issued</th>
                                        <th className="text-center p-4 font-semibold text-gray-800">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-blue-50">
                                        <td className="px-4 py-3 text-gray-700 border-b">Barangay Clearance</td>
                                        <td className="px-4 py-3 text-gray-700 border-b">Maria Clara</td>
                                        <td className="px-4 py-3 text-gray-700 border-b">2024-01-01</td>
                                        <td className="px-4 py-3 text-center border-b">
                                            <button className="text-blue-500 hover:underline mx-2">Edit</button>
                                            <button className="text-red-500 hover:underline mx-2">Delete</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex-grow p-6 bg-gray-100">
            <Breadcrumbs />
            <div className="border-b border-gray-400 mb-4 flex">
                {['Street/Subdivision Address', 'Barangay Council', 'Certification & Permit'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 transition duration-200 ${activeTab === tab
                            ? 'border-b-4 border-blue-500 text-blue-500 font-semibold'
                            : 'text-gray-500 hover:text-blue-500'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {renderTabContent()}
        </div>
    );
};

export default MasterDataPage;
