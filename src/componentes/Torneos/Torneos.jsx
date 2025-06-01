import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Torneos.css';

const Torneos = () => {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTorneos();
  }, []);

  const fetchTorneos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('torneo')
      .select(`
        id,
        fotoTorneo,
        nombreTorneo,
        fechaInicio,
        fechaFin
      `)
      .order('fechaInicio', { ascending: true });

    if (error) {
      console.error('Error al obtener torneos:', error);
    } else {
      setTorneos(data || []);
    }

    setLoading(false);
  };

  const handleCrearTorneo = () => {
    navigate('/crear-torneo');
  };

  return (
    <div className="torneos-container">
      <div className="torneos-header">
        <div className="header-texto">
          <h2>Participa en torneos <br />amateurs organizados</h2>
          <p>
            Conéctate con otros jugadores y formá tu equipo para competir en diversos torneos
          </p>
          <button className="boton-crear" onClick={handleCrearTorneo}>
            Crea un torneo
          </button>
        </div>
        <img
          src="/src/assets/TorneoEj.png"
          alt="Jugadores festejando"
          className="imagen-header"
        />
      </div>

      <div className="torneos-lista">
        {loading ? (
          <p>Cargando torneos...</p>
        ) : torneos.length === 0 ? (
          <p>No hay torneos disponibles actualmente.</p>
        ) : (
          torneos.map((torneo) => (
            <div key={torneo.id} className="torneo-card">
              <img
                src={torneo.fotoTorneo}
                alt="Torneo"
                className="torneo-imagen"
              />
              <h3>{torneo.nombreTorneo}</h3>
              <p>
                {(() => {
                  const [y1, m1, d1] = torneo.fechaInicio.split('-');
                  const [y2, m2, d2] = torneo.fechaFin.split('-');
                  return `${parseInt(d1)} de ${getMes(m1)} - ${parseInt(d2)} de ${getMes(m2)}`;
                })()}
              </p>
              <button className="ver-info">Ver más info</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const getMes = (mesNumero) => {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return meses[parseInt(mesNumero, 10) - 1];
};

export default Torneos;
