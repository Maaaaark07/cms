import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';
import Breadcrumbs from '../components/Breadcrumbs';

const Home = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: ['#0F3D3E', '#8E0553', '#F86151', '#FFBA42'],
                borderWidth: 0,
            },
        ],
    });
    const [totalPopulation, setTotalPopulation] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dataFromDatabase = {
                    male: 2000,
                    female: 2500,
                    seniorCitizens: 500,
                    youth: 682,
                };

                setChartData({
                    datasets: [
                        {
                            data: [
                                dataFromDatabase.male,
                                dataFromDatabase.female,
                                dataFromDatabase.seniorCitizens,
                                dataFromDatabase.youth,
                            ],
                            backgroundColor: ['#0F3D3E', '#8E0553', '#F86151', '#FFBA42'],
                            borderWidth: 0,
                        },
                    ],
                });

                setTotalPopulation(
                    dataFromDatabase.male +
                    dataFromDatabase.female +
                    dataFromDatabase.seniorCitizens +
                    dataFromDatabase.youth
                );

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        axios.get('http://localhost:8080/home', { withCredentials: true })
            .then(res => {
                if (res.data.Status === 'Success') {
                    setUser(res.data.user);
                } else {
                    setError(res.data.Error || 'Not authorized');
                }
            })
            .catch(err => setError('An error occurred'));
    }, []);

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-row flex-grow">
                <Sidebar />
                <main className="flex-grow p-4 bg-gray-100">
                    <div className="flex-grow p-6 bg-gray-100">
                        <Breadcrumbs />
                        <h1>Welcome {user}</h1>
                        {loading ? (
                            <p>Loading chart data...</p>
                        ) : (
                            <div className="w-full max-w-md mx-auto p-4 bg-white rounded-md">
                                <h3 className="text-gray-800 text-xl font-bold mb-4">Population Statistics</h3>
                                <div className="relative">
                                    <Doughnut data={chartData} options={{ cutout: '70%' }} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-2xl font-bold text-gray-700">{totalPopulation}</p>
                                    </div>
                                </div>
                                <div className="flex justify-center mt-4 space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="block w-4 h-4 bg-[#0F3D3E]"></span>
                                        <span>Male</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="block w-4 h-4 bg-[#8E0553]"></span>
                                        <span>Female</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="block w-4 h-4 bg-[#F86151]"></span>
                                        <span>Sr. Citizen</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="block w-4 h-4 bg-[#FFBA42]"></span>
                                        <span>Youth</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Home;
