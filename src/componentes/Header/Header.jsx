import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ onMenuClick, isLoggedIn, onLoginClick, onRegisterClick }) {
  return (
    <header className="header">
      <nav className="navbar">
        <div className="logo">
          <Link to="/">
            <img src="/src/assets/Logo.png" alt="PorLaCancha Logo" style={{ height: '70px' }} />
          </Link>
        </div>
        <div className="nav-links">
          {isLoggedIn ? (
            <img
              src="/src/assets/Menu.png"
              alt="Menu Icon"
              style={{ height: '50px', cursor: 'pointer' }}
              onClick={onMenuClick}
            />
          ) : (
            <>
              <button className="btn-header" onClick={onRegisterClick}>Registrarse</button>
              <button className="btn-header" onClick={onLoginClick}>Iniciar sesión</button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
