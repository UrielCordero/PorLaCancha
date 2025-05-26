import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ onMenuClick }) {
  return (
    <header className="header">
      <nav className="navbar">
        <div className="logo">
          <Link to="/">
            <img src="/src/assets/Logo.png" alt="PorLaCancha Logo" style={{ height: '70px' }} />
          </Link>
        </div>
        <div className="nav-links">
          <img
            src="/src/assets/Menu.png"
            alt="Menu Icon"
            style={{ height: '60px', cursor: 'pointer' }}
            onClick={onMenuClick}
          />
        </div>
      </nav>
    </header>
  );
}

export default Header;
