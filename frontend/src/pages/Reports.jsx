import cfg from '../../../server/config/domain.js';
import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';

import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Breadcrumbs from '../components/Breadcrumbs.jsx';

import { IoPersonAddOutline, IoDocumentText } from "react-icons/io5";
import { useAuth } from '../components/AuthContext.jsx';

const Reports = () => {

    const { barangayId } = useAuth();
    const [barangayOfficials, setBarangayOfficials] = useState(null);
    const [populationDetails, setPopulationDetails] = useState(null);

    useEffect(() => {
        if (barangayId) {
            fetchBarangayOfficials();
            fetchPopulationStats();
        }
    }, [barangayId]);

    const fetchBarangayOfficials = async () => {
        try {
            const response = await axios.get(`http://${cfg.domainname}:${cfg.serverport}/official/` + barangayId, { withCredentials: true });

            if (response.status !== 200) throw new Error("Something went wrong with fetching data");

            setBarangayOfficials(response.data);

        } catch (error) {
            console.error(error.message);
        }
    }

    const fetchPopulationStats = async () => {
        try {
            const response = await axios.get(`http://${cfg.domainname}:${cfg.serverport}/stats/all-population-stats/` + barangayId, { withCredentials: true });

            if (response.status !== 200) throw new Error("Something went wrong with fetching data");

            setPopulationDetails(response.data);

        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <div className="flex-grow p-6 bg-gray-100">
            <Breadcrumbs />
            <div className="mx-auto bg-white p-10 rounded-lg">
                <div className="flex gap-5 justify-between items-center mb-8">
                    <h1 className='text-4xl font-bold text-gray-500'>Barangay Overview</h1>
                    <button className='bg-blue-500 text-white px-5 py-3 text-sm flex items-center gap-2 rounded-full'>
                        {/* <IoPersonAddOutline className='w-4 h-4 text-white font-bold' /> */}
                        Generate Report
                    </button>
                </div>

                <div className='leading-3 mb-8'>
                    <p className="text-2xl font-semibold text-blue-500 mb-2">About Our Barangay</p>
                    <p className="text-base text-gray-400 max-w-screen-lg">Barangay Colo, established in 1970, is a thriving community in Dinalupihan, Bataan. Known for its rich history and strong sense of unity, we strive to foster growth through sustainable initiatives, local engagement, and infrastructure development.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    <div className="p-4 border-2 border-gray-300 rounded-md">
                        <p className='text-xl font-semibold text-blue-500 mb-2'>Barangay Officials</p>
                        <div className='flex border-b-2 border-gray-300 py-2'>
                            <p className='text-base flex-1 text-gray-500 font-semibold text-start pl-4'>Position</p>
                            <p className='text-base flex-1 text-gray-500 font-semibold text-center'>Name</p>
                        </div>

                        {
                            barangayOfficials?.map((official) => (
                                <div
                                    key={official.official_id}
                                    className="flex justify-around border-b-2 border-gray-300 text-base py-3 last:border-b-0"
                                >
                                    <p
                                        className="text-gray-400 font-medium flex-1 justify-start pl-4 text-ellipsis overflow-hidden whitespace-nowrap w-full"
                                        title={official.committee}
                                    >
                                        {official.committee}
                                    </p>

                                    <p className="flex-1 flex justify-center text-gray-400 font-medium text-center items-center">
                                        {official.full_name}
                                    </p>
                                </div>

                            ))
                        }
                    </div>
                    <div className="p-4 border-2 border-gray-300 rounded-md">
                        <p className='text-xl font-semibold text-blue-500 mb-2'>Quick Facts</p>
                        <div className='flex border-b-2 border-gray-300 py-2'>
                            <p className='text-base flex-1 text-gray-500 font-semibold text-start pl-4'>Title</p>
                            <p className='text-base flex-1 text-gray-500 font-semibold text-center'>Count</p>
                        </div>
                        {
                            <>
                                <Row title={"Poplutation"} count={populationDetails?.totalPopulation} />
                                <Row title={"Household"} count={populationDetails?.NumberOfHousehold} />
                                <Row title={"Senior Citizen"} count={populationDetails?.seniorCitizens} />
                                <Row title={"PWD"} count={populationDetails?.NumberOfPWD} />
                                <Row title={"Solo Parent"} count={populationDetails?.NumberOfsoloParent} />
                                <Row title={"Voters"} count={populationDetails?.NumberOfRegisteredVoters} />
                            </>
                        }
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Reports

function Row({ title, count }) {
    return <div
        className="flex justify-around border-b-2 border-gray-300 text-base py-3 last:border-b-0" >
        <p
            className="text-gray-400 font-medium flex-1 justify-start pl-4 text-ellipsis overflow-hidden whitespace-nowrap w-full">
            {title}
        </p>

        <p className="flex-1 flex justify-center text-gray-400 font-medium text-center items-center">
            {count}
        </p>
    </div>
}