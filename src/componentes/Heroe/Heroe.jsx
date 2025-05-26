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
              <select>
                <option> Hoy 2/5</option>
                <option>3/5</option>
                <option>4/5</option>
                <option>5/5</option>
              </select>
            </div>
            <div className="search-option">
              <i className="fa fa-clock"></i>
              <select>
                <option>14:00</option>
                <option>15:00</option>
                <option>16:00</option>
                <option>17:00</option>
              </select>
            </div>
            <button className="search-button">Buscar partido</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Heroe;
