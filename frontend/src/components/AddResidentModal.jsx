import React from 'react';
import ReactDOM from 'react-dom';
import { IoClose } from 'react-icons/io5';
import ResidentForm from './ResidentForm.jsx';

const splitSearchName = (searchTerm = '') => {
    const parts = String(searchTerm).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { FirstName: '', LastName: '' };
    if (parts.length === 1) return { FirstName: parts[0], LastName: '' };
    return { FirstName: parts[0], LastName: parts.slice(1).join(' ') };
};

const AddResidentModal = ({ isOpen, onClose, onCreated, initialSearch = '' }) => {
    if (!isOpen) return null;

    const names = splitSearchName(initialSearch);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[80]">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-end mb-2">
                    <IoClose className="w-6 h-6 cursor-pointer text-gray-500" onClick={onClose} />
                </div>
                <ResidentForm
                    key={`${names.FirstName}-${names.LastName}-${isOpen}`}
                    title="Add New Resident"
                    subtitle="The resident was not found. Add them here, then continue with the medical record."
                    initialValues={names}
                    onCancel={onClose}
                    onSuccess={(resident) => {
                        if (onCreated) onCreated(resident);
                        onClose();
                    }}
                />
            </div>
        </div>,
        document.body
    );
};

export default AddResidentModal;
