import { useState, useEffect, createContext, } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './App.css'
import * as jwtDecode from 'jwt-decode';
import LoginPage from './components/LoginPage';


export const UserContext = createContext({
  token: null,
  user: null,
  changeToken: () => {},
});

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    if(token === null) {
      return null;
    } else {
      try {
        return jwtDecode.jwtDecode(token);
      } catch {
        return null;
      }
    }
  });

  useEffect(() => {
    if (token === null) {
      setUser(null);
      localStorage.removeItem("token");
      return;
    } else {
      try {
        const decoded = jwtDecode.jwtDecode(token);
        localStorage.setItem("token", token);
        setUser(decoded);
        console.log(decoded);
      } catch(err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        setToken(null);
      }
    }
  }, [token, setToken, setUser]);

  useEffect(() => {
    if (!user || !user.exp) {
      return;
    }
    const now = Date.now() / 1000;
    if (now >= user.exp) {
        // token has expired
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
    }
  }, [user]);


  const changeToken = (token) => {
    setToken(token);
  }


  return (
    <div className='home vh-100 d-flex flex-column' style={{backgroundColor: '#9de1fcff'}}>
      <UserContext.Provider value={{token, changeToken, user}}>
        <Outlet/>
      </UserContext.Provider>
    </div>
  );
}
