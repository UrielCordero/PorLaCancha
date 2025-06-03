import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import StarRating from '../StarRating/StarRating';
import './Equipos.css';

function Equipos() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const { data, error } = await supabase
          .from('equipos')
          .select('idEquipos, nombre, imgEscudo, nivelHabilidad, partidosGanados, partidosEmpatados, partidosPerdidos, maxIntegrantes');

        if (error) {
          setError(error.message);
        } else {
          setTeams(data);
        }
      } catch (err) {
        setError('Error fetching teams');
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, []);

  if (loading) return <div className="equipos-container">Cargando equipos...</div>;
  if (error) return <div className="equipos-container error">Error: {error}</div>;

  return (
    <div className="equipos-container">
      {teams.map(team => (
        <div key={team.idEquipos} className="equipo-card">
          {team.imgEscudo && <img src={team.imgEscudo} alt={`${team.nombre} escudo`} className="equipo-escudo" />}
          <h3>{team.nombre}</h3>
          <p><strong>Nivel de Habilidad:</strong> <StarRating level={team.nivelHabilidad} /></p>
          <p><strong>Partidos Ganados:</strong> {team.partidosGanados}</p>
          <p><strong>Partidos Empatados:</strong> {team.partidosEmpatados}</p>
          <p><strong>Partidos Perdidos:</strong> {team.partidosPerdidos}</p>
          <p><strong>Máximo de Integrantes:</strong> {team.maxIntegrantes}</p>
        </div>
      ))}
    </div>
  );
}

export default Equipos;
