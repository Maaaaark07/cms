import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import axios from 'axios';
import cfg from '../../../server/config/domain.js';
import { useDateFormatter } from '../hooks/useDateFormatter';

const EditBlotterReportPage = () => {

    const location = useLocation();
    const { formatIncidentDate } = useDateFormatter();

    const [blotterId, setBlotterId] = useState(null);
    const [blotterDetails, setBlotterDetails] = useState(null);

    const [selectedIncidentLocation, setSelectedIncidentLocation] = useState("");
    const [selectedIncidentDate, setSelectedIncidentDate] = useState("");

    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (location.state?.blotter_id) {
            const id = location.state.blotter_id;
            setBlotterId(id);

            fetchBlotterReport(id);

            window.history.replaceState({}, document.title, location.pathname);
        }
    }, [location]);

    const fetchBlotterReport = async (id) => {
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/blotter/get/${id}`,
                { withCredentials: true }
            );

            if (response.status === 200) {

                const blotterData = response.data[0];

                setBlotterDetails(blotterData);
                setSelectedIncidentLocation(blotterData.incident_location || "");
                setSelectedIncidentDate(formatIncidentDate(blotterData.incident_date, 'yyyy-mm-dd') || "");

                console.log(blotterData);
            }
        } catch (error) {
            console.error("Error fetching blotter report:", error);
            setErrorMessage("Error fetching reporter ID:", error);
        }
    };

    const handleIncidentLocationChange = (e) => {
        setSelectedIncidentLocation(e.target.value);
        setBlotterDetails((prev) => ({
            ...prev,
            incident_location: e.target.value,
        }));
    };

    const handleIncidentDateChange = (e) => {
        setSelectedIncidentDate(e.target.value);
        setBlotterDetails((prev) => ({
            ...prev,
            incident_date: e.target.value,
        }));
    };

    return (
        <div className="flex-grow p-6 bg-gray-100">
            <Breadcrumbs />
            <div className="mx-auto bg-white p-10 rounded-lg">
                <div className="mb-6 leading-3">
                    <h1 className="text-xl font-semibold text-gray-500">Edit Complaint</h1>
                    {blotterId ? (
                        <p className="text-sm text-gray-400 mt-2">
                            Editing blotter report with ID: {blotterId}
                        </p>
                    ) : (
                        <p className="text-red-500 text-sm mb-4 mt-2">
                            No blotter report selected.
                        </p>
                    )}
                </div>
                {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                <div className="col-span-1 md:col-span-3 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="flex-1">
                            <label className="block mb-2 text-sm font-medium text-gray-500">
                                Nature of Complain<span className="text-red-600">*</span>
                            </label>
                            {/* <SearchDropdown onSelect={handleComplaintTypeChange} /> */}
                        </div>
                        <div className="flex-1">
                            <label className="block mb-2 text-sm font-medium text-gray-500">
                                Incident Date<span className="text-red-600">*</span>
                            </label>
                            <input type="date" name="Incident Date" value={selectedIncidentDate} onChange={handleIncidentDateChange} className="border text-sm border-gray-300 p-2 w-full rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex-1">
                            <label className="block mb-2 text-sm font-medium text-gray-500">
                                Incident Location<span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                name="Incident Location"
                                placeholder="Type Complainant Address"
                                className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedIncidentLocation}
                                onChange={handleIncidentLocationChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditBlotterReportPage;
