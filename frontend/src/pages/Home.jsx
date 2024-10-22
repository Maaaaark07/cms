import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import axios from 'axios';

const Home = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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


    const handleLogout = () => {
        axios.get('http://localhost:8080/logout', { withCredentials: true })
            .then(res => {
                if (res.data.Status === "Success") {
                    navigate('/');
                }
            })
            .catch(err => console.log(err));
    };

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
                        <h1>Welcome {user}</h1>
                        <button className='bg-red-400' onClick={handleLogout}>logout</button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Home;