import React from 'react';
import './Heroe.css';

function Heroe() {
  return (
    <section className="hero">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1>¿Tenés ganas de jugar? Nosotros te conseguimos rival y cancha.</h1>
          <p>Compite en torneos organizados o arma partidos con jugadores cerca tuyo.</p>
          <div className="search-bar-container">
            <div className="search-option">
              <i className="fa fa-map-marker-alt"></i>
              <select>
                <option>Buscar zona</option>
                <option>La boca</option>
                <option>Almagro</option>
                <option>Caballito</option>
              </select>
            </div>
            <div className="search-option">
              <i className="fa fa-calendar-alt"></i>
              <input type="date" />
            </div>
            <div className="search-option">
              <i className="fa fa-clock"></i>
              <input type="time" />
            </div>
            <button className="search-button">Buscar partido</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Heroe;
