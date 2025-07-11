import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import '../VerPartido/VerPartido.css';

const MisPartidos = () => {
  const [misPartidos, setMisPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const navigate = useNavigate();

  // Helper function to format time string by removing seconds
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.split(':').slice(0, 2).join(':');
  };

  useEffect(() => {
    const fetchMisPartidos = async () => {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!loggedInUser) {
        setMisPartidos([]);
        setLoading(false);
        return;
      }

      // Get partido IDs the user has joined
      const { data: partidoXUsuariosData, error: pxeError } = await supabase
        .from('partidoXUsuarios')
        .select('id_partidos')
        .eq('id_usuarios', loggedInUser.idUsuarios);

      if (pxeError) {
        console.error('Error fetching user joined matches:', pxeError);
        setMisPartidos([]);
        setLoading(false);
        return;
      }

      const partidoIds = partidoXUsuariosData.map(item => item.id_partidos);

      if (partidoIds.length === 0) {
        setMisPartidos([]);
        setLoading(false);
        return;
      }

      // Fetch match details for these partido IDs
      const { data: partidosData, error: partidosError } = await supabase
        .from('partidos')
        .select(
          "id_Partidos, fecha, horaInicio, horaFin, Cancha ( nombre, FotoCancha, precioXHora, zona, tipoCancha: id_Tipo ( descripcion ) ), equipo1: idEquipo1 ( nombre, imgEscudo ), equipo2: idEquipo2 ( nombre, imgEscudo )"
        )
        .in('id_Partidos', partidoIds)
        .order('fecha', { ascending: false });

      if (partidosError) {
        console.error('Error fetching matches:', partidosError);
        setMisPartidos([]);
      } else {
        setMisPartidos(partidosData || []);
      }
      setLoading(false);
    };

    fetchMisPartidos();
  }, []);

  const displayedPartidos = misPartidos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mis-partidos-container">
      <h2>Mis Partidos</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : misPartidos.length === 0 ? (
        <p>No te has unido a ningún partido aún.</p>
      ) : (
        <>
          <div className="partidos-grid">
            {displayedPartidos.map((partido) => (
              <div key={partido.id_Partidos} className="partido-card">
                <img
                  src={partido.Cancha?.FotoCancha || 'https://via.placeholder.com/300x150'}
                  alt="Foto cancha"
                  className="partido-imagen"
                />
                <div className="partido-info">
                  <p><strong>Hora:</strong> {formatTime(partido.horaInicio)} - {formatTime(partido.horaFin)}</p>
                  <p><strong>Cancha:</strong> {partido.Cancha?.nombre || 'Desconocida'}</p>
                  <p><strong>Precio:</strong> ${partido.Cancha?.precioXHora || 'Desconocido'}</p>
                  <div className="boton-unirse-container">
                    <button
                      className="boton-crear boton-unirse"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate('/ver-info-partido/' + partido.id_Partidos);
                      }}
                    >
                      Ver mas info
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              {'<'}
            </button>

            {Array.from(
              { length: Math.ceil(misPartidos.length / itemsPerPage) },
              (_, i) => i + 1
            ).map((pageNum) => (
              <button
                key={pageNum}
                className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              className="pagination-button"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(misPartidos.length / itemsPerPage))
                )
              }
              disabled={currentPage === Math.ceil(misPartidos.length / itemsPerPage)}
            >
              {'>'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MisPartidos;
