import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import './MiEquipo.css';

const MiEquipo = () => {
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!loggedInUser) {
        setTeam(null);
        setTeamMembers([]);
        setLoading(false);
        return;
      }

      // Get the team ID the user belongs to
      const { data: userTeamData, error: userTeamError } = await supabase
        .from('usariosXEquipos')
        .select('idEquipos')
        .eq('idUsuarios', loggedInUser.idUsuarios)
        .maybeSingle();

      if (userTeamError || !userTeamData) {
        setTeam(null);
        setTeamMembers([]);
        setLoading(false);
        return;
      }

      const teamId = userTeamData.idEquipos;

      // Fetch team details
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

      // Fetch all users in the team
      const { data: membersData, error: membersError } = await supabase
        .from('usariosXEquipos')
        .select('Usuarios(idUsuarios, nombre, fotoDePerfil)')
        .eq('idEquipos', teamId);

      if (membersError || !membersData) {
        setTeamMembers([]);
      } else {
        // Extract user info from nested Usuarios
        const members = membersData.map(item => item.Usuarios).filter(Boolean);
        setTeamMembers(members);
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
          teamMembers.map(member => (
            <div key={member.idUsuarios} className="team-member-card">
              <img
                src={member.fotoDePerfil || '/default-profile.png'}
                alt={member.nombre}
                className="team-member-photo"
              />
              <p className="team-member-name">{member.nombre}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MiEquipo;
