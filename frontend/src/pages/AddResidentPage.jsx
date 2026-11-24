import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';
import ResidentForm from '../components/ResidentForm.jsx';

const AddResidentPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-row flex-grow">
                <Sidebar />
                <main className="flex-grow p-4 bg-gray-100">
                    <div className="flex-grow p-6 bg-gray-100">
                        <Breadcrumbs />
                        <div className="mx-auto bg-white p-10 rounded-lg">
                            <ResidentForm
                                onCancel={() => navigate('/resident-management')}
                                onSuccess={() => {
                                    sessionStorage.setItem('residentAddedSuccess', 'true');
                                    navigate('/resident-management');
                                }}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AddResidentPage;
