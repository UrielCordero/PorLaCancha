 import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import StarRating from '../StarRating/StarRating';
import './CrearEquipo.css';

const CrearEquipo = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [nivelHabilidad, setNivelHabilidad] = useState(0);
  const [maxIntegrantes, setMaxIntegrantes] = useState('');
  const [imgEscudo, setImgEscudo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Obtener el usuario logueado
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!loggedInUser || !loggedInUser.idUsuarios) {
        setError('No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.');
        setLoading(false);
        return;
      }

      // Crear el equipo
      const { data: equipoData, error: equipoError } = await supabase
        .from('equipos')
        .insert([
          {
            nombre,
            nivelHabilidad: parseInt(nivelHabilidad),
            maxIntegrantes: parseInt(maxIntegrantes),
            imgEscudo,
            partidosGanados: 0,
            partidosEmpatados: 0,
            partidosPerdidos: 0
          }
        ])
        .select();

      if (equipoError) {
        setError(equipoError.message);
      } else {
        // Obtener el ID del equipo recién creado
        const nuevoEquipo = equipoData[0];
        
        // Asignar al usuario como administrador del equipo
        const { error: adminError } = await supabase
          .from('administradorEquipo')
          .insert([
            {
              idUsuarioCreador: loggedInUser.idUsuarios,
              idEquipo: nuevoEquipo.idEquipos
            }
          ]);

        if (adminError) {
          setError('Error al asignar administrador: ' + adminError.message);
        } else {
          // Insertar al usuario en la tabla usariosXEquipos
          const { error: usuarioEquipoError } = await supabase
            .from('usariosXEquipos')
            .insert([
              {
                idUsuarios: loggedInUser.idUsuarios,
                idEquipos: nuevoEquipo.idEquipos
              }
            ]);

          if (usuarioEquipoError) {
            setError('Error al integrar usuario al equipo: ' + usuarioEquipoError.message);
          } else {
            alert('Equipo creado exitosamente! Eres ahora el administrador y miembro del equipo.');
            navigate('/equipos');
          }
        }
      }
    } catch {
      setError('Error al crear el equipo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crear-equipo-container">
      <div className="crear-equipo-form">
        <h2>Crear Nuevo Equipo</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Equipo *</label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Ej: Los Tigres"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nivelHabilidad">Nivel de Habilidad *</label>
            <StarRating
              level={nivelHabilidad}
              editable={true}
              onChange={(newLevel) => setNivelHabilidad(newLevel)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxIntegrantes">Máximo de Integrantes *</label>
            <select
              id="maxIntegrantes"
              value={maxIntegrantes}
              onChange={(e) => setMaxIntegrantes(e.target.value)}
            >
              <option value="">Seleccionar...</option>
              <option value="5">5 jugadores</option>
              <option value="7">7 jugadores</option>
              <option value="11">11 jugadores</option>
              <option value="15">15 jugadores</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="imgEscudo">URL del Escudo (opcional)</label>
            <input
              type="url"
              id="imgEscudo"
              value={imgEscudo}
              onChange={(e) => setImgEscudo(e.target.value)}
              placeholder="https://ejemplo.com/escudo.jpg"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancelar"
              onClick={() => navigate('/equipos')}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-crear"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearEquipo;
