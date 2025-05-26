import React from 'react';
import { useNavigate } from 'react-router-dom';
import Heroe from '../Heroe/Heroe';
import '../Partidos/Partidos.css';

function Partidos() {
  const navigate = useNavigate();

  const handleCrearPartido = () => {
    navigate('/crear-partido');
  };

  return (
    <main className="partidos-content">
      <Heroe />
      <button onClick={handleCrearPartido} className="crear-partido-button">
        Crear partido
      </button>
    </main>
  );
}

export default Partidos;
