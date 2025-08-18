
import React, { useEffect, useState } from 'react';
import './VerInfoPartido.css';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const VerInfoPartido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partido, setPartido] = useState(null);
  const [cancha, setCancha] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartido = async () => {
      const { data: partidoData, error } = await supabase
        .from('partidos')
        .select('*, Cancha(*)')
        .eq('id_Partidos', id)
        .single();

      if (error) {
        console.error('Error al obtener el partido:', error);
      } else {
        setPartido(partidoData);
        setCancha(partidoData.Cancha);
        fetchUsuarios(partidoData.id_Partidos);
      }

      setLoading(false);
    };

    const fetchUsuarios = async (idPartido) => {
      const { data: usuariosData, error } = await supabase
        .from('partidoXUsuarios')
        .select('id_usuarios, Usuarios(nombre, fotoDePerfil)')
        .eq('id_partidos', idPartido);

      if (error) {
        console.error('Error al obtener los usuarios del partido:', error);
      } else {
        setUsuarios(usuariosData);
      }
    };

    fetchPartido();
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (!partido || !cancha) return <div>No se encontró el partido</div>;

  const handleJoinClick = async () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
      alert('Debe iniciar sesión para unirse al partido.');
      return;
    }

    // Check if user already joined the match
    const { data: existingJoin, error: existingJoinError } = await supabase
      .from('partidoXUsuarios')
      .select('*')
      .eq('id_usuarios', loggedInUser.idUsuarios)
      .eq('id_partidos', partido.id_Partidos)
      .limit(1);

    if (existingJoinError === null && existingJoin && existingJoin.length > 0) {
      alert('No se puede unir porque ya forma parte del partido.');
      return;
    }

    // Check current number of joined users
    const { data: currentUsers, error: currentUsersError } = await supabase
      .from('partidoXUsuarios')
      .select('id_usuarios')
      .eq('id_partidos', partido.id_Partidos);

    if (currentUsersError) {
      alert('Error al verificar usuarios actuales del partido.');
      return;
    }

    const currentUserCount = currentUsers ? currentUsers.length : 0;
    const maxJugadores = 10;

    // Fetch user's teams
    const { data: userTeams, error: userTeamsError } = await supabase
      .from('usariosXEquipos')
      .select('idEquipos')
      .eq('idUsuarios', loggedInUser.idUsuarios);

    if (userTeamsError) {
      alert('Error al obtener los equipos del usuario.');
      return;
    }

    const belongsToTeam = userTeams && userTeams.length > 0;

    // New confirmation before asking join option
    const confirmedJoin = window.confirm('¿Está seguro que desea unirse al partido?');
    if (!confirmedJoin) {
      return;
    }

    let joinOption = 'solo';
    if (belongsToTeam) {
      // Verificar si el usuario es administrador de alguno de sus equipos
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      
      // Obtener equipos donde el usuario es administrador
      const { data: adminTeams, error: adminError } = await supabase
        .from('administradorEquipo')
        .select('idEquipo')
        .eq('idUsuarioCreador', loggedInUser.idUsuarios);

      if (adminError) {
        alert('Error al verificar equipos administrados.');
        return;
      }

      const adminTeamIds = adminTeams ? adminTeams.map(t => t.idEquipo) : [];
      
      // Verificar si alguno de los equipos del usuario es administrado por él
      const userAdminTeams = userTeams.filter(team => 
        adminTeamIds.includes(team.idEquipos)
      );

      if (userAdminTeams.length > 0) {
        joinOption = window.confirm('Desea unirse al partido con todo su equipo? (Aceptar = Equipo, Cancelar = Solo)') ? 'equipo' : 'solo';
      } else {
        alert('Solo puedes unirte con tu equipo si eres administrador de alguno de tus equipos.');
        joinOption = 'solo';
      }
    } else {
      alert('Se unirá solo al partido ya que no pertenece a ningún equipo.');
    }

    try {
      if (joinOption === 'solo') {
        if (currentUserCount >= maxJugadores) {
          alert('No se puede unir porque se excedería el límite de jugadores.');
          return;
        }
        // Insert single user to partidoXUsuarios
        const { error } = await supabase
          .from('partidoXUsuarios')
          .insert([{ id_usuarios: loggedInUser.idUsuarios, id_partidos: partido.id_Partidos }]);
        if (error) {
          alert('Error al unirse al partido: ' + error.message);
          return;
        }
        alert('Se ha unido al partido correctamente.');
        fetchUsuarios(partido.id_Partidos);
      } else if (joinOption === 'equipo') {
        // Get all users in the same teams
        const teamIds = userTeams.map(t => t.idEquipos);
        const { data: teamUsers, error: teamUsersError } = await supabase
          .from('usariosXEquipos')
          .select('idUsuarios')
          .in('idEquipos', teamIds);

        if (teamUsersError) {
          alert('Error al obtener los usuarios del equipo.');
          return;
        }

        // Filter out users who already joined
        const userIds = teamUsers.map(u => u.idUsuarios);
        const { data: existingJoins, error: existingJoinsError } = await supabase
          .from('partidoXUsuarios')
          .select('id_usuarios')
          .eq('id_partidos', partido.id_Partidos)
          .in('id_usuarios', userIds);

        if (existingJoinsError) {
          alert('Error al verificar usuarios ya unidos.');
          return;
        }

        const existingUserIds = existingJoins ? existingJoins.map(e => e.id_usuarios) : [];
        const newUsersToInsert = userIds
          .filter(id => !existingUserIds.includes(id))
          .map(id => ({ id_usuarios: id, id_partidos: partido.id_Partidos }));

        if (newUsersToInsert.length === 0) {
          alert('Todos los miembros de tu equipo ya están unidos a este partido.');
          return;
        }

        if (currentUserCount + newUsersToInsert.length > maxJugadores) {
          alert('No se puede unir porque se excedería el límite de jugadores.');
          return;
        }

        // Insert all new team users to partidoXUsuarios
        const { error: insertError } = await supabase
          .from('partidoXUsuarios')
          .insert(newUsersToInsert);

        if (insertError) {
          alert('Error al unirse al partido con el equipo: ' + insertError.message);
          return;
        }
        alert('Se ha unido al partido con todo su equipo correctamente.');
        fetchUsuarios(partido.id_Partidos);
      }
    } catch {
      
    }
  };

  const maxJugadores = 10;

  return (
    <div className="ver-info-container">
      <h2 className="titulo">Detalles del partido</h2>
      <div className="ubicacion-mapa">
        {cancha && (
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(cancha.ubicacion)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa de Cancha"
          ></iframe>
        )}
        <p className="direccion">{cancha ? cancha.ubicacion : ''}</p>
      </div>

      <div className="info-boxes">
        <div className="info-box">
          <div className="icono">&#128197;</div>
          <div className="texto">{partido ? partido.fecha : ''}</div>
        </div>
        <div className="info-box">
          <div className="icono">&#128337;</div>
          <div className="texto">{partido ? partido.horaInicio.slice(0,5) : ''}</div>
        </div>
        <div className="info-box">
          <div className="icono">&#36;</div>
          <div className="texto">{cancha ? `$${cancha.precioXHora}` : ''}</div>
        </div>
      </div>
      <button className="boton volver-button-par" onClick={() => navigate('/ver-partidos')}>Volver</button>
      
      <div className="jugadores-container">
        <h3>Jugadores ({usuarios.length}/{maxJugadores})</h3>
        <div className="jugadores-lista">
          {usuarios.map((u) => (
            <div key={u.id_usuarios} className="jugador-item">
              <img
                src={u.Usuarios.fotoDePerfil || '/src/assets/ImgPerfil.png'}
                alt={u.Usuarios.nombre}
                className="jugador-avatar"
              />
              <div className="jugador-nombre">{u.Usuarios.nombre}</div>
            </div>
          ))}
        </div>
      </div>

      <button
        className={`boton-unirme ${usuarios.length >= maxJugadores ? 'disabled' : ''}`}
        onClick={handleJoinClick}
        disabled={usuarios.length >= maxJugadores}
      >
        Unirme al partido
      </button>
    </div>
  );
};

export default VerInfoPartido;
