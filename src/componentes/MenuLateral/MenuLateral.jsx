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
    <>
      {/* Overlay para oscurecer la página */}
      {menuOpen && (
        <div className="menu-overlay" onClick={onClose}></div>
      )}
      
      <div className={`side-menu ${menuOpen ? 'open' : ''}`} ref={menuRef}>
        <div className="menu-header">
          <div className="menu-buttons-container">
                         <button
               className="notification-bell"
               onClick={() => setShowModal(true)}
               aria-label="Notificaciones"
             >
               <span className="bell-icon">🔔</span>
               {applications.length >= 0 && (
                 <div className="notification-badge">
                   <span className="notification-number">{applications.length}</span>
                 </div>
               )}
             </button>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="profile-section">
          <Link to="/perfil" onClick={onClose}>
            <div className="profile-container">
              <img
                src={profilePhoto}
                alt="Perfil"
                className="profile-image"
              />
              <div className="profile-info">
                <h3 className="profile-name">{user?.nombre || 'Usuario'}</h3>
                <p className="profile-email">{user?.email || 'usuario@email.com'}</p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="menu-navigation">
          <ul>
            <li>
              <Link to="/ver-partidos" onClick={onClose} className="menu-link">
                <span className="menu-icon">⚽</span>
                <span>Partidos</span>
              </Link>
            </li>
            <li>
              <Link to="/torneos" onClick={onClose} className="menu-link">
                <span className="menu-icon">🏆</span>
                <span>Torneos</span>
              </Link>
            </li>
            <li>
              <Link to="/equipos" onClick={onClose} className="menu-link">
                <span className="menu-icon">👥</span>
                <span>Equipos</span>
              </Link>
            </li>
            <li>
              <Link to="/mis-partidos" onClick={onClose} className="menu-link">
                <span className="menu-icon">📅</span>
                <span>Mis Partidos</span>
              </Link>
            </li>
            <li>
              <Link to="/mi-equipo" onClick={onClose} className="menu-link">
                <span className="menu-icon">🛡️</span>
                <span>Mi Equipo</span>
              </Link>
            </li>
            <li>
              <Link to="/mis-torneos" onClick={onClose} className="menu-link">
                <span className="menu-icon">🎯</span>
                <span>Mis Torneos</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="menu-footer">
          <button 
            className="logout-button" 
            onClick={(e) => { 
              e.preventDefault(); 
              onLogout(); 
              onClose(); 
            }}
          >
            <span className="logout-icon">🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>

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
    </>
  );
}

export default MenuLateral;
