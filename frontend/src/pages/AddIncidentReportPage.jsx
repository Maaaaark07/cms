import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Breadcrumbs from "../components/Breadcrumbs";
import Pagination from '../components/Pagination';
import Search from '../components/Search';


const AddIncidentReportPage = () => {
    const [errorMessage, setErrorMessage] = useState(null);

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
                                <h1 className="text-xl font-semibold text-gray-500">Add New Incident Report</h1>
                                <p className="text-sm text-gray-400 mt-2">Fill out the form below to add a new incident report to the system.</p>
                            </div>
                            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                        </div>
                    </div>
                </main>
            </div>
        </div>

    );
}

export default AddIncidentReportPage