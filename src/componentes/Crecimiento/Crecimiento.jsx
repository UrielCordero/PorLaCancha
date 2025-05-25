import React from 'react';
import './Crecimiento.css';

function Crecimiento() {
  return (
    <section className="growth">
      <div className="growth-wrapper">
        <img
          src="/src/assets/mapaArgEjemplo.png"
          alt="Mapa Argentina Ejemplo"
          className="growth-image"
        />
        <div className="growth-content">
          <h2>Estamos creciendo.</h2>
          <p>Sumate a la comunidad de jugadores amateur más grande.</p>
          <blockquote>
            <span className="quote-left">"Me ayudó a organizar y encontrar rivales para mi equipo"</span>
            <span className="quote-center">"Organizar partidos nunca fue tan simple, en minutos ya tengo rival y cancha confirmada."</span>
            <span className="quote-right">"Encontré partido en 10 minutos, increíble!"</span>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

export default Crecimiento;
