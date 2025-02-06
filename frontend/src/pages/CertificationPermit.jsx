import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';

import cfg from '../../../server/config/domain';
import Search from '../components/Search';
import Pagination from '../components/Pagination';
import ToastMessage from '../components/ToastMessage'
import AlertDialog from '../components/AlertDialog';

import { FaRegEye, FaRegTrashAlt } from "react-icons/fa";
import { GrEdit } from "react-icons/gr";

const CertificationPermit = () => {
    const [certificates, setCertificates] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showToasTmessage, setShowToastMessage] = useState(false);
    const [selectCertificateDeleteId, setSelectedCertificateDeleteId] = useState(null);
    const [isAlertDeleteCertificate, setIsAlertDeleteCertificate] = useState(false);
    const [showDeleteCertificateToastMessage, setShowDeleteCertificateToastMessage] = useState(false)

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const handleCertificateAdded = () => {
        fetchCertificate(); // Refresh certificate list after adding
        setShowToastMessage(true);
    };

    useEffect(() => {
        fetchCertificate();
    }, []);

    const fetchCertificate = async () => {
        try {
            const response = await axios.get(`http://${cfg.domainname}:${cfg.serverport}/certificate/get-certificate-type`, {
                withCredentials: true,
            });
            setCertificates(response.data);
            console.log(response);
        } catch (error) {
            console.error("Error fetching certificate data:", error);
        }
    };

    const handleDeleteCertificate = async () => {
        try {
            await axios.delete(`http://${cfg.domainname}:${cfg.serverport}/certificate/delete-certificate/` + selectCertificateDeleteId, { withCredentials: true });
            fetchCertificate();
            setSelectedCertificateDeleteId(null);
            setShowDeleteCertificateToastMessage(true);
        } catch (error) {
            console.error("Error deleting purok:", error);
        }
    };

    const handleDeleteCertificateModal = async () => {
        setIsAlertDeleteCertificate(true);
    }

    const totalPages = Math.ceil(certificates.length / itemsPerPage);

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

    const filteredCertificates = certificates.filter(certificate => {
        const certificateName = `${certificate.iname || ''}`.toLowerCase();
        const certificateId = certificate.iid != null
            ? certificate.iid.toString()
            : '';

        return certificateName.includes(searchQuery.toLowerCase()) ||
            certificateId.includes(searchQuery.toLowerCase());
    });

    const totalFilteredPages = Math.ceil(filteredCertificates.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedCertificates = filteredCertificates.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div>
            <div className='flex justify-between'>
                <div className='relative max-w-96 w-full'>
                    <Search
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        placeholder='Search Certificate'
                    />
                </div>
                <button
                    onClick={handleOpenModal}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md mb-6 shadow hover:bg-blue-600 transition duration-200"
                >
                    + Add Document
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden text-sm">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="text-left p-4 font-semibold text-gray-800">Document Name</th>
                            <th className="text-left p-4 font-semibold text-gray-800">Cost</th>
                            <th className="text-left p-4 font-semibold text-gray-800">Body Content</th>
                            <th className="text-center p-4 font-semibold text-gray-800">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedCertificates.length > 0 ? (
                            displayedCertificates.map((certificate) => (
                                <tr key={certificate.iid} className="hover:bg-gray-100">
                                    <td className="px-4 py-3 text-gray-500 border-b">{certificate.iname}</td>
                                    <td className="px-4 py-3 text-gray-500 border-b">{certificate.amount}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs border-b">
                                        <div className="max-w-md">
                                            <p className="truncate" title={certificate.body_text}>
                                                {certificate.body_text}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 border-b">
                                        <div className="flex justify-center gap-2">
                                            <div className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer">
                                                <GrEdit className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div
                                                className="bg-gray-200 p-2 w-max rounded-lg cursor-pointer"
                                                onClick={() => {
                                                    setSelectedCertificateDeleteId(certificate.iid);
                                                    handleDeleteCertificateModal();
                                                }}
                                            >
                                                <FaRegTrashAlt className="w-5 h-5 text-red-500" />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-4 text-center text-sm text-gray-500">
                                    No Data Available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filteredCertificates.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalFilteredPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            )}

            {showModal && (
                <AddCertificateModal
                    onClose={handleCloseModal}
                    onCertificateAdded={handleCertificateAdded}
                />
            )}

            <ToastMessage
                message={`Certificate Added Successfully`}
                variant="default"
                isVisible={showToasTmessage}
                duration={3000}
                onClose={() => setShowToastMessage(false)}
            />

            <ToastMessage
                message="Certificate record successfully deleted!"
                variant="delete"
                isVisible={showDeleteCertificateToastMessage}
                duration={3000}
                onClose={() => setShowDeleteCertificateToastMessage(false)}
            />

            <AlertDialog
                isOpen={isAlertDeleteCertificate}
                message={"Are you sure you want to delete this record? This action will process the record."}
                title="Delete Certificate"
                buttonConfig={[
                    {
                        label: "Cancel",
                        color: "bg-gray-200 text-gray-600",
                        action: () => {
                            setIsAlertDeleteCertificate(false);
                            setSelectedCertificateDeleteId(null);
                        }
                    },
                    {
                        label: "Yes, Submit",
                        color: "bg-red-500 text-white",
                        action: async () => {
                            await handleDeleteCertificate();
                            setIsAlertDeleteCertificate(false);
                        },
                    },
                ]}
            />
        </div>
    );
};


const AddCertificateModal = ({ onClose, onCertificateAdded }) => {
    const [certificateData, setCertificateData] = useState({
        iname: "",
        comments: "",
        document_type_id: 1,
        amount: "",
        body_text: "",
        lgu_type_id: 1, // Default to your specific LGU Type
    });

    const handleChange = (e) => {
        setCertificateData({
            ...certificateData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                `http://${cfg.domainname}:${cfg.serverport}/certificate/add-certificate-type`,
                certificateData,
                { withCredentials: true }
            );
            onCertificateAdded(); // This will trigger the toast message
            onClose();
        } catch (error) {
            console.error("Error adding certificate:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                <h2 className="text-xl font-semibold mb-4">Add Certificate</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Document Name</label>
                        <input
                            type="text"
                            name="iname"
                            value={certificateData.iname}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Comments</label>
                        <input
                            type="text"
                            name="comments"
                            value={certificateData.comments}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Amount</label>
                        <input
                            type="number"
                            name="amount"
                            value={certificateData.amount}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Body Content</label>
                        <textarea
                            name="body_text"
                            value={certificateData.body_text}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            className="bg-gray-400 text-white px-4 py-2 rounded"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default CertificationPermit;
