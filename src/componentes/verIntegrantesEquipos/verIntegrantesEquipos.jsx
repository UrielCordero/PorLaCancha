import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import StarRating from '../StarRating/StarRating';
import './verIntegrantesEquipos.css';

function VerIntegrantesEquipos() {
  const { idEquipo } = useParams();
  const navigate = useNavigate();
  const [integrantes, setIntegrantes] = useState([]);
  const [equipo, setEquipo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchIntegrantes() {
      try {
        // Primero obtenemos la información del equipo
        const { data: equipoData, error: equipoError } = await supabase
          .from('equipos')
          .select('nombre, imgEscudo, nivelHabilidad, maxIntegrantes')
          .eq('idEquipos', idEquipo)
          .single();

        if (equipoError) {
          setError('Error al cargar el equipo');
          return;
        }

        setEquipo(equipoData);

        // Luego obtenemos los usuarios que pertenecen a este equipo
        const { data: integrantesData, error: integrantesError } = await supabase
          .from('usariosXEquipos')
          .select(`
            idUsuarios,
            Usuarios (
              idUsuarios,
              nombre,
              genero,
              fotoDePerfil,
              nivelHabilidad,
              fechaNacimiento
            )
          `)
          .eq('idEquipos', idEquipo);

        if (integrantesError) {
          setError('Error al cargar los integrantes');
        } else {
          setIntegrantes(integrantesData.map(item => item.Usuarios));
        }
      } catch (err) {
        setError('Error inesperado al cargar los datos');
      } finally {
        setLoading(false);
      }
    }

    fetchIntegrantes();
  }, [idEquipo]);

  const handleVolver = () => {
    navigate('/equipos');
  };

  if (loading) return <div className="integrantes-container">Cargando integrantes...</div>;
  if (error) return <div className="integrantes-container error">Error: {error}</div>;

  return (
    <div className="integrantes-container">
      <button className="boton-volver" onClick={handleVolver}>
        ← Volver a Equipos
      </button>

      {equipo && (
        <div className="equipo-info">
          <h2>Integrantes de {equipo.nombre}</h2>
          {equipo.imgEscudo && (
            <img 
              src={equipo.imgEscudo} 
              alt={`${equipo.nombre} escudo`} 
              className="equipo-escudo-grande"
            />
          )}
          <p><strong>Nivel del equipo:</strong> <StarRating level={equipo.nivelHabilidad} /></p>
          <p><strong>Máximo de integrantes:</strong> {equipo.maxIntegrantes}</p>
          <p><strong>Integrantes actuales:</strong> {integrantes.length}</p>
        </div>
      )}

      <div className="integrantes-grid">
        {integrantes.map(integrante => (
          <div key={integrante.idUsuarios} className="integrante-card">
            {integrante.fotoDePerfil ? (
              <img 
                src={integrante.fotoDePerfil} 
                alt={`${integrante.nombre} perfil`}
                className="integrante-foto"
              />
            ) : (
              <div className="integrante-foto-placeholder">
                {integrante.nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <h3>{integrante.nombre}</h3>
            <p><strong>Género:</strong> {integrante.genero || 'No especificado'}</p>
            <p><strong>Edad:</strong> {integrante.fechaNacimiento ? 
              new Date().getFullYear() - new Date(integrante.fechaNacimiento).getFullYear() : 
              'No especificada'}
            </p>
            <p><strong>Nivel de habilidad:</strong> <StarRating level={integrante.nivelHabilidad} /></p>
          </div>
        ))}
      </div>

      {integrantes.length === 0 && (
        <div className="sin-integrantes">
          <p>Este equipo aún no tiene integrantes.</p>
        </div>
      )}
    </div>
  );
}

export default VerIntegrantesEquipos;
