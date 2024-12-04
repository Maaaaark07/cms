import axios from 'axios';
import React, { useEffect, useState } from 'react'

import { useAuth } from './AuthContext';

import { IoClose } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";

export default function SearchModal({
    isOpen,
    title = "Title",
    onClose,
    onSelect,
    options
}) {
    const { barangayId } = useAuth();
    const [residents, setResidents] = useState();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (isOpen && barangayId) {
            fetchResidents();
        }
    }, [isOpen, barangayId])

    const fetchResidents = async () => {
        try {
            const response = await axios.get('http://localhost:8080/residents/' + barangayId, { withCredentials: true });
            setResidents(response.data);
        } catch (error) {
            console.error("Error fetching residents data:", error);
        }
    }

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
                <div className='flex justify-between'>
                    <h2 className="text-xl font-semibold mb-4">{title}</h2>
                    <IoClose
                        className='w-6 h-6 cursor-pointer'
                        onClick={() => onClose()}
                    />
                </div>
                <div className="text-gray-700 mb-6">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search for Name or Last Name"
                        className="text-sm border rounded-md border-gray-300 p-2 mb-4 w-full text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <CardList>
                        {residents?.map((resident) => (
                            <Card key={resident.resident_id} resident={resident} />
                        ))}
                    </CardList>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                        onClick={() => onClose()}
                    >
                        Cancel
                    </button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    )
}

function CardList({ children }) {
    return (
        <ul className='flex flex-col gap-2'>
            {children}
        </ul>
    )
}

function Card({ resident }) {
    return (
        <li className="flex items-center gap p-4 border rounded-md hover:bg-blue-50 border-gray-300 hover:border-blue-500 shadow-sm transition-colors">
            {
                true ? <RxAvatar className='w-12 h-12 text-gray-400' />
                    : <img
                        src="/path/to/image.jpg"
                        alt="Profile"
                        className="w-12 h-12 rounded-full border border-gray-300"
                    />
            }

            <div className="ml-4">
                <h3 className="font-bold text-gray-800">{`${resident.first_name} ${resident.last_name}`}</h3>
                <p className="text-sm text-gray-600">{`${resident.address}${resident.address ? "," : ""} ${resident.purok}, ${resident.barangay}`}</p>
            </div>
        </li>
    )
}