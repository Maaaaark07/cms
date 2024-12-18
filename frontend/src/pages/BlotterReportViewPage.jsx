import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useDateFormatter } from "../hooks/useDateFormatter";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Breadcrumbs from "../components/Breadcrumbs";
import Pagination from '../components/Pagination';
import Search from '../components/Search';
import StatusBadge from "../components/StatusBadge";

import { LuLayoutGrid, LuLayoutList } from "react-icons/lu";
import { IoPersonAddOutline, IoDocumentText } from "react-icons/io5";
import { GrEdit } from "react-icons/gr";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";

const IncidentRepotViewPage = () => {
    const location = useLocation();
    const { formatIncidentDate } = useDateFormatter();

    const [blotterDetails, setBlotterDetails] = useState(null);
    const [blotterHearingDetails, setBlotterHearingDetails] = useState([]);

    const [detailsLoading, setDetailsLoading] = useState(false);
    const [hearingLoading, setHearingLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSingleColumn, setIsSingleColumn] = useState(false);

    const { blotter_id } = location.state || {};

    useEffect(() => {
        fetchBlotterDetails();
        fetchBlotterHearings();
    }, [blotter_id]);

    const fetchBlotterDetails = async () => {
        try {
            setDetailsLoading(true);
            const response = await axios.get(
                `http://localhost:8080/blotter/get/` +
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
            const response = await axios.get(`http://localhost:8080/blotter/get-hearing/` + blotter_id, {
                withCredentials: true,
            });
            setBlotterHearingDetails(response.data);
            console.log(response.data)
        } catch (error) {
            setError("Failed to fetch hearing details.");
            console.error(error);
        } finally {
            setHearingLoading(false);
        }
    };


    if (!blotterDetails) return <p>Loading...</p>;

    const defendants = JSON.parse(blotterDetails?.defendants || "[]");
    const addresses = JSON.parse(blotterDetails?.addresses || "[]");
    const contacts = JSON.parse(blotterDetails?.contacts || "[]");

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
                                            <button className='bg-blue-600 text-white px-5 py-3 text-sm flex items-center gap-2 rounded-full'>
                                                <IoDocumentText className='w-4 h-4 text-white font-bold' />
                                                Record Session
                                            </button>
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
                                                                            {hearing.attendees ?? "N/A"}
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
                                                                                    <div className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer">
                                                                                        <FaRegTrashAlt className="w-5 h-5 text-red-500" />
                                                                                    </div>
                                                                                </>
                                                                            ) : (

                                                                                <div className="p-2">
                                                                                    <span className="text-gray-400 text-sm block h-full italic">Actions disabled</span>
                                                                                </div>
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
                    </div>
                </main>
            </div >
        </div >
    );
};

export default IncidentRepotViewPage;
