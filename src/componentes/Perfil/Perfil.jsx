import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import './Perfil.css';

function Perfil() {
  const [userData, setUserData] = useState(null);
  const [userTeams, setUserTeams] = useState([]);
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
        console.log('Logged in user email:', loggedInUser.email);
        const { data, error } = await supabase
          .from('Usuarios')
          .select('idUsuarios, nombre, genero, email, fotoDePerfil, nivelHabilidad, fechaNacimiento')
          .eq('email', loggedInUser.email)
          .single();

        if (error) {
          console.error('Error fetching user:', error);
          setError(error.message);
          setLoading(false);
          return;
        } else {
          setUserData(data);
          console.log('Fetched user data:', data);

          // Fetch all user's team IDs linked in usuariosXEquipos
          const { data: userEquipoData, error: equipoError } = await supabase
            .from('usariosXEquipos')
            .select('idEquipos')
            .eq('idUsuarios', data.idUsuarios);

          if (equipoError) {
            console.error('Error fetching userEquipoData:', equipoError);
          }
          console.log('Fetched userEquipoData:', userEquipoData);

          if (equipoError || !userEquipoData || userEquipoData.length === 0) {
            setUserTeams([]);
          } else {
            // Extract all team IDs
            const teamIds = userEquipoData.map(item => item.idEquipos);
            console.log('Team IDs:', teamIds);

            // Fetch all team names for those IDs
            const { data: equiposData, error: equiposError } = await supabase
              .from('equipos')
              .select('nombre')
              .in('idEquipos', teamIds);

            if (equiposError) {
              console.error('Error fetching equiposData:', equiposError);
            }
            console.log('Fetched equiposData:', equiposData);

            if (equiposError || !equiposData) {
              setUserTeams([]);
            } else {
              // Set array of team names
              setUserTeams(equiposData.map(equipo => equipo.nombre));
            }
          }
        }
      } catch (err) {
        console.error('Exception in fetchUserData:', err);
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
        <p><strong>Equipo:</strong> {userTeams.length > 0 ? userTeams.join(', ') : 'No pertenece a ningún equipo'}</p>
      </div>
    </div>
  );
}

export default Perfil;
