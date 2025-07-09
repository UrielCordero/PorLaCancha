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
    // Try to get user from localStorage first
    let user = null;
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
      } catch (e) {
        console.error('Error parsing loggedInUser from localStorage', e);
      }
    }

    // If no user in localStorage, fallback to supabase session
    if (!user) {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        alert('No se pudo obtener el usuario. Por favor, inicie sesión.');
        return;
      }

      user = session.user;
    }

    // Check if user belongs to a team
    console.log('User ID:', user.id);
    console.log('User email:', user.email);

    // Get idUsuarios from Usuarios table by email
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('Usuarios')
      .select('idUsuarios')
      .eq('email', user.email)
      .single();

    if (usuarioError || !usuarioData) {
      console.error('Error al obtener el idUsuarios:', usuarioError);
      alert('Error al verificar el usuario. Intente nuevamente más tarde.');
      return;
    }

    const idUsuarios = usuarioData.idUsuarios;

    const { data: userTeamData, error: userTeamError } = await supabase
      .from('usariosXEquipos')
      .select('idEquipos')
      .eq('idUsuarios', idUsuarios)
      .single();

    console.log('User team data:', userTeamData, 'Error:', userTeamError);

    if (userTeamError) {
      console.error('Error al verificar el equipo del usuario:', userTeamError);
      alert('Error al verificar el equipo. Intente nuevamente más tarde.');
      return;
    }

    if (!userTeamData) {
      alert('Conseguite un equipo para competir');
      return;
    }

    // Check if tournament is full
    const { data: joinedTeams, error: joinedTeamsError } = await supabase
      .from('equiposXTorneos')
      .select('idequipos', { count: 'exact' })
      .eq('idtorneo', torneo.id);

    if (joinedTeamsError) {
      console.error('Error al verificar la cantidad de equipos en el torneo:', joinedTeamsError);
      alert('Error al verificar el estado del torneo. Intente nuevamente más tarde.');
      return;
    }

    if (joinedTeams && joinedTeams.length >= torneo.cantEquipos) {
      alert('No se puede unir porque ya se alcanzó el límite de equipos del torneo.');
      return;
    }

    // Check if team is already joined to the tournament
    const { data: existingEntry, error: existingError } = await supabase
      .from('equiposXTorneos')
      .select('*')
      .eq('idequipos', userTeamData.idEquipos)
      .eq('idtorneo', torneo.id)
      .single();

    if (existingError && existingError.code !== 'PGRST116') { // PGRST116 = No rows found
      console.error('Error al verificar si el equipo ya está en el torneo:', existingError);
      alert('Error al verificar el estado del torneo. Intente nuevamente más tarde.');
      return;
    }

    if (existingEntry) {
      alert('Tu equipo ya está unido a este torneo.');
      return;
    }

    // Confirm joining tournament
    const confirmed = window.confirm('Esta seguro que desea unirse al torneo?');
    if (!confirmed) {
      return;
    }

    // Insert link between team and tournament
    const { error: insertError } = await supabase
      .from('equiposXTorneos')
      .insert({
        idequipos: userTeamData.idEquipos,
        idtorneo: torneo.id,
      });

    if (insertError) {
      console.error('Error al unirse al torneo:', insertError);
      alert('Error al unirse al torneo. Intente nuevamente más tarde.');
      return;
    }

    alert('Te has unido correctamente al torneo');
    // Removed navigate to prevent redirection as per user request
    // navigate(`/unirse-torneo/${torneo.id}`);
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
