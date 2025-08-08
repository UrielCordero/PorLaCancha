import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import StarRating from '../StarRating/StarRating';
import './Equipos.css';

function Equipos() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const handleCrearEquipo = () => {
    navigate('/crear-equipo');
  };

  if (loading) return <div className="equipos-container">Cargando equipos...</div>;
  if (error) return <div className="equipos-container error">Error: {error}</div>;

  return (
    <>
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
            <button 
              className="boton-ver-integrantes"
              onClick={() => navigate(`/equipos/${team.idEquipos}/integrantes`)}
            >
              Ver Integrantes
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default Equipos;
