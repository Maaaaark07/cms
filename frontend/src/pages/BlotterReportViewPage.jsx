import axios from "axios";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useAuth } from "../components/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useDateFormatter } from "../hooks/useDateFormatter";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Breadcrumbs from "../components/Breadcrumbs";
import Pagination from '../components/Pagination';
import ActionModal from "../components/ActionModal.jsx";
import ToastMessage from "../components/ToastMessage.jsx";
import Search from '../components/Search';
import StatusBadge from "../components/StatusBadge";
import SearchDropdown from "../components/SearchDropdown";
import InputDropdown from "../components/InputDropdown";

import cfg from '../../../server/config/domain.js';

import { LuLayoutGrid, LuLayoutList } from "react-icons/lu";
import { IoPersonAddOutline, IoDocumentText } from "react-icons/io5";
import { GrEdit } from "react-icons/gr";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import AlertDialog from "../components/AlertDialog.jsx";

const IncidentRepotViewPage = () => {
    const location = useLocation();
    const { formatIncidentDate } = useDateFormatter();

    const [blotterDetails, setBlotterDetails] = useState(null);
    const [blotterHearingDetails, setBlotterHearingDetails] = useState([]);

    const [showAddToast, setShowAddToast] = useState(false);
    const [showDeleteToast, setShowDeleteToast] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [hearingLoading, setHearingLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isSingleColumn, setIsSingleColumn] = useState(() => {
        return localStorage.getItem("isSingleColumn") === "true";
    });

    //Modal
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

    const { blotter_id } = location.state || {};

    useEffect(() => {
        localStorage.setItem("isSingleColumn", isSingleColumn);
    }, [isSingleColumn]);

    useEffect(() => {
        fetchBlotterDetails();
        fetchBlotterHearings();
    }, [blotter_id]);

    const fetchBlotterDetails = async () => {
        try {
            setDetailsLoading(true);
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/blotter/get/` +
                blotter_id, {
                withCredentials: true,
            });
            setBlotterDetails(response.data[0]);
        } catch (error) {
            setError("Failed to fetch data. Please try again later.");
            console.error(error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const fetchBlotterHearings = async () => {
        try {
            setHearingLoading(true);
            const response = await axios.get(`http://${cfg.domainname}:${cfg.serverport}/blotter/get-hearing/` + blotter_id, {
                withCredentials: true,
            });
            setBlotterHearingDetails(response.data);
        } catch (error) {
            setError("Failed to fetch hearing details.");
            console.error(error);
        } finally {
            setHearingLoading(false);
        }
    };

    const handleDeleteBlotterHearings = async (id) => {
        try {
            await axios.delete(`http://${cfg.domainname}:${cfg.serverport}/blotter/delete-hearing/` +
                id, {
                withCredentials: true
            });

            fetchBlotterHearings();
            setShowDeleteToast(true);

        } catch (error) {
            setError("Failed to delete blotter hearing.");
            console.error(error);
        }
    }

    if (!blotterDetails) return <p>Loading...</p>;

    const defendants = JSON.parse(blotterDetails?.defendants || "[]");
    const addresses = JSON.parse(blotterDetails?.def_addresses || "[]");
    const contacts = JSON.parse(blotterDetails?.def_contacts || "[]");

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
                            detailsLoading ? (<div className="text-center">Loading...</div>
                            ) : (
                                <>
                                    <div className="mx-auto bg-white p-10 rounded-lg mb-12">
                                        <div className="mb-6 leading-3">
                                            <h1 className="text-lg font-semibold text-blue-500">
                                                CR-#{blotterDetails?.blotter_id}
                                            </h1>
                                        </div>
                                        <div className="col-span-1">
                                            {/* Complainants Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6 border-b-2 pb-6">
                                                <h2 className='text-lg font-bold text-gray-500'>Complainant</h2>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className='flex-1'>
                                                        <label className="mb-1 font-medium text-gray-500">Name: </label>
                                                        <span className="text-gray-400">{blotterDetails?.complainant ?? "N/A"}</span>
                                                    </div>
                                                    <div className='flex-1'>
                                                        <label className="mb-1 font-medium text-gray-500">Nature of Complaint: </label>
                                                        <span className="text-gray-400">{blotterDetails?.incident_type ?? "N/A"}</span>
                                                    </div>
                                                    <div className='flex-1'>
                                                        <label className="mb-1 font-medium text-gray-500">Address: </label>
                                                        <span className="text-gray-400">{blotterDetails?.address ?? "N/A"}</span>
                                                    </div>
                                                    <div className='flex-1'>
                                                        <label className="mb-1 font-medium text-gray-500">Date of Filling: </label>
                                                        <span className="text-gray-400">{formatIncidentDate(blotterDetails?.report_date) ?? "N/A"}</span>
                                                    </div>
                                                    <div className='flex-1'>
                                                        <label className="mb-1 font-medium text-gray-500">Contact Number: </label>
                                                        <span className="text-gray-400">{blotterDetails?.contact ?? "N/A"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Defendants Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
                                                <div className="flex justify-between items-center">
                                                    <h2 className="text-lg font-bold text-gray-500">Defendants/Respondents</h2>
                                                    <div className="select-none" onClick={() => setIsSingleColumn((prev) => !prev)}>
                                                        {
                                                            isSingleColumn
                                                                ? <LuLayoutList className="w-6 h-6  text-gray-500 cursor-pointer" />
                                                                : <LuLayoutGrid className="w-6 h-6 text-gray-500 cursor-pointer" />
                                                        }
                                                    </div>
                                                </div>
                                                {defendants.map((defendant, index) => (
                                                    <div
                                                        key={index}
                                                        className={`grid grid-cols-1 ${!isSingleColumn ? 'md:grid-cols-1' : 'md:grid-cols-3'} gap-4 border-b-2 pb-4`}
                                                    >
                                                        <div>
                                                            <label className="mb-1 font-medium text-gray-500">Name: </label>
                                                            <span className="text-gray-400">{defendant}</span>
                                                        </div>
                                                        <div>
                                                            <label className="mb-1 font-medium text-gray-500">Address: </label>
                                                            <span className="text-gray-400">
                                                                {addresses[index] ?? "N/A"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <label className="mb-1 font-medium text-gray-500">Contact Number: </label>
                                                            <span className="text-gray-400">
                                                                {contacts[index] ?? "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Statement Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                                <h2 className="text-lg font-bold text-gray-500">Statements</h2>
                                                <p className="text-gray-400 max-w-screen-lg">
                                                    {blotterDetails?.notes ?? "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='flex items-center justify-end mb-6'>
                                            <button className='bg-blue-600 text-white px-5 py-3 text-sm flex items-center gap-2 rounded-full' onClick={() => setIsRecordModalOpen(true)}>
                                                <IoDocumentText className='w-4 h-4 text-white font-bold' />
                                                Record Session
                                            </button>
                                            <Modal
                                                isOpen={isRecordModalOpen}
                                                onClose={() => setIsRecordModalOpen(false)}
                                                blotter_id={blotter_id}
                                                onSuccess={() => {
                                                    fetchBlotterHearings();
                                                    setShowAddToast(true);
                                                }} />
                                        </div>
                                        <div className="overflow-x-auto rounded-lg mt-4">
                                            {hearingLoading ? (<div className="text-center">Loading... </div>
                                            ) : (
                                                <table className="min-w-full bg-white shadow-md  overflow-hidden text-sm">
                                                    <thead className='bg-gray-200'>
                                                        <tr>
                                                            <th className="text-left p-3 font-semibold text-gray-700">Hearing Date</th>
                                                            <th className="text-left p-3 font-semibold text-gray-700">Attendees</th>
                                                            <th className="text-left p-3 font-semibold text-gray-700">Resolution Remarks</th>
                                                            <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                                                            <th className="text-center p-3 font-semibold text-gray-700">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {blotterHearingDetails && blotterHearingDetails.length > 0 ? (
                                                            blotterHearingDetails.map((hearing, index) => {
                                                                const isLatest = index === blotterHearingDetails.length - 1; // 

                                                                return (
                                                                    <tr
                                                                        key={hearing.hearing_id}
                                                                        className="border-b hover:bg-gray-100 even:bg-gray-50"
                                                                    >
                                                                        <td className="p-4 text-sm text-gray-500">
                                                                            {formatIncidentDate(hearing.hearing_date)}
                                                                        </td>
                                                                        <td className="p-4 text-sm text-gray-500">
                                                                            {hearing.attendees ? JSON.parse(hearing.attendees).join(", ") : "N/A"}
                                                                        </td>
                                                                        <td className="p-4 text-sm text-gray-500">
                                                                            {hearing.remarks ?? "N/A"}
                                                                        </td>
                                                                        <td className="p-4 text-sm text-gray-500">
                                                                            <StatusBadge status={hearing.status} />
                                                                        </td>
                                                                        <td className="p-3 text-gray-500 flex items-center justify-center gap-2">
                                                                            {isLatest ? (
                                                                                <>
                                                                                    <div className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer">
                                                                                        <GrEdit className="w-5 h-5 text-gray-500" />
                                                                                    </div>

                                                                                    <div className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer">
                                                                                        <FaRegEye className="w-5 h-5 text-gray-500" />
                                                                                    </div>

                                                                                    <div className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer" title="Delete"
                                                                                        onClick={() => handleDeleteBlotterHearings(hearing.hearing_id)}>
                                                                                        <FaRegTrashAlt className="w-5 h-5 text-red-500" />
                                                                                    </div>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <div className="bg-gray-200 p-2 w-max rounded-lg cursor-not-allowed opacity-50">
                                                                                        <GrEdit className="w-5 h-5 text-gray-500" />
                                                                                    </div>

                                                                                    <div className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer">
                                                                                        <FaRegEye className="w-5 h-5 text-gray-500" />
                                                                                    </div>

                                                                                    <div className="bg-gray-200 p-2 w-max rounded-lg cursor-not-allowed opacity-50">
                                                                                        <FaRegTrashAlt className="w-5 h-5 text-red-500" />
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                        </td>

                                                                    </tr>
                                                                );
                                                            })
                                                        ) : (
                                                            <tr>
                                                                <td
                                                                    colSpan={6}
                                                                    className="p-4 text-center text-sm text-gray-500"
                                                                >
                                                                    No Data Available.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )

                        }
                        {/* <Pagination
                           currentPage={currentPage}
                           totalPages={totalFilteredPages}
                           onPageChange={handlePageChange}
                           itemsPerPage={itemsPerPage}
                           onItemsPerPageChange={handleItemsPerPageChange} /> */}

                        <ToastMessage
                            message="Blotter hearing successfully added!"
                            variant="default"
                            isVisible={showAddToast}
                            duration={3000}
                            onClose={() => setShowAddToast(false)}
                        />
                        <ToastMessage
                            message="Blotter hearing successfully deleted!"
                            variant="delete"
                            isVisible={showDeleteToast}
                            duration={3000}
                            onClose={() => setShowDeleteToast(false)}
                        />
                    </div>
                </main>
            </div >
        </div >
    );
};

