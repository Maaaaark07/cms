import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Breadcrumbs from "../components/Breadcrumbs";
import Pagination from '../components/Pagination';
import axios from "axios";
import Search from '../components/Search';
import { IoPersonAddOutline } from "react-icons/io5";
import { useAuth } from "../components/AuthContext";

const IncidentReport = () => {
    const [blotters, setBlooters] = useState(null);
    const { barangayId } = useAuth();

    useEffect(() => {
        fetchBlotters();
    }, []);

    async function fetchBlotters() {
        try {
            const response = await axios.get("http://localhost:8080/blotter/" + barangayId, {
                withCredentials: true,
            });
            setBlooters(response.data);
        } catch (error) {
            console.error("Error fetching blotters data:", error);
        }
    }

    console.log(blotters);

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-row flex-grow">
                <Sidebar />
                <main className="flex-grow p-4 bg-gray-100">
                    <div className="flex-grow p-6 bg-gray-100">
                        <Breadcrumbs />
                        <h1 className='text-2xl font-bold text-gray-500 mb-6'>Incident Report</h1>
                        <div className='flex items-center justify-between mb-6'>
                            <div className='relative max-w-96 w-full'>
                                {/* <Search
                                    searchQuery={null}
                                    onSearchChange={null}
                                /> */}
                            </div>
                            <div>
                                <button className='bg-blue-600 text-white px-5 py-3 text-sm flex items-center gap-2 rounded-full'>
                                    <IoPersonAddOutline className='w-4 h-4 text-white font-bold' />
                                    Add Incident Report
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto mt-4">
                            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden text-sm">
                                <thead className='bg-gray-200'>
                                    <tr>
                                        <th className="text-left p-3 font-semibold text-gray-700">Name</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Address</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Household ID</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Registered Voter</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Contact Number</th>
                                        <th className="text-center p-3 font-semibold text-gray-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        <tr>
                                            <td colSpan="6" className="p-4 text-center text-sm text-gray-500">
                                                No Data Available.
                                            </td>
                                        </tr>

                                    }
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={1}
                            totalPages={10}
                            onPageChange={null}
                            itemsPerPage={10}
                            onItemsPerPageChange={null}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default IncidentReport;