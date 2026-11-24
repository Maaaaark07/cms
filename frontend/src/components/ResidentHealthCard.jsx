import React from 'react';
import { RxAvatar } from 'react-icons/rx';
import cfg from '../../../server/config/domain.js';

export const getResidentFullName = (resident) => {
    if (!resident) return 'Unknown resident';
    return [resident.first_name, resident.middle_name, resident.last_name, resident.suffix]
        .filter(Boolean)
        .join(' ');
};

export const getResidentAge = (resident) => {
    if (resident?.age) return resident.age;
    if (!resident?.birthday) return 'N/A';
    const birthDate = new Date(resident.birthday);
    if (Number.isNaN(birthDate.getTime())) return 'N/A';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
    }
    return age;
};

export const getResidentAddress = (resident) => {
    if (!resident) return 'N/A';
    return [resident.address, resident.purok, resident.barangay].filter(Boolean).join(', ') || 'N/A';
};

const ResidentHealthCard = ({ resident }) => {
    if (!resident) return null;

    return (
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-6">
                <div className="bg-gray-200 rounded-full h-20 w-20 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {resident.profile_image ? (
                        <div
                            className="w-full h-full rounded-full"
                            style={{
                                backgroundImage: `url(http://${cfg.domainname}:${cfg.serverport}${resident.profile_image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                            role="img"
                            aria-label="Resident"
                        />
                    ) : (
                        <RxAvatar className="w-12 h-12 text-gray-400" />
                    )}
                </div>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-gray-400">Resident</p>
                        <p className="text-base font-semibold text-gray-600">{getResidentFullName(resident)}</p>
                        <p className="text-xs text-gray-400">ID: {resident.resident_id}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Age / Gender</p>
                        <p className="text-sm text-gray-600">{getResidentAge(resident)} / {resident.gender || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Contact</p>
                        <p className="text-sm text-gray-600">{resident.contact_number || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Address</p>
                        <p className="text-sm text-gray-600">{getResidentAddress(resident)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResidentHealthCard;
