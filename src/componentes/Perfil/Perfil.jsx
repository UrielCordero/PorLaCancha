import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import StarRating from '../StarRating/StarRating';
import './Perfil.css';

function Perfil() {
  const [userData, setUserData] = useState(null);
  const [userTeams, setUserTeams] = useState(null);
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
        <p><strong>Nivel de Habilidad:</strong> <StarRating level={userData.nivelHabilidad} /></p>
        <p><strong>Fecha de Nacimiento:</strong> {new Date(userData.fechaNacimiento).toLocaleDateString()}</p>
        <p><strong>Equipo:</strong> {userTeams ? userTeams : 'No pertenece a ningún equipo'}</p>
      </div>
    </div>
  );
}

export default Perfil;
