import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import StarRating from '../StarRating/StarRating';
import './InfoTorneo.css';
import '../Equipos/Equipos.css';

const InfoTorneo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [torneo, setTorneo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [equiposInscritos, setEquiposInscritos] = useState(0);
  const [mostrarEquiposModal, setMostrarEquiposModal] = useState(false);
  const [equiposParticipantes, setEquiposParticipantes] = useState([]);
  const [cargandoEquipos, setCargandoEquipos] = useState(false);
  const [mostrarIntegrantesModal, setMostrarIntegrantesModal] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [integrantesEquipo, setIntegrantesEquipo] = useState([]);
  const [administradoresEquipo, setAdministradoresEquipo] = useState([]);
  const [cargandoIntegrantes, setCargandoIntegrantes] = useState(false);

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
        
        // Fetch current number of teams
        const { data: equiposData, error: equiposError } = await supabase
          .from('equiposXTorneos')
          .select('idequipos', { count: 'exact' })
          .eq('idtorneo', data.id);

        if (!equiposError) {
          setEquiposInscritos(equiposData.length);
        }
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

  const abrirModalEquipos = async () => {
    setMostrarEquiposModal(true);
    setCargandoEquipos(true);
    try {
      // Obtener los ids de equipos inscriptos en el torneo
      const { data: vínculos, error: errorVínculos } = await supabase
        .from('equiposXTorneos')
        .select('idequipos')
        .eq('idtorneo', torneo.id);

      if (errorVínculos) {
        console.error('Error al obtener equipos del torneo:', errorVínculos);
        setEquiposParticipantes([]);
        return;
      }

      const idsEquipos = (vínculos || []).map(v => v.idequipos).filter(Boolean);
      if (idsEquipos.length === 0) {
        setEquiposParticipantes([]);
        return;
      }

      const { data: equipos, error: errorEquipos } = await supabase
        .from('equipos')
        .select('idEquipos, nombre, imgEscudo, nivelHabilidad, maxIntegrantes')
        .in('idEquipos', idsEquipos);

      if (errorEquipos) {
        console.error('Error al obtener datos de equipos:', errorEquipos);
        setEquiposParticipantes([]);
        return;
      }

      setEquiposParticipantes(equipos || []);
    } finally {
      setCargandoEquipos(false);
    }
  };

  const cerrarModalEquipos = () => {
    setMostrarEquiposModal(false);
  };

  const abrirModalIntegrantes = async (team) => {
    setEquipoSeleccionado(null);
    setIntegrantesEquipo([]);
    setAdministradoresEquipo([]);
    setMostrarIntegrantesModal(true);
    setCargandoIntegrantes(true);
    try {
      // Info del equipo
      const { data: equipoData, error: equipoError } = await supabase
        .from('equipos')
        .select('idEquipos, nombre, imgEscudo, nivelHabilidad, maxIntegrantes')
        .eq('idEquipos', team.idEquipos)
        .single();
      if (!equipoError) setEquipoSeleccionado(equipoData);

      // Integrantes del equipo
      const { data: integrantesData, error: integrantesError } = await supabase
        .from('usariosXEquipos')
        .select(`
          idUsuarios,
          Usuarios (
            idUsuarios,
            nombre,
            genero,
            fotoDePerfil,
            nivelHabilidad,
            fechaNacimiento
          )
        `)
        .eq('idEquipos', team.idEquipos);
      if (!integrantesError) {
        setIntegrantesEquipo((integrantesData || []).map(i => i.Usuarios));
      }

      // Administradores
      const { data: adminsData } = await supabase
        .from('administradorEquipo')
        .select('idUsuarioCreador')
        .eq('idEquipo', team.idEquipos);
      setAdministradoresEquipo(adminsData || []);
    } finally {
      setCargandoIntegrantes(false);
    }
  };

  const cerrarModalIntegrantes = () => {
    setMostrarIntegrantesModal(false);
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
        <p className="info-torneo-detail cantidad-equipos-row">
          <span><strong>Cantidad de equipos:</strong> {equiposInscritos}/{torneo.cantEquipos}</span>
          <button className="mini-boton" onClick={abrirModalEquipos}>Ver Equipos Participantes</button>
        </p>
        <p className="info-torneo-detail"><strong>Tipo de cancha:</strong> {torneo.tipoCancha?.descripcion}</p>
        <p className="info-torneo-detail"><strong>Precio de inscripción:</strong> ${torneo.precioPersona}</p>
        <p className="info-torneo-detail"><strong>Premio del ganador:</strong> ${torneo.premio}</p>
      </div>
      <button
        className={`boton ${equiposInscritos >= torneo.cantEquipos ? 'boton-deshabilitado' : ''}`}
        onClick={handleJoinTournament}
        disabled={equiposInscritos >= torneo.cantEquipos}
      >
        {equiposInscritos >= torneo.cantEquipos ? 'Torneo Lleno' : 'Unirme al torneo'}
      </button>
      <button
        className="boton volver-button"
        onClick={() => navigate(-1)}
      >
        Volver
      </button>

      {mostrarEquiposModal && (
        <div className="modal-overlay" onClick={cerrarModalEquipos}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Equipos participantes</h3>
              <button className="modal-close" onClick={cerrarModalEquipos}>×</button>
            </div>
            <div className="modal-body">
              {cargandoEquipos ? (
                <p>Cargando equipos...</p>
              ) : equiposParticipantes.length === 0 ? (
                <p>Aún no hay equipos inscriptos.</p>
              ) : (
                <div className="equipos-container">
                  {equiposParticipantes.map((team) => (
                    <div key={team.idEquipos} className="equipo-card">
                      {team.imgEscudo && (
                        <img src={team.imgEscudo} alt={`${team.nombre} escudo`} className="equipo-escudo" />
                      )}
                      <h3>{team.nombre}</h3>
                      <p><strong>Nivel de Habilidad:</strong> <StarRating level={team.nivelHabilidad} /></p>
                      <p><strong>Máximo de Integrantes:</strong> {team.maxIntegrantes}</p>
                      <div className="equipo-actions">
                        <button
                          className="boton-ver-integrantes"
                          onClick={() => abrirModalIntegrantes(team)}
                        >
                          Ver Integrantes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {mostrarIntegrantesModal && (
        <div className="modal-overlay" onClick={cerrarModalIntegrantes}>
          <div className="modal-content modal-integrantes" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{equipoSeleccionado ? `Integrantes de ${equipoSeleccionado.nombre}` : 'Integrantes'}</h3>
              <button className="modal-close" onClick={cerrarModalIntegrantes}>×</button>
            </div>
            <div className="modal-body">
              {cargandoIntegrantes ? (
                <p>Cargando integrantes...</p>
              ) : (
                <>
                  {equipoSeleccionado && (
                    <div className="equipo-info-modal">
                      {equipoSeleccionado.imgEscudo && (
                        <img
                          src={equipoSeleccionado.imgEscudo}
                          alt={`${equipoSeleccionado.nombre} escudo`}
                          className="equipo-escudo-grande"
                        />
                      )}
                      <p><strong>Nivel del equipo:</strong> <StarRating level={equipoSeleccionado.nivelHabilidad} /></p>
                      <p><strong>Máximo de integrantes:</strong> {equipoSeleccionado.maxIntegrantes}</p>
                      <p><strong>Integrantes actuales:</strong> {integrantesEquipo.length}</p>
                    </div>
                  )}

                  <div className="integrantes-grid">
                    {integrantesEquipo.map((integrante) => (
                      <div key={integrante.idUsuarios} className="integrante-card">
                        {integrante.fotoDePerfil ? (
                          <img
                            src={integrante.fotoDePerfil}
                            alt={`${integrante.nombre} perfil`}
                            className="integrante-foto"
                          />
                        ) : (
                          <div className="integrante-foto-placeholder">
                            {integrante.nombre?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <h3>{integrante.nombre}</h3>
                        {administradoresEquipo.some(a => a.idUsuarioCreador === integrante.idUsuarios) && (
                          <p className="admin-label">Administrador</p>
                        )}
                        <p><strong>Género:</strong> {integrante.genero || 'No especificado'}</p>
                        <p><strong>Edad:</strong> {integrante.fechaNacimiento ? (new Date().getFullYear() - new Date(integrante.fechaNacimiento).getFullYear()) : 'No especificada'}</p>
                        <p><strong>Nivel de habilidad:</strong> <StarRating level={integrante.nivelHabilidad} /></p>
                      </div>
                    ))}
                  </div>

                  {integrantesEquipo.length === 0 && (
                    <div className="sin-integrantes">
                      <p>Este equipo aún no tiene integrantes.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTorneo;
