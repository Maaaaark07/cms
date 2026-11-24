import React, { useEffect, useState } from 'react';

const RoleModal = ({ isOpen, onClose, onSubmit, pages = [], role = null, error = '' }) => {
    const [roleName, setRoleName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPages, setSelectedPages] = useState([]);

    useEffect(() => {
        if (!isOpen) return;
        setRoleName(role?.role_name || '');
        setDescription(role?.description || '');
        setSelectedPages(role?.pages?.filter((key) => key !== 'home') || []);
    }, [isOpen, role]);

    if (!isOpen) return null;

    const assignablePages = pages.filter((page) => page.key !== 'home');

    const togglePage = (key) => {
        setSelectedPages((current) => (
            current.includes(key)
                ? current.filter((pageKey) => pageKey !== key)
                : [...current, key]
        ));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit({
            role_name: roleName,
            description,
            pages: selectedPages,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
                <div className="leading-3 mb-6">
                    <h2 className="text-lg font-bold text-gray-500">
                        {role ? 'Edit Role' : 'Add Role'}
                    </h2>
                    <p className="text-xs text-gray-400">
                        Create a role and choose the pages it can access. Dashboard is always included.
                    </p>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-500">
                                Role Name<span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={roleName}
                                onChange={(event) => setRoleName(event.target.value)}
                                placeholder="e.g. Health Encoder"
                                className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-500">
                                Description
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Optional"
                                className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-500">
                                Pages this role can access<span className="text-red-600">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-gray-200 rounded-md p-3">
                                {assignablePages.map((page) => (
                                    <label key={page.key} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedPages.includes(page.key)}
                                            onChange={() => togglePage(page.key)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        {page.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

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
                            {role ? 'Save Role' : 'Add Role'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoleModal;
