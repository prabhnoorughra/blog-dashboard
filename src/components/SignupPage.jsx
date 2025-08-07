import { useState, useEffect, useContext, } from 'react'
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import HomeButton from './HomeButton';


function SignupPage() {
    const navigate = useNavigate();
    const {token, changeToken} = useContext(UserContext); 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState([]);
    const apiURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (token != null) {
            navigate('/', { replace: true });
        }
    }, [token, navigate]);

    async function handleSignup(e) {
        e.preventDefault();
        if(password != confirmPassword) {
            setErrors([{msg: "Passwords Don't Match!"}]);
            return;
        }
        try {
            const response = await fetch(`${apiURL}/sign-up`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });
            const data = await response.json();
            if(!response.ok) {
                setErrors(data.errors);
                return;
            }
            setErrors([]);
            const {token} = data;
            changeToken(token);
        } catch(err){
            console.log(err);
        }
    }

    return (
    <>
        <HomeButton></HomeButton>
        {errors.length != 0 && (
            <ul>
                {errors.map((error, index) => {
                    return (
                        <li key={index}>{error.msg}</li>
                    );
                })}
            </ul>
        )}
        <form onSubmit={handleSignup}>
            <input type="email" placeholder="Email" required 
            onChange={e => setUsername(e.target.value)} value={username}/>
            <input type="password" placeholder="Password" required
            onChange={e => setPassword(e.target.value)} value={password}/>
            <input type="password" placeholder="Confirm Password" required
            onChange={e => setConfirmPassword(e.target.value)} value={confirmPassword}/>
            <button type='submit'>Sign Up</button>
        </form>
    </>
    );
}

export default SignupPage