export default IncidentRepotViewPage;


function Modal({ isOpen, onClose, blotter_id, onSuccess }) {

    const { barangayId } = useAuth();

    const [barangayOfficials, setBarangayOfficials] = useState(null);
    const [hearingStatuses, setHearingStatuses] = useState(null);

    const [selectedBarangayOfficial, setSelectedBarangayOfficial] = useState(null);
    const [selectedHearingStatus, setSelectedHearingStatus] = useState(null);
    const [selectedAttendess, setSelectedAttendess] = useState([]);
    const [remarks, setRemarks] = useState("");

    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen && barangayId) {
            fetchBarangayOfficials();
            fetchHearingStatuses();
        }
    }, [isOpen, barangayId]);

    const fetchBarangayOfficials = async () => {
        try {
            const response = await axios.get(`http://${cfg.domainname}:${cfg.serverport}/official/` + barangayId, { withCredentials: true });
            if (response.status !== 200) throw new Error("Something went wrong with fetching data");
            setBarangayOfficials(response.data);

        } catch (error) {
            console.error(error.message);
            setError(error.message);
        }
    }

    const fetchHearingStatuses = async () => {
        try {
            const response = await axios.get(`http://${cfg.domainname}:${cfg.serverport}/blotter/get-hearing-statuses/`, { withCredentials: true });
            if (response.status !== 200) throw new Error("Something went wrong with fetching data");
            setHearingStatuses(response.data);
        } catch (error) {
            console.error(error.message);
            setError(error.message);
        }
    }

    const handleSubmit = async () => {
        //Add Validation
        const payload = {
            hearing_date: null,
            blotter_id: blotter_id,
            attendees: selectedAttendess,
            remarks: remarks,
            status_id: selectedHearingStatus?.iid,
            official_id: selectedBarangayOfficial?.official_id
        }

        if (!remarks || !selectedAttendess || !selectedHearingStatus?.iid || !selectedBarangayOfficial?.official_id) return;

        try {
            const response = await axios.post(`http://${cfg.domainname}:${cfg.serverport}/blotter/add/blotter-hearings`, payload, { withCredentials: true });
            if (response.status === 201) {
                setError(null);
                onSuccess();
                handleOnClose();

            }
            console.log(response);
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || "An error occurred.");
        }
    };

    const handleOnClose = () => {
        setSelectedBarangayOfficial("");
        setSelectedHearingStatus("");
        setRemarks("");
        setSelectedAttendess([]);
        setIsAlertModalOpen(false);
        onClose();
    };

    const handleSelectedHearingStatusesChange = (selectedValue) => {
        setSelectedHearingStatus(selectedValue);
    };

    const handleSelectedBarangayOfficialsChange = (selectedValue) => {
        setSelectedBarangayOfficial(selectedValue);
    };

    const handleAddAttendeesChange = (item) => {
        setSelectedAttendess((attendee) => [...attendee, item]);
    }

    const handleRemoveAttendeesChange = (item) => {
        setSelectedAttendess((attendee) => attendee.filter((i) => i !== item));
    }

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-wrapper" role="modal">
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 min-h-[560px]">
                    <div className='flex justify-between mb-2'>
                        <h2 className="text-xl font-semibold">Record Session</h2>
                        <IoClose
                            className='w-6 h-6 cursor-pointer'
                            onClick={() => setIsAlertModalOpen(true)}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        <div className="mb-6">
                            <label className="block mb-2 text-base font-medium text-gray-500">Attendees<span className="text-red-600">*</span></label>
                            <InputDropdown
                                title="Add Attendees"
                                placeholder="Type Attendee Name"
                                options={selectedAttendess}
                                onAddValue={handleAddAttendeesChange}
                                onRemoveValue={handleRemoveAttendeesChange} />
                        </div>
                        <div className="mb-6">
                            <label className="block mb-2 text-base font-medium text-gray-500">Officer In Charge<span className="text-red-600">*</span></label>
                            <SearchDropdown
                                options={barangayOfficials}
                                selectedValue={selectedBarangayOfficial?.full_name}
                                onSelect={handleSelectedBarangayOfficialsChange}
                                uniqueKey={"full_name"}
                                placeholder={"Search an Officer"}
                                title="Select Officer" />
                        </div>
                        <div className="mb-6">
                            <label className="block mb-2 text-base font-medium text-gray-500">Status<span className="text-red-600">*</span></label>
                            <SearchDropdown
                                options={hearingStatuses}
                                selectedValue={selectedHearingStatus?.iname}
                                onSelect={handleSelectedHearingStatusesChange}
                                uniqueKey={"iname"}
                                placeholder={"Search Status"}
                                title="Select Hearing Status" />
                        </div>
                        <div className="col-span-full">
                            <label className="block mb-2 text-base font-medium text-gray-500">Resolution Remarks<span className="text-red-600">*</span></label>
                            <textarea
                                className="border text-sm border-gray-300 p-2 h-48 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                name="certificateDetails"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Type remarks"
                            ></textarea>
                        </div>
                        <div className="col-span-full flex justify-end mt-4 space-x-4">
                            <button
                                type="submit"
                                onClick={() => handleSubmit()}
                                className={`bg-blue-500 text-white py-2 px-4 rounded-md `}
                            >
                                Submit
                            </button>
                        </div>

                    </div>
                </div>
                <AlertDialog
                    isOpen={isAlertModalOpen}
                    message={"Are you sure you want to cancel all changes? This will undo any unsaved changes."}
                    title="Cancel"
                    buttonConfig={[
                        {
                            label: "No",
                            color: "bg-gray-200 text-gray-600",
                            action: () => setIsAlertModalOpen(false),
                        },
                        {
                            label: "Yes, Cancel",
                            color: "bg-red-600 text-white",
                            action: () => handleOnClose(),
                        },
                    ]}
                />
            </div>
        </div>,
        document.body
    );
}