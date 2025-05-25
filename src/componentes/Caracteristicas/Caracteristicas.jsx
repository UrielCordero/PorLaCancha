import React from 'react';
import './Caracteristicas.css';

function TarjetaCaracteristica({ icon, title, description }) {
  return (
    <div className="feature-card">
      <img src={icon} alt={title} className="feature-icon" />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Caracteristicas() {
  return (
    <section className="features" id="funcionalidades">
      <h2>¿Qué podés hacer en Por La Cancha?</h2>
      <div className="feature-cards">
        <TarjetaCaracteristica
          icon="/src/assets/Ej1.png"
          title="Unite a partidos"
          description="Unite a partidos abiertos o encontrá equipos para jugar contra tu equipo."
        />
        <TarjetaCaracteristica
          icon="/src/assets/Ej2.png"
          title="Reserva tu canchas"
          description="Alquilá canchas en diferentes ubicaciones y horarios en minutos."
        />
        <TarjetaCaracteristica
          icon="/src/assets/Ej3.png"
          title="Invita a tus amigos"
          description="Sumá amigos a tus partidos y armá tu equipo ideal fácilmente."
        />
        <TarjetaCaracteristica
          icon="/src/assets/Ej4.png"
          title="Gestiona tu equipo"
          description="Controlá tus partidos, estadísticas y el rendimiento de tu equipo."
        />
      </div>
    </section>
  );
}

export default Caracteristicas;
