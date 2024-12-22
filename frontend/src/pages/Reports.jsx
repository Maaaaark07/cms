import React from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import cfg from '../../../server/config/config.js';

const Reports = () => {
    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-row flex-grow">
                <Sidebar />
                <main className="flex-grow p-4 bg-gray-100">
                    <div className="flex-grow p-6 bg-gray-100">
                        <h1>Reports</h1>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Reports