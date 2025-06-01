import React from 'react';
import './HomeLoggedOut.css';
import Heroe from '../Heroe/Heroe';
import TorneosMensuales from '../TorneosMensuales/TorneosMensuales';
import JuegoLibre from '../JuegoLibre/JuegoLibre';
import Caracteristicas from '../Caracteristicas/Caracteristicas';
import Crecimiento from '../Crecimiento/Crecimiento';

function HomeLoggedOut() {
  return (
    <>
      <Heroe />
      <TorneosMensuales />
      <JuegoLibre />
      <Caracteristicas />
      <Crecimiento />
    </>
  );
}

export default HomeLoggedOut;
