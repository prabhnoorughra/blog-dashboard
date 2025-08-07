import { useState, useEffect, useContext, } from 'react'
import { UserContext } from '../App';
import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import HomeButton from './HomeButton';


function LoginPage() {
    const navigate = useNavigate();
    const {token, changeToken} = useContext(UserContext); 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const apiURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (token != null) {
            navigate('/', { replace: true });
        }
    }, [token, navigate]);

    async function handleLogin(e) {
        e.preventDefault();
        try {
            const response = await fetch(`${apiURL}/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });
            const data = await response.json();
            if(!response.ok) {
                setError(data.message || data.error);
                return;
            }
            const {token} = data;
            changeToken(token);
        } catch(err){
            console.log(err);
        }
    }

    return (
    <>
        <HomeButton></HomeButton>
        {error && (
            <div>
                {error}
            </div>
        )}
        <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" required 
            onChange={e => setUsername(e.target.value)} value={username}/>
            <input type="password" placeholder="Password" required
            onChange={e => setPassword(e.target.value)} value={password}/>
            <button type='submit'>Log In</button>
        </form>
        <div>Don't Have an Account? 
            <Link to='/sign-up' className="errorLink"> Sign up Here!</Link>
        </div>
    </>
    );
}

export default LoginPage
