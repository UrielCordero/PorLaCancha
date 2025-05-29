// src/componentes/NuevaPagina/NuevaPagina.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Importar useNavigate
import { supabase } from '../../supabaseClient';
import './NuevaPagina.css';

const NuevaPagina = () => {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 👈 Inicializar useNavigate

  useEffect(() => {
    fetchPartidos();
  }, []);

  const fetchPartidos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('partidos')
      .select(`
        id_Partidos,
        fecha,
        horaInicio,
        horaFin,
        idCancha,
        idEquipo1,
        idEquipo2,
        Cancha (nombre),
        equipo1: idEquipo1 (nombre),
        equipo2: idEquipo2 (nombre)
      `)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al obtener partidos:', error);
    } else {
      setPartidos(data || []);
    }

    setLoading(false);
  };

  const handleCrearPartido = () => {
    navigate('/crear-partido'); // 👈 Redirige a la ruta correspondiente
  };

  return (
    <div className="pagina-container">
      <div className="crear-container">
        <button className="boton-crear" onClick={handleCrearPartido}>
          Crear un partido
        </button>
      </div>

      <div className="partidos-container">
        <h2>Partidos disponibles</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : partidos.length === 0 ? (
          <p>No hay partidos disponibles</p>
        ) : (
          partidos.map((partido) => (
            <div key={partido.id_Partidos} className="partido-card">
              <p><strong>Fecha:</strong> {new Date(partido.fecha).toLocaleDateString()}</p>
              <p><strong>Hora:</strong> {partido.horaInicio} - {partido.horaFin}</p>
              <p><strong>Cancha:</strong> {partido.Cancha?.nombre || 'Desconocida'}</p>
              <p><strong>Equipos:</strong> {partido.equipo1?.nombre || partido.idEquipo1} vs {partido.equipo2?.nombre || partido.idEquipo2}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NuevaPagina;
