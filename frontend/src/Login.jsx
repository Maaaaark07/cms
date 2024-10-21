import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = () => {

    const [values, setValues] = useState({
        users: '',
        password: '',
    });

    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8080/login', values)
            .then(res => {
                console.log(res.data);
                if (res.data.Status === 'Success') {
                    setValues({ users: '', password: '' });
                    navigate('/');
                } else {
                    console.log(res.data.Error);
                }
            })
            .catch(err => console.log(err));
    };

    return (
        <div>
            <h1 className='text-3xl font-bold underline'>Login</h1>
            <form action="" onSubmit={handleSubmit}>
                <input type="text" value={values.users} onChange={e => setValues({ ...values, users: e.target.value })} />
                <input type="password" value={values.password} onChange={e => setValues({ ...values, password: e.target.value })} />
                <Link to="/register">Sign Up</Link>
                <button type='submit'>Sign In</button>
            </form>
        </div>
    )
}

export default Login