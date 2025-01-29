import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

import Breadcrumbs from "../components/Breadcrumbs";
import ToastMessage from "../components/ToastMessage.jsx";
import Tabs from "../components/Tabs.jsx";

import BlotterComplaintPage from "../pages/BlotterComplaintPage";
import BlotterIncidentPage from "../pages/BlotterIncidentPage";

const IncidentReport = () => {

    const location = useLocation();
    const navigate = useNavigate();

    //Toast
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showSuccessToastIncident, setShowSuccessToastIncident] = useState(false);
    const [showDeleteToastIncident, setShowDeleteToastIncident] = useState(false);

    useEffect(() => {
        const incidentToastType = location.state?.incidentToastType;

        if (incidentToastType) {
            console.log(incidentToastType);
            setShowSuccessToastIncident(incidentToastType === "Add");
            setShowDeleteToastIncident(incidentToastType === "Delete");

            // Clear the state after handling it
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    useEffect(() => {
        if (location.state?.toastMessage) {
            setShowSuccessToast(true);

            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    return (
        <div className="flex-grow p-6 bg-gray-100">
            <Breadcrumbs />
            <h1 className='text-2xl font-bold text-gray-500 mb-4'>Blotter Report</h1>

            <Tabs id="blotterActiveTab" tabs={[
                { label: "Complaint", content: <BlotterComplaintPage /> },
                { label: "Incident", content: <BlotterIncidentPage /> },
            ]} />

            <ToastMessage
                message={`Blotter record ${location.state?.type === "Update" ? "updated" : "added"} successfully!`}
                variant="default"
                isVisible={showSuccessToast}
                duration={3000}
                onClose={() => setShowSuccessToast(false)}
            />

            {/* Incident Toast Messages */}
            <ToastMessage
                message={`Incident record ${location.state?.incidentToastType !== "Add" ? "added" : "updated"} successfully!`}
                variant="default"
                isVisible={showSuccessToastIncident}
                duration={3000}
                onClose={() => setShowSuccessToastIncident(false)}
            />

            <ToastMessage
                message="Incident record successfully deleted!"
                variant="delete"
                isVisible={showDeleteToastIncident}
                duration={3000}
                onClose={() => setShowDeleteToastIncident(false)}
            />
        </div>
    );
};

export default IncidentReport;