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
import { useAuth } from './AuthContext';

const navItems = [
    { to: '/home', label: 'Dashboard', pageKey: 'home', icon: RxDashboard },
    { to: '/Resident-Management', label: 'Resident Management', pageKey: 'resident-management', icon: BsHouseAdd },
    { to: '/health-center', label: 'Health Center', pageKey: 'health-center', icon: FaNotesMedical },
    { to: '/Application-Request', label: 'Application Request', pageKey: 'application-request', icon: FaWpforms },
    { to: '/Blotter-Report', label: 'Blotter Report', pageKey: 'blotter-report', icon: MdOutlineReport },
    { to: '/User-Management', label: 'User Management', pageKey: 'user-management', icon: LuUsers },
    { to: '/barangay-official', label: 'Barangay Official', pageKey: 'barangay-official', icon: RiGovernmentLine },
    { to: '/master-data', label: 'Master Data', pageKey: 'master-data', icon: GoDatabase },
    { to: '/Reports', label: 'Report', pageKey: 'reports', icon: GoReport },
    { to: '/notification-advisory', label: 'Notification Advisory', pageKey: 'notification-advisory', icon: MdOutlineNotificationImportant, dividerBefore: true },
];

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { canAccessPage } = useAuth();

    const toggleSidebar = () => setIsOpen(!isOpen);
    const visibleItems = navItems.filter((item) => canAccessPage(item.pageKey));

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
