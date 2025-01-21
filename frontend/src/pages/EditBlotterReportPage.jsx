import React from 'react'
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom'

import Breadcrumbs from '../components/Breadcrumbs';

const EditBlotterReportPage = () => {

    const location = useLocation();

    const [blotterId, setBlotterId] = useState(null);

    useEffect(() => {
        if (location.state?.blotter_id) {
            setBlotterId(location.state.blotter_id);

            window.history.replaceState({}, document.title);
        }
    }, [location]);

    return (
        <div className="flex-grow p-6 bg-gray-100">
            <Breadcrumbs />
            <div className="mx-auto bg-white p-10 rounded-lg">
                <div className="mb-6 leading-3">
                    <h1 className="text-xl font-semibold text-gray-500">Edit Complaint</h1>
                    {blotterId ? <p className="text-sm text-gray-400 mt-2">Editing blotter report with ID: {blotterId}</p> : <p>No blotter report selected.</p>}
                </div>

            </div>
        </div>
    )
}

export default EditBlotterReportPage