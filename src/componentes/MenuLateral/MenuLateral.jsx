import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MenuLateral.css';

function MenuLateral({ menuOpen, onClose }) {
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

  return (
    <div className={`side-menu ${menuOpen ? 'open' : ''}`} ref={menuRef}>
      <button className="close-button" onClick={onClose}>×</button>
      <div className="profile-section">
        <img src="/src/assets/ImgPerfil.png" alt="Perfil" className="profile-image" />
      </div>
      <ul>
        <li><Link to="/nueva-pagina" onClick={onClose}>Partidos</Link></li>
        <li><a href="#contacto" onClick={onClose}>Torneos</a></li>
        <li><a href="#torneos" onClick={onClose}>Equipos</a></li>
        <li><a href="#torneos" onClick={onClose}>Historial</a></li>
        <li><a href="#torneos" onClick={onClose}>Cerrar Sesion</a></li>
      </ul>
    </div>
  );
}

export default MenuLateral;
