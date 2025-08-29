import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import StarRating from '../StarRating/StarRating';
import './Equipos.css';
import '../VerPartido/VerPartido.css';

function Equipos() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userTeams, setUserTeams] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Filtros por torneo/cancha
  const [zonasDisponibles, setZonasDisponibles] = useState([]);
  const [tiposCancha, setTiposCancha] = useState([]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  // Mapa equipo -> info de torneos/canchas
  const [teamTournamentInfo, setTeamTournamentInfo] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if (user) {
        setLoggedInUser(user);

        // Fetch user's teams
        const { data: userTeamsData } = await supabase
          .from('usariosXEquipos')
          .select('idEquipos')
          .eq('idUsuarios', user.idUsuarios);

        setUserTeams(userTeamsData?.map(item => item.idEquipos) || []);

        // Fetch applications for admin teams
        const { data: adminTeams } = await supabase
          .from('administradorEquipo')
          .select('idEquipo')
          .eq('idUsuarioCreador', user.idUsuarios);

        if (adminTeams?.length > 0) {
          const teamIds = adminTeams.map(t => t.idEquipo);
          const { data: apps } = await supabase
          .from('solicitudesXEquipos')
          .select('id, idUsuario, idEquipo, Usuarios(idUsuarios, nombre, fotoDePerfil)')
          .in('idEquipo', teamIds)
          .order('id', { ascending: false });

          setApplications(apps || []);
        }
      }

      // Fetch all teams
      const { data, error } = await supabase
        .from('equipos')
        .select('idEquipos, nombre, imgEscudo, nivelHabilidad, partidosGanados, partidosEmpatados, partidosPerdidos, maxIntegrantes');

      if (error) {
        setError(error.message);
      } else {
        setTeams(data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTeamTournamentLinks = async () => {
      // Relación equipos -> torneos -> canchas y tipo de cancha
      const { data, error } = await supabase
        .from('equiposXTorneos')
        .select(`
          idequipos,
          torneo: idtorneo (
            id,
            nombreTorneo,
            Id_Cancha (
              nombre,
              zona,
              id_Tipo (
                descripcion
              )
            )
          )
        `);

      if (error) {
        console.error('Error obteniendo relación equipos-torneos:', error);
        return;
      }

      const map = {};
      const zonasSet = new Set();
      const tiposSet = new Set();
      for (const row of data || []) {
        const teamId = row.idequipos;
        const torneo = row.torneo;
        const cancha = torneo?.Id_Cancha;
        const tipo = cancha?.id_Tipo?.descripcion;
        if (!map[teamId]) map[teamId] = [];
        map[teamId].push({
          torneoId: torneo?.id,
          torneoNombre: torneo?.nombreTorneo,
          canchaNombre: cancha?.nombre,
          zona: cancha?.zona,
          tipoDescripcion: tipo,
        });
        if (cancha?.zona) zonasSet.add(cancha.zona);
        if (tipo) tiposSet.add(tipo);
      }
      setTeamTournamentInfo(map);
      setZonasDisponibles(Array.from(zonasSet).sort((a, b) => a.localeCompare(b)));
      setTiposCancha(Array.from(tiposSet).sort((a, b) => a.localeCompare(b)));
    };
    fetchTeamTournamentLinks();
  }, []);

  const handleCrearEquipo = () => {
    navigate('/crear-equipo');
  };

  const handlePostularse = async (teamId) => {
    if (!loggedInUser) {
      alert('Debes iniciar sesión para postularte');
      return;
    }

    // Check if user already has a pending application
    const { data: existingApplication, error: existingError } = await supabase
      .from('solicitudesXEquipos')
      .select('id')
      .eq('idUsuario', loggedInUser.idUsuarios)
      .eq('idEquipo', teamId)
      .single();

    if (existingError) {
      console.error('Error checking existing application:', existingError);
    }

    if (existingApplication) {
      alert('Ya tienes una solicitud pendiente para este equipo');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('solicitudesXEquipos')
        .insert([{
          idUsuario: loggedInUser.idUsuarios,
          idEquipo: teamId
        }]);

      if (error) {
        console.error('Error al enviar solicitud:', error);
        alert('Error al enviar solicitud: ' + JSON.stringify(error));
      } else if (data) {
        alert('Se postulo al equipo correctamente');
      } else {
        alert('Se postulo al equipo correctamente');
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      alert('Error inesperado al procesar la solicitud');
    }
  };

  const handleApplicationResponse = async (applicationId, accept) => {
    try {
      const { error } = await supabase
        .from('solicitudesXEquipos')
        .delete()
        .eq('id', applicationId);

      if (error) {
        alert('Error al procesar la solicitud: ' + error.message);
      } else {
        setApplications(prev => prev.filter(app => app.id !== applicationId));

        if (accept) {
          // Add user to team
          const application = applications.find(app => app.id === applicationId);
          if (application) {
            // Remove user from previous teams
            await supabase
              .from('usariosXEquipos')
              .delete()
              .eq('idUsuarios', application.idUsuario);

            // Add user to new team
            await supabase
              .from('usariosXEquipos')
              .insert([{
                idUsuarios: application.idUsuario,
                idEquipos: application.idEquipo
              }]);
          }
        }

        alert(`Solicitud ${accept ? 'aceptada' : 'rechazada'}`);
      }
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      alert('Error al procesar la solicitud');
    }
  };

  const isUserInTeam = (teamId) => {
    return userTeams.includes(teamId);
  };

  const isUserAdmin = () => {
    return loggedInUser && applications.length > 0;
  };

  if (loading) return <div className="equipos-container">Cargando equipos...</div>;
  if (error) return <div className="equipos-container error">Error: {error}</div>;

  const filteredTeams = teams.filter(team => {
    const nameMatch = team.nombre?.toLowerCase().includes(searchTerm.toLowerCase().trim());
    if (!nameMatch) return false;
    const torneoInfo = teamTournamentInfo[team.idEquipos] || [];
    const zonaMatch = zonaSeleccionada ? torneoInfo.some(t => t.zona === zonaSeleccionada) : true;
    const tipoMatch = tipoSeleccionado ? torneoInfo.some(t => t.tipoDescripcion === tipoSeleccionado) : true;
    return zonaMatch && tipoMatch;
  });

  return (
    <>
      {/* Navbar de filtros similar a VerPartido */}
      <div className="search-bar-container" style={{ marginTop: '2rem' }}>
        <div className="search-option">
          <i className="fa fa-map-marker-alt"></i>
          <select value={zonaSeleccionada} onChange={(e) => setZonaSeleccionada(e.target.value)}>
            <option value="">Buscar zona</option>
            {zonasDisponibles.map((zona, index) => (
              <option key={index} value={zona}>
                {zona}
              </option>
            ))}
          </select>
        </div>

        <div className="search-option">
          <i className="fa fa-futbol"></i>
          <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)}>
            <option value="">Tipo cancha</option>
            {tiposCancha.map((tipo, index) => (
              <option key={index} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        <div className="search-option clear-filters" title="Reiniciar filtros" onClick={() => {
          setZonaSeleccionada('');
          setTipoSeleccionado('');
        }}>
          <span style={{ color: 'white', fontWeight: 'bold' }}>×</span>
        </div>
      </div>
      {/* Notification Bell for Admins */}

      <div className="buscador-container">
        <div className="buscador">
          <input
            type="text"
            className="buscador-input"
            placeholder="Buscar equipos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="buscador-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23C15.99 6.01 13.48 3.5 10.5 3.5S5.01 6.01 5.01 9s2.51 5.5 5.49 5.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-5 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z" fill="#666"/>
          </svg>
        </div>
      </div>

      <div className="crear-container">
        <button className="boton-crear" onClick={handleCrearEquipo}>
          Crear Equipo
        </button>
      </div>

      <div className="equipos-container">
        {filteredTeams.map(team => (
          <div key={team.idEquipos} className="equipo-card">
            {team.imgEscudo && <img src={team.imgEscudo} alt={`${team.nombre} escudo`} className="equipo-escudo" />}
            <h3>{team.nombre}</h3>
            <p><strong>Nivel de Habilidad:</strong> <StarRating level={team.nivelHabilidad} /></p>
            <p><strong>Máximo de Integrantes:</strong> {team.maxIntegrantes}</p>

            <div className="equipo-actions">
              <button
                className="boton-ver-integrantes"
                onClick={() => {
                  if (isUserInTeam(team.idEquipos)) {
                    navigate('/mi-equipo');
                  } else {
                    navigate(`/equipos/${team.idEquipos}/integrantes`);
                  }
                }}
              >
                Ver Integrantes
              </button>

              {loggedInUser && (
                isUserInTeam(team.idEquipos) ? (
                  <button
                    className="boton-postularse boton-disabled"
                    disabled
                  >
                    Ya forma parte de este equipo
                  </button>
                ) : (
                  <button
                    className="boton-ver-integrantes boton-postularse"
                    onClick={() => handlePostularse(team.idEquipos)}
                  >
                    Postularse
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Equipos;
