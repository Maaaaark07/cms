import React, { useEffect, useState } from 'react';

const AssignRoleModal = ({ isOpen, onClose, onSubmit, roles = [], user = null, error = '' }) => {
    const [appRoleId, setAppRoleId] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setAppRoleId(user?.app_role_id ? String(user.app_role_id) : '');
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(appRoleId ? Number(appRoleId) : null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="leading-3 mb-6">
                    <h2 className="text-lg font-bold text-gray-500">Assign Role</h2>
                    <p className="text-xs text-gray-400">
                        Choose a role for {user?.fullname || user?.username || 'this user'}. The role controls which pages they can open.
                    </p>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <label className="block mb-2 text-sm font-medium text-gray-500">
                        Role
                    </label>
                    <select
                        value={appRoleId}
                        onChange={(event) => setAppRoleId(event.target.value)}
                        className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">No custom role (full access)</option>
                        {roles.map((role) => (
                            <option key={role.role_id} value={role.role_id}>
                                {role.role_name}
                            </option>
                        ))}
                    </select>

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignRoleModal;
