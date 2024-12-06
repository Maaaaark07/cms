import React from 'react'
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Breadcrumbs from "../components/Breadcrumbs";

import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const AddCertificationPage = () => {

    const [certificateTypes, setCertificateTypes] = useState([])
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCertificateType();
    }, []);

    async function fetchCertificateType() {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/certificate/", {
                withCredentials: true,
            });
            setCertificateTypes(response.data);
            console.log("Certificate Types:", response.data);
        } catch (error) {
            console.error("Error fetching certificate types:", error);
            setError("Failed to fetch certificate types. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

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
                                <h1 className="text-xl font-semibold text-gray-500">Add Certification</h1>
                                <p className="text-sm text-gray-400 mt-2">Fill out the form below to add a new certificate to the system.</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AddCertificationPage