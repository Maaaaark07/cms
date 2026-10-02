import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { IoClose } from 'react-icons/io5';
import { FaFileUpload } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import cfg from '../../../server/config/domain.js';

const UploadResidentsModal = ({ isOpen, onClose, onComplete }) => {
    const fileInputRef = useRef(null);
    const { barangayId, cityId, provinceId, regionId } = useAuth();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [result, setResult] = useState(null);

    if (!isOpen) return null;

    const resetState = () => {
        setFile(null);
        setErrorMessage('');
        setResult(null);
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleClose = () => {
        const hadUploads = result?.uploaded > 0;
        resetState();
        onClose();
        if (hadUploads && onComplete) onComplete();
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(
                `http://${cfg.domainname}:${cfg.serverport}/residents/upload-template`,
                { withCredentials: true, responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'resident-upload-template.xlsx';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setErrorMessage('Failed to download the Excel template.');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setErrorMessage('Please choose an Excel file first.');
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setResult(null);

        const payload = new FormData();
        payload.append('excel_file', file);
        payload.append('barangay_id', barangayId || '');
        payload.append('city_id', cityId || '');
        payload.append('province_id', provinceId || '');
        payload.append('region_id', regionId || '');

        try {
            const response = await axios.post(
                `http://${cfg.domainname}:${cfg.serverport}/residents/upload-excel`,
                payload,
                { withCredentials: true }
            );
            setResult(response.data);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to upload residents.');
        } finally {
            setLoading(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[80]">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <div className="leading-4">
                        <h2 className="text-lg font-bold text-gray-500">Upload Residents</h2>
                        <p className="text-xs text-gray-400 mt-2">
                            Upload an Excel file to add multiple residents. Download the template for the required columns.
                        </p>
                    </div>
                    <IoClose className="w-6 h-6 cursor-pointer text-gray-500" onClick={handleClose} />
                </div>

                {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

                <div className="border border-dashed border-gray-300 rounded-md p-4 mb-4 bg-gray-50">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={(event) => {
                            setFile(event.target.files[0] || null);
                            setResult(null);
                            setErrorMessage('');
                        }}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <button
                            type="button"
                            className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-100"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Choose Excel File
                        </button>
                        <span className="text-sm text-gray-500">
                            {file ? file.name : 'No file selected'}
                        </span>
                    </div>
                    <button
                        type="button"
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        onClick={handleDownloadTemplate}
                    >
                        Download Excel template
                    </button>
                </div>

                {result && (
                    <div className="mb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                <p className="text-xs text-green-600">Uploaded</p>
                                <p className="text-xl font-semibold text-green-700">{result.uploaded}</p>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                <p className="text-xs text-red-600">Failed</p>
                                <p className="text-xl font-semibold text-red-700">{result.failed}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{result.message}</p>
                        {result.failures?.length > 0 && (
                            <div className="overflow-x-auto border border-gray-200 rounded-md">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="text-left p-2 font-semibold text-gray-700">Row</th>
                                            <th className="text-left p-2 font-semibold text-gray-700">Resident</th>
                                            <th className="text-left p-2 font-semibold text-gray-700">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.failures.map((item) => (
                                            <tr key={`${item.row}-${item.name}`} className="border-t">
                                                <td className="p-2 text-gray-600">{item.row}</td>
                                                <td className="p-2 text-gray-600">{item.name}</td>
                                                <td className="p-2 text-red-600">{item.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleUpload}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                    >
                        <FaFileUpload className="w-4 h-4" />
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default UploadResidentsModal;
