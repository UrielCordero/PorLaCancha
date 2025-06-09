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

  const handleJoinTournament = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert('No se pudo obtener el usuario. Por favor, inicie sesión.');
      return;
    }

    const { data: teamData, error: teamError } = await supabase
      .from('user_teams')
      .select('*')
      .eq('user_id', user.id);

    if (teamError) {
      console.error('Error al verificar el equipo del usuario:', teamError);
      alert('Error al verificar el equipo. Intente nuevamente más tarde.');
      return;
    }

    if (teamData && teamData.length > 0) {
      alert('te has unido correctamente al torneo');
      navigate(`/unirse-torneo/${torneo.id}`);
    } else {
      alert('Conseguite un equipo para competir');
    }
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
        className="boton"
        onClick={handleJoinTournament}
      >
        Unirme al torneo
      </button>
      <button
        className="boton volver-button"
        onClick={() => navigate(-1)}
      >
        Volver
      </button>
    </div>
  );
};

export default InfoTorneo;
