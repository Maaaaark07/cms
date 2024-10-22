import React from 'react';
import { FiSettings } from 'react-icons/fi';
import cmsLogo from '../assets/cms-logo.png'

const Header = () => {
    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center">
                <img src={cmsLogo} alt="Logo" className="h-12 w-12 mr-3" />
                <div className='leading-[1px]'>
                    <h1 className="text-xl font-semibold text-gray-600">Colo</h1>
                    <span className='text-xs text-gray-400'>Colo Management System</span>
                </div>
            </div>
            <div className="flex items-center">
                <button className="flex items-center text-gray-600 hover:text-blue-500 focus:outline-none">
                    <FiSettings className="h-6 w-6" />
                </button>
            </div>
        </header>
    );
};

export default Header;
