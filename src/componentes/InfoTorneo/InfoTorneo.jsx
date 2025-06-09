import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './InfoTorneo.css';

const InfoTorneo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [torneo, setTorneo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTorneo = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('torneo')
        .select(`
          id,
          fotoTorneo,
          nombreTorneo,
          fechaInicio,
          fechaFin,
          cantEquipos,
          premio,
          precioPersona,
          Id_Cancha (
            nombre,
            ubicacion,
            id_Tipo
          ),
          tipoCancha: id_Tipo (
            descripcion
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error al obtener el torneo:', error);
      } else {
        setTorneo(data);
      }
      setLoading(false);
    };

    fetchTorneo();
  }, [id]);

  if (loading) {
    return <p>Cargando información del torneo...</p>;
  }

  if (!torneo) {
    return <p>No se encontró el torneo.</p>;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${parseInt(day)} de ${meses[parseInt(month, 10) - 1]} de ${year}`;
  };

  return (
    <div className="info-torneo-container">
      <h2 className="info-torneo-title">{torneo.nombreTorneo}</h2>
      <img
        src={torneo.fotoTorneo}
        alt={torneo.nombreTorneo}
        className="info-torneo-image"
      />
      <div className="info-torneo-details">
        <p className="info-torneo-detail"><strong>Lugar:</strong> {torneo.Id_Cancha?.ubicacion || torneo.Id_Cancha?.nombre}</p>
        <p className="info-torneo-detail"><strong>Fecha de inicio:</strong> {formatDate(torneo.fechaInicio)}</p>
        <p className="info-torneo-detail"><strong>Fecha de cierre:</strong> {formatDate(torneo.fechaFin)}</p>
        <p className="info-torneo-detail"><strong>Cantidad de equipos:</strong> {torneo.cantEquipos}</p>
        <p className="info-torneo-detail"><strong>Tipo de cancha:</strong> {torneo.tipoCancha?.descripcion}</p>
        <p className="info-torneo-detail"><strong>Precio de inscripción:</strong> ${torneo.precioPersona}</p>
        <p className="info-torneo-detail"><strong>Premio del ganador:</strong> ${torneo.premio}</p>
      </div>
      <button
        className="info-torneo-button"
        onClick={() => navigate(`/unirse-torneo/${torneo.id}`)}
      >
        Unirme al torneo
      </button>
      <button
        className="info-torneo-button"
        onClick={() => navigate(-1)}
        style={{ marginTop: '10px' }}
      >
        Volver
      </button>
    </div>
  );
};

export default InfoTorneo;
