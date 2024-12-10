// src/components/NavBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';


const NavBar = () => {
  return (
    <div className="navbar">

      <Link to="/">메세지</Link>
      <Link to="/about">주소록</Link>
    </div>
  );
};

export default NavBar;
