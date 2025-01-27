import React, { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumbs from "../components/Breadcrumbs";
import { useAuth } from "../components/AuthContext.jsx";
import Search from "../components/Search.jsx";
import Pagination from "../components/Pagination.jsx";
import cfg from "../../../server/config/domain.js";

import { GrEdit } from "react-icons/gr";
import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [error, setError] = useState("");
    const { barangayId } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, [barangayId]);

    useEffect(() => {
        // Filter users based on the search query whenever `users` or `searchQuery` changes
        const filtered = users.filter((user) =>
            `${user.fullname || ""}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${user.user || ""}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredUsers(filtered);
        setCurrentPage(1); // Reset to the first page after search
    }, [users, searchQuery]);

    async function fetchUsers() {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/user/${barangayId}`,
                { withCredentials: true }
            );
            setUsers(response.data || []);
        } catch (error) {
            console.error("Error fetching user data:", error);
            setError("Failed to fetch users. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    // Pagination Calculations
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to the first page
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="flex-grow p-6 bg-gray-100">
            <Breadcrumbs />
            <div>
                <h1 className="text-2xl font-bold text-gray-500 mb-6">User Management</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className=" mb-6 flex justify-between items-center">
                    <Search searchQuery={searchQuery} onSearchChange={handleSearchChange} />
                    <button className="bg-blue-500 text-white rounded-full px-6 py-2 shadow hover:bg-blue-600 transition duration-200">
                        + Add User
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : (
                    <div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden text-sm">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-800">Name</th>
                                        <th className="text-left p-4 font-semibold text-gray-800">Username</th>
                                        <th className="text-left p-4 font-semibold text-gray-800">Password</th>
                                        <th className="text-left p-4 font-semibold text-gray-800">Role</th>
                                        <th className="text-left p-4 font-semibold text-gray-800">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedUsers.map((user, index) => (
                                        <tr key={user.id || index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-700 border-b">{user.fullname}</td>
                                            <td className="px-4 py-3 text-gray-700 border-b">{user.user}</td>
                                            <td className="px-4 py-3 text-gray-700 border-b">
                                                {user.password ? "••••••••" : ""}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 border-b">{user.role_id}</td>
                                            <td className="p-3 text-gray-500 flex items-center justify-center gap-2">
                                                <div
                                                    className='bg-gray-200 p-2 w-max rounded-lg cursor-pointer'
                                                >
                                                    <GrEdit className='w-5 h-5 text-gray-500' />
                                                </div>
                                                <div
                                                    className='bg-gray-200 p-2 w-max rounded-lg cursor-pointer'
                                                    onClick={() => handleDeleteClick(resident.resident_id)}
                                                >
                                                    <FaRegTrashAlt className='w-5 h-5 text-red-500' />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayedUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-3 text-center text-gray-500">
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
