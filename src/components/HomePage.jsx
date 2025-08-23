import { useState, useEffect, useContext, } from 'react'
import { UserContext } from '../App';
import { useNavigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import NavBar from './NavBar';



function HomePage() {
    const navigate = useNavigate();
    const {token, changeToken, user} = useContext(UserContext); 

    const apiURL = import.meta.env.VITE_API_URL;

    function handleLogOut() {
        localStorage.removeItem("token");
        changeToken(null);
    }
    async function handleBecomeAuthor() {
        try {
            const response = await fetch(`${apiURL}/becomeauthor`, {
                method: 'PUT',
                headers: {'Authorization': `Bearer ${token}`},
            });
            const data = await response.json();
            console.log(data);
            if(!response.ok) {
                console.log(data.message || "Error");
                if(response.status === 401) {
                    changeToken(null);
                    navigate("/login");
                    return;
                } else {
                    throw new Error("Become Author Error");
                }
            }
            //make a user log in again after becoming an author
            changeToken(null);
            alert("Please log in again!");
            navigate("/login");
        } catch(err){
            console.log(err);
        }
    }

    return (
    <>
       <NavBar token={token} handleLogOut={handleLogOut}></NavBar>
        {!user && (
            <div className='display-2 text-center d-flex h-50 justify-content-center align-items-center'>
                Please Log In!
            </div>
        )}
        {user && user.role != "AUTHOR" && (
            <div className='d-flex h-50 flex-column justify-content-center align-items-center
            display-4 gap-5'>
                <div className='text-black text-center'>You are not a blog author.</div>
                <button className='btn btn-primary btn-lg fs-2'
                onClick={handleBecomeAuthor}>Become an Author Today!</button>
            </div>
        )}
        {user && user.role === "AUTHOR" && (
            <div className='flex-grow-1 overflow-hidden'>
                <Outlet />
            </div>
        )}
    </>
    );
}

export default HomePage
