import { useState, useEffect, useContext, } from 'react'
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';



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
                return;
            }
            //make a user log in again after becoming an author
            changeToken(null);
        } catch(err){
            console.log(err);
        }
    }

    return (
    <>
        {!token && (
            <button onClick={() => navigate("/login")}>Log In</button>
        )}

        {token && (
            <button onClick={handleLogOut}>Log Out</button>
        )}
        {user && user.role != "AUTHOR" && (
            <div>
                <div>You are not a blog author.</div>
                <button onClick={handleBecomeAuthor}>Become an Author Today!</button>
            </div>
        )}
        {user && user.role === "AUTHOR" && (
            <div>
                <div>Welcome Back {user.username}</div>
            </div>
        )}
    </>
    );
}

export default HomePage
