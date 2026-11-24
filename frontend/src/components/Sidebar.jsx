import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { BsHouseAdd } from 'react-icons/bs';
import { FaWpforms, FaNotesMedical } from 'react-icons/fa';
import { MdOutlineReport } from 'react-icons/md';
import { LuUsers } from 'react-icons/lu';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { GoDatabase, GoReport } from "react-icons/go";
import { MdOutlineNotificationImportant } from "react-icons/md";
import { RiGovernmentLine } from "react-icons/ri";
import { HiOutlineDocumentText } from 'react-icons/hi';
import { useAuth } from './AuthContext';
import { LGU_BARANGAY, LGU_MUNICIPALITY, LGU_PROVINCE, getLguType } from '../utils/lgu';

const navItems = [
    { to: '/home', label: 'Dashboard', pageKey: 'home', icon: RxDashboard, lguTypes: [LGU_BARANGAY, LGU_MUNICIPALITY, LGU_PROVINCE] },
    { to: '/Resident-Management', label: 'Resident Management', pageKey: 'resident-management', icon: BsHouseAdd, lguTypes: [LGU_BARANGAY] },
    { to: '/health-center', label: 'Health Center', pageKey: 'health-center', icon: FaNotesMedical, lguTypes: [LGU_BARANGAY] },
    { to: '/Application-Request', label: 'Application Request', pageKey: 'application-request', icon: FaWpforms, lguTypes: [LGU_BARANGAY] },
    { to: '/Blotter-Report', label: 'Blotter Report', pageKey: 'blotter-report', icon: MdOutlineReport, lguTypes: [LGU_BARANGAY, LGU_MUNICIPALITY] },
    { to: '/resolution', label: 'Resolution', pageKey: 'resolution', icon: HiOutlineDocumentText, lguTypes: [LGU_BARANGAY, LGU_MUNICIPALITY] },
    { to: '/User-Management', label: 'User Management', pageKey: 'user-management', icon: LuUsers, lguTypes: [LGU_BARANGAY] },
    { to: '/barangay-official', label: 'Barangay Official', pageKey: 'barangay-official', icon: RiGovernmentLine, lguTypes: [LGU_BARANGAY] },
    { to: '/master-data', label: 'Master Data', pageKey: 'master-data', icon: GoDatabase, lguTypes: [LGU_BARANGAY] },
    { to: '/Reports', label: 'Report', pageKey: 'reports', icon: GoReport, lguTypes: [LGU_BARANGAY] },
    { to: '/notification-advisory', label: 'Notification Advisory', pageKey: 'notification-advisory', icon: MdOutlineNotificationImportant, dividerBefore: true, lguTypes: [LGU_BARANGAY] },
];

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { canAccessPage, lguId, roleId } = useAuth();
    const lguType = getLguType(lguId);
    const isCbsAdmin = Number(roleId) === 1;

    const toggleSidebar = () => setIsOpen(!isOpen);
    const visibleItems = navItems.filter((item) => {
        if (!canAccessPage(item.pageKey)) return false;
        if (isCbsAdmin) return true;
        if (item.lguTypes && !item.lguTypes.includes(lguType)) return false;
        return true;
    });

    return (
        <div className={`relative flex flex-col h-full ${isOpen ? 'w-72 min-w-[300px]' : 'min-w-[70px] w-[70px]'} bg-white text-gray-600 transition-width duration-300 shadow-md`}>
            <button
                onClick={toggleSidebar}
                className="absolute top-[-15px] -right-3 bg-white border border-gray-300 rounded-xl p-1 shadow-md focus:outline-none"
            >
                {isOpen ? (
                    <FiChevronLeft className="h-5 w-5 text-gray-600" />
                ) : (
                    <FiChevronRight className="h-5 w-5 text-gray-600" />
                )}
            </button>

            <div className="flex-grow">
                <ul className="flex flex-col p-4">
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <React.Fragment key={item.pageKey}>
                                {item.dividerBefore && <hr />}
                                <li className={item.dividerBefore ? 'my-3' : 'my-2'}>
                                    <NavLink
                                        to={item.to}
                                        className={({ isActive }) =>
                                            `flex items-center p-2 rounded transition-colors duration-200 ${isActive ? 'bg-blue-100 text-blue-500' : 'hover:bg-blue-100 hover:text-blue-500'}`
                                        }
                                    >
                                        <Icon className={`h-6 w-6 ${!isOpen ? 'h-8 w-8' : ''} transition-transform`} />
                                        {isOpen && <span className="ml-3">{item.label}</span>}
                                    </NavLink>
                                </li>
                            </React.Fragment>
                        );
                    })}
                </ul>
            </div>

            <div className="p-4 border-t border-gray-300">
                <p>Footer Content</p>
            </div>
        </div>
    );
};

export default Sidebar;
