import React, { useEffect, useState } from 'react';
import './VerInfoPartido.css';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const VerInfoPartido = () => {
  const { id } = useParams();
  const [partido, setPartido] = useState(null);
  const [cancha, setCancha] = useState(null);
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
      }

      setLoading(false);
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

    let joinOption = 'solo';
    if (belongsToTeam) {
      joinOption = window.confirm('Desea unirse al partido con todo su equipo? (Aceptar = Equipo, Cancelar = Solo)') ? 'equipo' : 'solo';
    } else {
      alert('Se unirá solo al partido ya que no pertenece a ningún equipo.');
    }

    try {
      if (joinOption === 'solo') {
        // Insert single user to partidoXUsuarios
        const { error } = await supabase
          .from('partidoXUsuarios')
          .insert([{ id_usuarios: loggedInUser.idUsuarios, id_partidos: partido.id_Partidos }]);
        if (error) {
          alert('Error al unirse al partido: ' + error.message);
          return;
        }
        alert('Se ha unido al partido correctamente.');
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

        // Insert all team users to partidoXUsuarios
        const inserts = teamUsers.map(u => ({ id_usuarios: u.idUsuarios, id_partidos: partido.id_Partidos }));
        const { error: insertError } = await supabase
          .from('partidoXUsuarios')
          .insert(inserts);

        if (insertError) {
          alert('Error al unirse al partido con el equipo: ' + insertError.message);
          return;
        }
        alert('Se ha unido al partido con todo su equipo correctamente.');
      }
    } catch {
      alert('Error inesperado al unirse al partido.');
    }
  };

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

      <button className="boton-unirme" onClick={handleJoinClick}>Unirme al partido</button>
    </div>
  );
};

export default VerInfoPartido;
