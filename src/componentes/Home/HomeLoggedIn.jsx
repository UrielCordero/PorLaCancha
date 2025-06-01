import React from 'react';
import Heroe from '../Heroe/Heroe';
import TorneosMensuales from '../TorneosMensuales/TorneosMensuales';
import JuegoLibre from '../JuegoLibre/JuegoLibre';
import Caracteristicas from '../Caracteristicas/Caracteristicas';
import Crecimiento from '../Crecimiento/Crecimiento';
import './HomeLoggedIn.css';

function HomeLoggedIn() {
  return (
    <>
      <Heroe isLoggedIn={true} />
      <TorneosMensuales isLoggedIn={true} />
      <JuegoLibre />
      <Caracteristicas />
      <Crecimiento />
    </>
  );
}

export default HomeLoggedIn;
