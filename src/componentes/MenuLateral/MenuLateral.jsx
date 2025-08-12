import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './MenuLateral.css';

function MenuLateral({ menuOpen, onClose, user, onLogout }) {
  const menuRef = useRef(null);

  const [applications, setApplications] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) {
        setApplications([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch admin teams for the logged-in user
        const { data: adminTeams, error: adminError } = await supabase
          .from('administradorEquipo')
          .select('idEquipo')
          .eq('idUsuarioCreador', user.idUsuarios);

        if (adminError) {
          setError(adminError.message);
          setLoading(false);
          return;
        }

        if (adminTeams?.length > 0) {
          const teamIds = adminTeams.map(t => t.idEquipo);
          const { data: apps, error: appsError } = await supabase
            .from('solicitudesXEquipos')
            .select('id, idUsuario, idEquipo, Usuarios(idUsuarios, nombre, fotoDePerfil)')
            .in('idEquipo', teamIds)
            .order('id', { ascending: false });

          if (appsError) {
            setError(appsError.message);
            setLoading(false);
            return;
          }

          setApplications(apps || []);

          // Fetch team details for names
          const { data: teamsData, error: teamsError } = await supabase
            .from('equipos')
            .select('idEquipos, nombre')
            .in('idEquipos', teamIds);

          if (teamsError) {
            setError(teamsError.message);
            setLoading(false);
            return;
          }

          setTeams(teamsData || []);
        } else {
          setApplications([]);
          setTeams([]);
        }
      } catch (err) {
        setError('Error fetching applications');
      }
      setLoading(false);
    };

    fetchApplications();
  }, [user]);

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

  const isUserAdmin = () => {
    return applications.length > 0;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen, onClose]);

  const profilePhoto = (user && user.fotoDePerfil) || '/default-profile.png';

  return (
    <div className={`side-menu ${menuOpen ? 'open' : ''}`} ref={menuRef}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
        {isUserAdmin() && (
          <button
            className="notification-bell"
            onClick={() => setShowModal(true)}
            style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer', marginRight: 'auto' }}
            aria-label="Notificaciones"
          >
            🔔 {applications.length}
          </button>
        )}
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="profile-section">
        <Link to="/perfil" onClick={onClose}>
          <img
            src={profilePhoto}
            alt="Perfil"
            className="profile-image"
          />
        </Link>
      </div>
      <ul>
        <li><Link to="/ver-partidos" onClick={onClose}>Partidos</Link></li>
        <li><Link to="/torneos" onClick={onClose}>Torneos</Link></li>
        <li><Link to="/equipos" onClick={onClose}>Equipos</Link></li>
        <li><Link to="/mis-partidos" onClick={onClose}>Mis Partidos</Link></li>
        <li><Link to="/mi-equipo" onClick={onClose}>Mi Equipo</Link></li>
        <li><Link to="/mis-torneos" onClick={onClose}>Mis Torneos</Link></li>
        <li><a href="#logout" className="logout-link" onClick={(e) => { e.preventDefault(); onLogout(); onClose(); }}>Cerrar Sesion</a></li>
      </ul>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ color: 'black' }}>
            <h4>Solicitudes Pendientes</h4>
            {applications.length === 0 ? (
              <p>No hay solicitudes pendientes.</p>
            ) : (
              applications.map(app => (
                <div key={app.id} className="notification-card" style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                  <img
                    src={app.Usuarios?.fotoDePerfil || '/default-profile.png'}
                    alt={app.Usuarios?.nombre}
                    className="notification-avatar"
                    style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover' }}
                  />
                  <div className="notification-info" style={{ flex: 1, color: 'black' }}>
            <p><strong>{app.Usuarios?.nombre}</strong> quiere unirse al equipo <strong>{teams.find(team => team.idEquipos === app.idEquipo)?.nombre || 'Desconocido'}</strong></p>
                    <div className="notification-actions" style={{ marginTop: '5px' }}>
                      <button
                        className="accept-btn"
                        onClick={() => handleApplicationResponse(app.id, true)}
                        style={{ padding: '6px 12px', marginRight: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#4caf50', color: 'white' }}
                      >
                        Aceptar
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleApplicationResponse(app.id, false)}
                        style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#f44336', color: 'white' }}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            <button className="btn-close-modal" onClick={() => setShowModal(false)} style={{ marginTop: '15px', padding: '8px 16px', backgroundColor: '#777', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', float: 'right' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuLateral;
