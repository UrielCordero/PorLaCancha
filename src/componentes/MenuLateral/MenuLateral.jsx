import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MenuLateral.css';

function MenuLateral({ menuOpen, onClose, user, onLogout }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen, onClose]);

  const profilePhoto = (user && user.fotoDePerfil) || '/default-profile.png';

  return (
    <div className={`side-menu ${menuOpen ? 'open' : ''}`} ref={menuRef}>
      <button className="close-button" onClick={onClose}>×</button>
      <div className="profile-section">
        <Link to="/perfil" onClick={onClose}>
          <img
            src={profilePhoto}
            alt="Perfil"
            className="profile-image"
          />
        </Link>
      </div>
      <ul>
        <li><Link to="/ver-partidos" onClick={onClose}>Partidos</Link></li>
        <li><Link to="/torneos" onClick={onClose}>Torneos</Link></li>
        <li><Link to="/equipos" onClick={onClose}>Equipos</Link></li>
        <li><a href="#torneos" onClick={onClose}>Historial</a></li>
        <li><a href="#logout" className="logout-link" onClick={(e) => { e.preventDefault(); onLogout(); onClose(); }}>Cerrar Sesion</a></li>
      </ul>
    </div>
  );
}

export default MenuLateral;
