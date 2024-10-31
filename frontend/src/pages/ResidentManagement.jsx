import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';
import Pagination from '../components/Pagination';
import { IoPersonAddOutline } from "react-icons/io5";
import Search from '../components/Search';
import axios from 'axios';
import { RxAvatar } from "react-icons/rx";
import { GrEdit } from "react-icons/gr";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { IoFingerPrint } from 'react-icons/io5';
import ActionModal from '../components/ActionModal';
import AddResidentModal from '../components/AddResidentModal';

const ResidentManagement = () => {
    const [residents, setResidents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionType, setActionType] = useState('');
    const [residentToDelete, setResidentToDelete] = useState(null);
    const [isAddResidentModalOpen, setIsAddResidentModalOpen] = useState(false);
    const [totalResidents, setTotalResidents] = useState(0);

    useEffect(() => {
        fetchResidents();
        fetchTotalResidentCount();
    }, []);

    const fetchResidents = async () => {
        try {
            const response = await axios.get('http://localhost:8080/residents', { withCredentials: true });
            setResidents(response.data);
        } catch (error) {
            console.error("Error fetching residents data:", error);
        }
    };

    const fetchTotalResidentCount = async () => {
        try {
            const response = await axios.get('http://localhost:8080/residents/count', { withCredentials: true });
            setTotalResidents(response.data.count);
        } catch (error) {
            console.error("Error fetching residents count:", error);
        }
    };

    const deleteResident = async (residentId) => {
        try {
            await axios.delete(`http://localhost:8080/residents/${residentId}`, { withCredentials: true });
            fetchResidents();
            fetchTotalResidentCount();
        } catch (error) {
            console.error("Error deleting resident:", error);
        }
    };

    const handleDeleteClick = (resident) => {
        setResidentToDelete(resident);
        setActionType('delete');
        setIsModalOpen(true);
    };

    const handleModalConfirm = async () => {
        if (actionType === 'delete' && residentToDelete) {
            await deleteResident(residentToDelete.ResidentID);
            setIsModalOpen(false);
            setSearchQuery('');
        } else {
            setIsModalOpen(false);
        }
    };

    const totalPages = Math.ceil(residents.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleResidentAdded = () => {
        fetchResidents();
        fetchTotalResidentCount();
    };

    const filteredResidents = residents.filter(resident => {
        const fullName = `${resident.FirstName} ${resident.LastName} ${resident.HouseholdID}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) ||
            resident.HouseholdID.toString().includes(searchQuery);
    });

    const totalFilteredPages = Math.ceil(filteredResidents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedResidents = filteredResidents.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-row flex-grow">
                <Sidebar />
                <main className="flex-grow p-4 bg-gray-100">
                    <div className="flex-grow p-6 bg-gray-100">
                        <Breadcrumbs />
                        <h1 className='text-2xl font-bold text-gray-500 mb-6'>Resident Management</h1>
                        <div className='flex items-center justify-between mb-6'>
                            <div className='relative max-w-96 w-full'>
                                <Search
                                    searchQuery={searchQuery}
                                    onSearchChange={handleSearchChange}
                                />
                            </div>
                            <div>
                                <button className='bg-blue-600 text-white px-5 py-3 text-sm flex items-center gap-2 rounded-full' onClick={() => setIsAddResidentModalOpen(true)}>
                                    <IoPersonAddOutline className='w-4 h-4 text-white font-bold' />
                                    Add Resident
                                </button>
                                <AddResidentModal
                                    isOpen={isAddResidentModalOpen}
                                    onClose={() => setIsAddResidentModalOpen(false)}
                                    onResidentAdded={handleResidentAdded}
                                />
                            </div>
                        </div>
                        <div className="text-sm text-gray-500 mb-4">
                            Total Residents: {totalResidents}
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
                                    {filteredResidents.length > 0 ? displayedResidents.map((resident) => (
                                        <tr key={resident.ResidentID} className="border-b hover:bg-gray-100 even:bg-gray-50">
                                            <td className="p-3 flex items-center gap-2">
                                                <div className='bg-gray-200 rounded-full'>
                                                    <RxAvatar className='w-8 h-8 text-gray-400' />
                                                </div>
                                                <div className='flex flex-col leading-4 text-gray-500'>
                                                    {`${resident.FirstName} ${resident.LastName}`}
                                                    <span className='text-xs text-gray-400'>{resident.Occupation}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-gray-500">{resident.Address}</td>
                                            <td className="p-3 text-gray-500">{resident.HouseholdID}</td>
                                            <td className="p-3 text-gray-500">
                                                {resident.RegisteredVoter ? (
                                                    <IoFingerPrint className='text-green-500 h-6 w-6' />
                                                ) : (
                                                    <IoFingerPrint className='text-red-500 h-6 w-6' />
                                                )}
                                            </td>
                                            <td className="p-3 text-gray-500">{resident.ContactNumber}</td>
                                            <td className="p-3 text-gray-500 flex items-center justify-center gap-2">
                                                <div className='bg-gray-200 p-2 w-max rounded-lg cursor-pointer'><GrEdit className='w-5 h-5 text-gray-500' /></div>
                                                <div className='bg-gray-200 p-2 w-max rounded-lg cursor-pointer'><FaRegEye className='w-5 h-5 text-gray-500' /></div>
                                                <div
                                                    className='bg-gray-200 p-2 w-max rounded-lg cursor-pointer'
                                                    onClick={() => handleDeleteClick(resident)}
                                                >
                                                    <FaRegTrashAlt className='w-5 h-5 text-red-500' />
                                                </div>
                                            </td>
                                        </tr>
                                    )) :
                                        (
                                            <tr>
                                                <td colSpan="6" className="p-4 text-center text-sm text-gray-500">
                                                    No Data Available.
                                                </td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalFilteredPages}
                            onPageChange={handlePageChange}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                        <ActionModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onConfirm={handleModalConfirm}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ResidentManagement;
