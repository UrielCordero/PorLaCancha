import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import './MiEquipo.css';

const MiEquipo = () => {
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [administradores, setAdministradores] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleMakeAdmin = async (newAdminId) => {
    if (!team || !loggedInUser) return;
    
    // Check if user is already an administrator
    const isAlreadyAdmin = administradores.some(admin => admin.idUsuarioCreador === newAdminId);
    if (isAlreadyAdmin) {
      console.log('El usuario ya es administrador');
      return;
    }

    try {
      // Add the new administrator without removing existing ones
      const { error: insertError } = await supabase
        .from('administradorEquipo')
        .insert([{ idUsuarioCreador: newAdminId, idEquipo: team.idEquipos }]);

      if (insertError) {
        console.error('Error al hacer administrador:', insertError);
        return;
      }

      // Update local state to include the new admin
      setAdministradores(prevAdmins => [...prevAdmins, { idUsuarioCreador: newAdminId }]);
    } catch (err) {
      console.error('Error inesperado:', err);
    }
  };

  useEffect(() => {
    const fetchTeamData = async () => {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!user) {
        setTeam(null);
        setTeamMembers([]);
        setLoading(false);
        return;
      }
      setLoggedInUser(user);

      const { data: userTeamData, error: userTeamError } = await supabase
        .from('usariosXEquipos')
        .select('idEquipos')
        .eq('idUsuarios', user.idUsuarios)
        .maybeSingle();

      if (userTeamError || !userTeamData) {
        setTeam(null);
        setTeamMembers([]);
        setLoading(false);
        return;
      }

      const teamId = userTeamData.idEquipos;

      const { data: teamData, error: teamError } = await supabase
        .from('equipos')
        .select('idEquipos, nombre, imgEscudo')
        .eq('idEquipos', teamId)
        .maybeSingle();

      if (teamError || !teamData) {
        setTeam(null);
        setTeamMembers([]);
        setLoading(false);
        return;
      }

      setTeam(teamData);

      const { data: membersData, error: membersError } = await supabase
        .from('usariosXEquipos')
        .select('Usuarios(idUsuarios, nombre, fotoDePerfil)')
        .eq('idEquipos', teamId);

      if (membersError || !membersData) {
        setTeamMembers([]);
      } else {
        const members = membersData.map(item => item.Usuarios).filter(Boolean);
        setTeamMembers(members);
      }

      const { data: adminsData, error: adminsError } = await supabase
        .from('administradorEquipo')
        .select('idUsuarioCreador')
        .eq('idEquipo', teamId);

      if (!adminsError && adminsData) {
        setAdministradores(adminsData);
      }

      setLoading(false);
    };

    fetchTeamData();
  }, []);

  if (loading) {
    return <div className="mi-equipo-container"><p>Cargando...</p></div>;
  }

  if (!team) {
    return <div className="mi-equipo-container"><p>No perteneces a ningún equipo.</p></div>;
  }

  // Check if logged-in user is an administrator
  const isLoggedInUserAdmin = loggedInUser && 
    administradores.some(admin => admin.idUsuarioCreador === loggedInUser.idUsuarios);

  const handleLeaveTeam = async () => {
    if (!team || !loggedInUser) return;

    const confirmLeave = window.confirm(
      '¿Estás seguro de que quieres abandonar este equipo? Esta acción no se puede deshacer.'
    );
    
    if (!confirmLeave) return;

    try {
      // Check if user is admin and if there's only one admin
      const isAdmin = administradores.some(
        admin => admin.idUsuarioCreador === loggedInUser.idUsuarios
      );
      
      const adminCount = administradores.length;

      // If user is the only admin, assign a new random admin
      if (isAdmin && adminCount === 1 && teamMembers.length > 1) {
        // Get non-admin members
        const nonAdminMembers = teamMembers.filter(
          member => !administradores.some(admin => admin.idUsuarioCreador === member.idUsuarios)
        );

        if (nonAdminMembers.length > 0) {
          // Select random new admin
          const randomIndex = Math.floor(Math.random() * nonAdminMembers.length);
          const newAdmin = nonAdminMembers[randomIndex];

          // Add new admin
          const { error: newAdminError } = await supabase
            .from('administradorEquipo')
            .insert([{ 
              idUsuarioCreador: newAdmin.idUsuarios, 
              idEquipo: team.idEquipos 
            }]);

          if (newAdminError) {
            console.error('Error al asignar nuevo administrador:', newAdminError);
            alert('Error al asignar nuevo administrador');
            return;
          }
        }
      }

      // Remove user from team
      const { error: leaveError } = await supabase
        .from('usariosXEquipos')
        .delete()
        .eq('idUsuarios', loggedInUser.idUsuarios)
        .eq('idEquipos', team.idEquipos);

      if (leaveError) {
        console.error('Error al abandonar equipo:', leaveError);
        alert('Error al abandonar el equipo');
        return;
      }

      // If user was admin, remove from admin table
      if (isAdmin) {
        const { error: removeAdminError } = await supabase
          .from('administradorEquipo')
          .delete()
          .eq('idUsuarioCreador', loggedInUser.idUsuarios)
          .eq('idEquipo', team.idEquipos);

        if (removeAdminError) {
          console.error('Error al remover administrador:', removeAdminError);
        }
      }

      alert('Has abandonado el equipo exitosamente');
      
      // Refresh the page to show updated state
      window.location.reload();
      
    } catch (error) {
      console.error('Error inesperado:', error);
      alert('Error al abandonar el equipo');
    }
  };

  return (
    <div className="mi-equipo-container">
      <h2>Mi Equipo</h2>
      <div className="team-header">
        <img src={team.imgEscudo || '/default-team.png'} alt={team.nombre} className="team-logo" />
        <h3>{team.nombre}</h3>
      </div>
      <div className="team-members-grid">
        {teamMembers.length === 0 ? (
          <p>No hay miembros en tu equipo.</p>
        ) : (
          teamMembers.map(member => {
            const isMemberAdmin = administradores.some(
              admin => admin.idUsuarioCreador === member.idUsuarios
            );
            
            return (
              <div key={member.idUsuarios} className="team-member-card">
                <img
                  src={member.fotoDePerfil || '/default-profile.png'}
                  alt={member.nombre}
                  className="team-member-photo"
                />
                <p className="team-member-name">{member.nombre}</p>
                {isMemberAdmin && (
                  <p className="admin-label">Administrador</p>
                )}
                {isLoggedInUserAdmin && 
                 !isMemberAdmin && 
                 member.idUsuarios !== loggedInUser.idUsuarios && (
                  <button
                    className="make-admin-button"
                    onClick={() => handleMakeAdmin(member.idUsuarios)}
                  >
                    Hacer Administrador
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
      
      <button 
        className="leave-team-button" 
        onClick={handleLeaveTeam}
      >
        Abandonar Equipo
      </button>
    </div>
  );
};

export default MiEquipo;
