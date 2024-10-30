import React from 'react';

const ActionModal = ({ isOpen, onClose, onConfirm, actionType, residentName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
                <h2 className="text-lg font-bold mb-4">
                    {actionType === 'delete' ? 'Confirm Deletion' : 'Confirm Action'}
                </h2>
                <p className="mb-4">
                    Are you sure you want to {actionType === 'delete' ? 'delete' : 'confirm'} the resident
                    {residentName ? `: ${residentName}` : ''}?
                </p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onConfirm}
                        className={`text-white px-4 py-2 rounded ${actionType === 'delete' ? 'bg-red-600' : 'bg-green-600'
                            }`}
                    >
                        {actionType === 'delete' ? 'Delete' : 'Confirm'}
                    </button>
                    <button
                        onClick={onClose}
                        className="text-gray-600 bg-gray-200 px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActionModal;
