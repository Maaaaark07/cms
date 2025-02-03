import React from 'react'

const CertificationPermit = () => {
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
    )
}

export default CertificationPermit