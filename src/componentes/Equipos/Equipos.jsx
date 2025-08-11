import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import StarRating from '../StarRating/StarRating';
import './Equipos.css';

function Equipos() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userTeams, setUserTeams] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
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
        alert('Solicitud enviada exitosamente');
      } else {
        alert('Error al enviar solicitud: respuesta inesperada');
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

  return (
    <>
      {/* Notification Bell for Admins */}
      {isUserAdmin() && (
        <div className="notification-container">
          <button
            className="notification-bell"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔 {applications.length}
          </button>
          {showNotifications && (
            <div className="notification-dropdown">
              <h4>Solicitudes Pendientes</h4>
              {applications.map(app => (
                <div key={app.id} className="notification-card">
                  <img
                    src={app.Usuarios?.fotoDePerfil || '/default-profile.png'}
                    alt={app.Usuarios?.nombre}
                    className="notification-avatar"
                  />
                  <div className="notification-info">
                    <div>
                    <div>
                      <p><strong>{app.Usuarios?.nombre}</strong> quiere unirse al equipo</p>
                      <div className="notification-actions">
                        <button
                          className="accept-btn"
                          onClick={() => handleApplicationResponse(app.id, true)}
                        >
                          Aceptar
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleApplicationResponse(app.id, false)}
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="crear-container">
        <button className="boton-crear" onClick={handleCrearEquipo}>
          Crear Equipo
        </button>
      </div>

      <div className="equipos-container">
        {teams.map(team => (
          <div key={team.idEquipos} className="equipo-card">
            {team.imgEscudo && <img src={team.imgEscudo} alt={`${team.nombre} escudo`} className="equipo-escudo" />}
            <h3>{team.nombre}</h3>
            <p><strong>Nivel de Habilidad:</strong> <StarRating level={team.nivelHabilidad} /></p>
            <p><strong>Máximo de Integrantes:</strong> {team.maxIntegrantes}</p>

            <div className="equipo-actions">
              <button
                className="boton-ver-integrantes"
                onClick={() => navigate(`/equipos/${team.idEquipos}/integrantes`)}
              >
                Ver Integrantes
              </button>

              {!isUserInTeam(team.idEquipos) && loggedInUser && (
                <button
                  className="boton-postularse"
                  onClick={() => handlePostularse(team.idEquipos)}
                >
                  Postularse
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Equipos;
