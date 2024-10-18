import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Home = () => {
    const [auth, setAuth] = useState()
    const [message, setMessage] = useState('');
    const [user, setUser] = useState();

    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8080', { withCredentials: true })
            .then(res => {
                console.log(res.data);
                if (res.data.Status === 'Success') {
                    setAuth(true);
                    setUser(res.data.user);
                    navigate('/');
                } else {
                    setAuth(false);
                    setMessage(res.data.Error);
                }
            })
            .catch(err => console.log(err));
    }, []);


    const handleLogout = () => {
        axios.get('http://localhost:8080/logout')
            .then(res => {
                location.reload(true)
            }).catch(err => console.log(err))
    }

    return (
        <div>
            {
                auth ?
                    <div>
                        <h3>You are authorized {user}</h3>
                        <button onClick={handleLogout}>logout</button>
                    </div>
                    :
                    <div>
                        <h3>{message}</h3>
                        <h3>Login Now</h3>
                        <Link to='/login'>Login</Link>
                    </div>
            }
        </div >
    )
}

export default Home