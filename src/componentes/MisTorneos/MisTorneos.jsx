import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './MisTorneos.css';

const MisTorneos = () => {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMisTorneos = async () => {
      setLoading(true);

      // Get logged-in user from localStorage or supabase session
      let user = null;
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        try {
          user = JSON.parse(storedUser);
        } catch (e) {
          console.error('Error parsing loggedInUser from localStorage', e);
        }
      }
      if (!user) {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session || !session.user) {
          setLoading(false);
          return;
        }
        user = session.user;
      }

      // Get idUsuarios from Usuarios table by email
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('Usuarios')
        .select('idUsuarios')
        .eq('email', user.email)
        .single();

      if (usuarioError || !usuarioData) {
        console.error('Error al obtener el idUsuarios:', usuarioError);
        setLoading(false);
        return;
      }

      const idUsuarios = usuarioData.idUsuarios;

      // Get user's team id from usariosXEquipos
      const { data: userTeamData, error: userTeamError } = await supabase
        .from('usariosXEquipos')
        .select('idEquipos')
        .eq('idUsuarios', idUsuarios)
        .single();

      if (userTeamError || !userTeamData) {
        console.error('Error al obtener el equipo del usuario:', userTeamError);
        setLoading(false);
        return;
      }

      const idEquipo = userTeamData.idEquipos;

      // Get tournaments joined by the team from equiposXTorneos
      const { data: equiposXTorneosData, error: equiposXTorneosError } = await supabase
        .from('equiposXTorneos')
        .select('idtorneo')
        .eq('idequipos', idEquipo);

      if (equiposXTorneosError) {
        console.error('Error al obtener torneos del equipo:', equiposXTorneosError);
        setLoading(false);
        return;
      }

      const torneoIds = equiposXTorneosData.map(entry => entry.idtorneo);

      if (torneoIds.length === 0) {
        setTorneos([]);
        setLoading(false);
        return;
      }

      // Get tournament details for the joined tournaments
      const { data: torneosData, error: torneosError } = await supabase
        .from('torneo')
        .select('id, fotoTorneo, nombreTorneo, fechaInicio, fechaFin')
        .in('id', torneoIds)
        .order('fechaInicio', { ascending: true });

      if (torneosError) {
        console.error('Error al obtener detalles de torneos:', torneosError);
        setLoading(false);
        return;
      }

      setTorneos(torneosData || []);
      setLoading(false);
    };

    fetchMisTorneos();
  }, []);

  const getMes = (mesNumero) => {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return meses[parseInt(mesNumero, 10) - 1];
  };

  return (
    <div className="mis-torneos-container">
      <h2>Mis Torneos</h2>
      <div className="torneos-lista">
        {loading ? (
          <p>Cargando torneos...</p>
        ) : torneos.length === 0 ? (
          <p>No hay torneos a los que tu equipo se haya unido.</p>
        ) : (
          torneos.map((torneo) => (
            <div key={torneo.id} className="torneo-card">
              <img
                src={torneo.fotoTorneo}
                alt="Torneo"
                className="torneo-imagen"
              />
              <h3>{torneo.nombreTorneo}</h3>
              <p>
                {(() => {
                  const [y1, m1, d1] = torneo.fechaInicio.split('-');
                  const [y2, m2, d2] = torneo.fechaFin.split('-');
                  return `${parseInt(d1)} de ${getMes(m1)} - ${parseInt(d2)} de ${getMes(m2)}`;
                })()}
              </p>
              <button
                className="ver-info"
                onClick={() => navigate(`/info-torneo/${torneo.id}`)}
              >
                Ver más info
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MisTorneos;
