import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import StarRating from '../StarRating/StarRating';
import './Perfil.css';

function Perfil() {
  const [userData, setUserData] = useState(null);
  const [userTeams, setUserTeams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    genero: '',
    email: '',
    fotoDePerfil: '',
    nivelHabilidad: 0,
    fechaNacimiento: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Get logged-in user info from localStorage (same as App.jsx)
  const [loggedInUser, setLoggedInUser] = useState(() => {
    return JSON.parse(localStorage.getItem('loggedInUser'));
  });

  useEffect(() => {
    async function fetchUserData() {
      if (!loggedInUser) {
        setError('No user logged in');
        setLoading(false);
        return;
      }
      try {
        // Use exact field names from schema
        const { data, error } = await supabase
          .from('Usuarios')
          .select('idUsuarios, nombre, genero, email, fotoDePerfil, nivelHabilidad, fechaNacimiento')
          .eq('email', loggedInUser.email)
          .single();

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        } else {
          setUserData(data);
          setFormData({
            nombre: data.nombre || '',
            genero: data.genero || '',
            email: data.email || '',
            fotoDePerfil: data.fotoDePerfil || '',
            nivelHabilidad: data.nivelHabilidad || 0,
            fechaNacimiento: data.fechaNacimiento ? data.fechaNacimiento.split('T')[0] : '',
          });

          // Fetch user's teams (multiple)
          const { data: userEquipoData, error: equipoError } = await supabase
            .from('usariosXEquipos')
            .select('idEquipos')
            .eq('idUsuarios', data.idUsuarios);

          if (equipoError || !userEquipoData || userEquipoData.length === 0) {
            setUserTeams(null);
          } else {
            // Extract team IDs
            const teamIds = userEquipoData.map(item => item.idEquipos);

            // Fetch team names for all team IDs
            const { data: equiposData, error: equiposError } = await supabase
              .from('equipos')
              .select('nombre')
              .in('idEquipos', teamIds);

            if (equiposError || !equiposData) {
              setUserTeams(null);
            } else {
              // Join team names with commas
              const teamNames = equiposData.map(team => team.nombre).join(', ');
              setUserTeams(teamNames);
            }
          }
        }
      } catch (err) {
        setError('Error fetching user data');
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [loggedInUser]);

  useEffect(() => {
    if (!editing && userData) {
      setFormData({
        nombre: userData.nombre || '',
        genero: userData.genero || '',
        email: userData.email || '',
        fotoDePerfil: userData.fotoDePerfil || '',
        nivelHabilidad: userData.nivelHabilidad || 0,
        fechaNacimiento: userData.fechaNacimiento ? userData.fechaNacimiento.split('T')[0] : '',
      });
    }
  }, [userData, editing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNivelHabilidadChange = (newLevel) => {
    console.log('Nivel de Habilidad changed to:', newLevel);
    setFormData(prev => ({
      ...prev,
      nivelHabilidad: newLevel,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const updates = {
        nombre: formData.nombre,
        genero: formData.genero,
        email: formData.email,
        fotoDePerfil: formData.fotoDePerfil,
        nivelHabilidad: formData.nivelHabilidad,
        fechaNacimiento: formData.fechaNacimiento,
      };

      const { error } = await supabase
        .from('Usuarios')
        .update(updates)
        .eq('idUsuarios', userData.idUsuarios);

      if (error) {
        setSaveError(error.message);
      } else {
        setUserData(prev => ({
          ...prev,
          ...updates,
        }));
        setSaveSuccess(true);
        setEditing(false);
        // Optionally update localStorage loggedInUser email if changed
        if (loggedInUser.email !== formData.email) {
          const updatedUser = { ...loggedInUser, email: formData.email };
          localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
          setLoggedInUser(updatedUser);
        }
      }
    } catch (err) {
      setSaveError('Error saving data');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current userData
    setFormData({
      nombre: userData.nombre || '',
      genero: userData.genero || '',
      email: userData.email || '',
      fotoDePerfil: userData.fotoDePerfil || '',
      nivelHabilidad: userData.nivelHabilidad || 0,
      fechaNacimiento: userData.fechaNacimiento ? userData.fechaNacimiento.split('T')[0] : '',
    });
    setSaveError(null);
    setSaveSuccess(false);
    setEditing(false);
  };

  if (loading) return <div className="perfil-container">Cargando datos...</div>;
  if (error) return <div className="perfil-container error">Error: {error}</div>;

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        {editing ? (
          <>
            <label>
              Foto de Perfil URL:
              <input
                type="text"
                name="fotoDePerfil"
                value={formData.fotoDePerfil}
                onChange={handleInputChange}
                className="perfil-input"
              />
            </label>
            <label>
              Nombre:
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="perfil-input"
              />
            </label>
            <label>
              Género:
              <input
                type="text"
                name="genero"
                value={formData.genero}
                onChange={handleInputChange}
                className="perfil-input"
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="perfil-input"
              />
            </label>
            <label>
              Nivel de Habilidad:
              <StarRating level={formData.nivelHabilidad} editable={true} onChange={handleNivelHabilidadChange} />
            </label>
            <label>
              Fecha de Nacimiento:
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                className="perfil-input"
              />
            </label>
            <div className="perfil-buttons">
              <button onClick={handleSave} disabled={saving} className="perfil-save-button">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={handleCancel} disabled={saving} className="perfil-cancel-button">
                Cancelar
              </button>
            </div>
            {saveError && <p className="perfil-error">Error: {saveError}</p>}
            {saveSuccess && <p className="perfil-success">Datos guardados correctamente.</p>}
          </>
        ) : (
          <>
            <img
              src={userData.fotoDePerfil || '/default-profile.png'}
              alt="Foto de Perfil"
              className="perfil-photo"
            />
            <h2>{userData.nombre}</h2>
            <p><strong>Género:</strong> {userData.genero}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Nivel de Habilidad:</strong> <StarRating level={userData.nivelHabilidad} /></p>
            <p><strong>Fecha de Nacimiento:</strong> {new Date(userData.fechaNacimiento).toLocaleDateString()}</p>
            <p><strong>Equipo:</strong> {userTeams ? userTeams : 'No pertenece a ningún equipo'}</p>
            <button onClick={() => setEditing(true)} className="perfil-edit-button">Editar Perfil</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Perfil;
