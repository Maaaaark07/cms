import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Breadcrumbs from "../components/Breadcrumbs";
import Pagination from '../components/Pagination';
import Search from '../components/Search';
import ComplaintTypeSelect from "../components/ComplaintTypeDropdown";

const AddIncidentReportPage = () => {
    const [errorMessage, setErrorMessage] = useState(null);
    const [selectedComlaintType, setSelectedComplaintType] = useState(null);

    const handleComplaintTypeChange = (selectedValue) => {
        setSelectedComplaintType(selectedValue)
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
                                <h1 className="text-xl font-semibold text-gray-500">Add Complaint</h1>
                                <p className="text-sm text-gray-400 mt-2">Fill out the form below to add a new complaint to the system.</p>
                            </div>
                            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                            <div className="col-span-1 md:col-span-3 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6  mb-8">
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">Complaint Type<span className="text-red-600">*</span></label>
                                        <ComplaintTypeSelect onSelect={handleComplaintTypeChange} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">Complaint Name<span className="text-red-600">*</span></label>
                                        <input type="text" name="ComplaintName" placeholder="Type or Search Complainant Name" className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">Address<span className="text-red-600">*</span></label>
                                        <input type="text" name="Address" placeholder="Type Complainant Address" className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">Contact Number</label>
                                        <input type="text" name="ComplaintContactNumber" placeholder="Type Complainant Contact Number" className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>

    );
}

export default AddIncidentReportPage