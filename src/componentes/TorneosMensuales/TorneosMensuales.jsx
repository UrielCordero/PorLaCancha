import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TorneosMensuales.css';

function TorneosMensuales({ isLoggedIn }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isLoggedIn) {
      alert('Debe iniciar sesión para realizar esta acción.');
      return;
    }
    navigate('/torneos');
  };

  return (
    <section className="monthly-tournaments">
      <div className="tournaments-content">
        <h2>Competí con tu grupo de amigos en torneos mensuales con recompensa.</h2>
        <p>Armá tu equipo, enfrentá a rivales de tu zona y participá por premios todos los meses.</p>
        <button className="btn-secondary" onClick={handleClick}>Ver torneos disponibles!</button>
      </div>
    </section>
  );
}

export default TorneosMensuales;
