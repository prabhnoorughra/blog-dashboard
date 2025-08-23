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
        <div className='home vh-100' style={{backgroundColor: '#9de1fcff'}}>
            <nav className='navbar navbar-dark px-4 bg-dark'>
                <div className='navbar-brand fs-2 cursor-pointer btn btn-link text-white' 
                     onClick={() => navigate("/")}>
                        Blog Manager
                </div>
            </nav>
            <div className='p-3 h-75'>
                <div className="row justify-content-center">
                    {errors.length != 0 && (
                        <ul className='overflow-auto list-group text-start w-25'>
                            {errors.map((error, index) => {
                                return (
                                    <li className='list-group-item list-group-item-warning fs-6'
                                        key={index}>
                                            <span class="badge bg-danger rounded-pill me-3 fs-6">⚠️</span>
                                            {error.msg}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                <form onSubmit={handleSignup}>
                    <div className="row mb-3 justify-content-center">
                        <div className="col-sm-5">
                            <label for="email" class="form-label col-form-label-lg">Email</label>
                            <input className='form-control form-control-lg'
                            type="email" placeholder="Email" required id='email'
                            onChange={e => setUsername(e.target.value)} value={username}/>
                        </div>
                    </div>
                    <div className="row mb-3 justify-content-center">
                        <div className="col-sm-5">
                            <label for="password" class="form-label col-form-label-lg">Password</label>
                            <input className='form-control form-control-lg'
                            type="password" placeholder="Password" required id='password'
                            onChange={e => setPassword(e.target.value)} value={password}/>
                        </div>
                    </div>
                    <div className="row mb-3 justify-content-center">
                        <div className="col-sm-5">
                            <label for="confirmpassword" class="form-label col-form-label-lg">
                                Confirm Password
                            </label>
                            <input className='form-control form-control-lg'
                            type="password" placeholder="Confirm Password" required id='confirmpassword'
                            onChange={e => setConfirmPassword(e.target.value)} value={confirmPassword}/>
                        </div>
                    </div>
                    <div className="row mb-3 justify-content-center text-center mt-5">
                        <div className="col-sm-2">
                            <button type='submit' className='btn btn-primary btn-lg'>
                                Sign Up
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </>
    );
}

export default SignupPage
