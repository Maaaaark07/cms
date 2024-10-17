import React from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
    return (
        <div>
            <h1>Login</h1>
            <form action="">
                <input type="text" />
                <input type="password" />
                <Link to="/register">Sign Up</Link>
                <button type='submit'>Sign In</button>
            </form>
        </div>
    )
}

export default Login