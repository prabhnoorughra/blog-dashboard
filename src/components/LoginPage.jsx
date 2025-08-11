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
                setError("Incorrect Username or Password");
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
        <div className='home vh-100' style={{backgroundColor: '#9de1fcff'}}>
            <nav className='navbar navbar-dark px-4 bg-dark'>
                <div className='navbar-brand fs-2'>Blog Manager</div>
                <HomeButton></HomeButton>
            </nav>
            <div className='p-3 h-75'>
                <div className="row justify-content-center align-items-center">
                    {error && (
                        <ul className='list-group text-center w-25 align-items-center fs-6'>
                            <li className='list-group-item list-group-item-warning'>
                                <span class="badge bg-danger rounded-pill me-3 fs-6">⚠️</span>
                                {error}
                            </li>
                        </ul>
                    )}
                </div>
                <form onSubmit={handleLogin}>
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
                    <div className="row mb-3 justify-content-center text-center">
                        <div className="col-sm-2">
                            <button type='submit' className='btn btn-primary btn-lg'>Log In</button>
                        </div>
                    </div>
                    <div className="row justify-content-center text-center mt-4">
                        <div className='col-sm-12 d-flex gap-1 flex-column fs-5'>
                            Don't Have an Account?
                            <Link to='/sign-up' className="errorLink btn btn-link btn-lg">
                                Sign up Here!
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </>
    );
}

export default LoginPage
