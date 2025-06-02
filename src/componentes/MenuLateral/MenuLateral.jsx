import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MenuLateral.css';

function MenuLateral({ menuOpen, onClose, user }) {
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

  const profilePhoto = user && user.fotoDePerfil ? user.fotoDePerfil : '/src/assets/ImgPerfil.png';

  return (
    <div className={`side-menu ${menuOpen ? 'open' : ''}`} ref={menuRef}>
      <button className="close-button" onClick={onClose}>×</button>
      <div className="profile-section">
        <img
          src={profilePhoto}
          alt="Perfil"
          className="profile-image"
        />
      </div>
      <ul>
        <li><Link to="/nueva-pagina" onClick={onClose}>Partidos</Link></li>
        <li><Link to="/torneos" onClick={onClose}>Torneos</Link></li>
        <li><a href="#torneos" onClick={onClose}>Equipos</a></li>
        <li><a href="#torneos" onClick={onClose}>Historial</a></li>
        <li><a href="#torneos" onClick={onClose}>Cerrar Sesion</a></li>
      </ul>
    </div>
  );
}

export default MenuLateral;
