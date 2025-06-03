import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import './Perfil.css';

function Perfil() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get logged-in user info from localStorage (same as App.jsx)
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  useEffect(() => {
    async function fetchUserData() {
      if (!loggedInUser) {
        setError('No user logged in');
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('Usuarios')
          .select('id_usarios, nombre, genero, email, fotoDePerfil, nivelHabilidad, fechaNacimiento')
          .eq('email', loggedInUser.email)
          .single();

        if (error) {
          setError(error.message);
        } else {
          setUserData(data);
        }
      } catch (err) {
        setError('Error fetching user data');
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [loggedInUser]);

  if (loading) return <div className="perfil-container">Cargando datos...</div>;
  if (error) return <div className="perfil-container error">Error: {error}</div>;

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <img
          src={userData.fotoDePerfil || '/default-profile.png'}
          alt="Foto de Perfil"
          className="perfil-photo"
        />
        <h2>{userData.nombre}</h2>
        <p><strong>Género:</strong> {userData.genero}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Nivel de Habilidad:</strong> {userData.nivelHabilidad}</p>
        <p><strong>Fecha de Nacimiento:</strong> {new Date(userData.fechaNacimiento).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

export default Perfil;
