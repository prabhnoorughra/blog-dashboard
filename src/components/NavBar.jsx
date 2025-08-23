import { useState, useEffect, useContext, } from 'react'
import { UserContext } from '../App';
import { useNavigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';


function NavBar({token, handleLogOut}) {
    const navigate = useNavigate();
    return(
        <nav className='navbar navbar-dark px-4 bg-dark'>
            <div className='navbar-brand fs-2 cursor-pointer btn btn-link text-white' 
            onClick={() => navigate("/")}>
                Blog Manager
            </div>
            {!token && (
                <button className="btn btn-primary text fs-5"
                onClick={() => navigate("/login")}>Log In</button>
            )}
            {token && (
                <button className="btn btn-danger text fs-5"
                onClick={handleLogOut}>Log Out</button>
            )}
        </nav>
    );
}



export default NavBar