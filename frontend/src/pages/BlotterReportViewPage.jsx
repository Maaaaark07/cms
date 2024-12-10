import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Breadcrumbs from "../components/Breadcrumbs";
import Pagination from '../components/Pagination';
import Search from '../components/Search';

const IncidentRepotViewPage = () => {
    const location = useLocation();

    const [incidentDetails, setIncidentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { blotter_id } = location.state || {};

    useEffect(() => {
        fetchIncidentDetails();
    }, [blotter_id]);

    const fetchIncidentDetails = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/blotter/get/` + blotter_id,
                {
                    withCredentials: true,
                }
            );
            setIncidentDetails(response.data[0]);
            console.log(response.data[0])
            setLoading(false);
        } catch (error) {
            console.error("Error fetching residents data:", error);
        }
    };

    if (!incidentDetails) return <p>Loading...</p>;

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-row flex-grow">
                <Sidebar />
                <main className="flex-grow p-4 bg-gray-100">
                    <div className="flex-grow p-6 bg-gray-100">
                        <Breadcrumbs />
                        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                        {
                            loading ? (<div className="text-center">Loading...</div>
                            ) : (
                                <div className="mx-auto bg-white p-10 rounded-lg">
                                    <div className="mb-6 leading-3">
                                        <h1 className="text-xl font-semibold text-blue-500">
                                            CR-#{incidentDetails?.blotter_id}
                                        </h1>
                                    </div>
                                    <div className="col-span-1 mb-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                            <div className='flex-1'>
                                                <label className="mb-1 font-medium text-gray-600">Complainant Name: </label>
                                                <span className="text-gray-400">{incidentDetails?.complainant}</span>
                                            </div>
                                            <div className='flex-1'>
                                                <label className="mb-1 font-medium text-gray-600">Nature of Complaint: </label>
                                                <span className="text-gray-400">{incidentDetails?.incident_type}</span>
                                            </div>
                                            <div className='flex-1'>
                                                <label className="mb-1 font-medium text-gray-600">Address: </label>
                                                <span className="text-gray-400">N/A</span>
                                            </div>
                                            <div className='flex-1'>
                                                <label className="mb-1 font-medium text-gray-600">Date of Filling: </label>
                                                <span className="text-gray-400">{incidentDetails?.report_date}</span>
                                            </div>
                                            <div className='flex-1'>
                                                <label className="mb-1 font-medium text-gray-600">Contact Number: </label>
                                                <span className="text-gray-400">N/A</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )

                        }
                        {/* <Pagination
                           currentPage={currentPage}
                           totalPages={totalFilteredPages}
                           onPageChange={handlePageChange}
                           itemsPerPage={itemsPerPage}
                           onItemsPerPageChange={handleItemsPerPageChange} /> */}
                    </div>
                </main>
            </div >
        </div >
    );
};

export default IncidentRepotViewPage;
