import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './NuevaPagina.css';
import '/src/componentes/Heroe/Heroe.css';

const NuevaPagina = () => {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPartidos();
  }, []);

  const fetchPartidos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('partidos')
      .select(`
        id_Partidos,
        fecha,
        horaInicio,
        horaFin,
        Cancha (
          nombre,
          FotoCancha,
          precioXHora
        ),
        equipo1: idEquipo1 (
          nombre,
          imgEscudo
        ),
        equipo2: idEquipo2 (
          nombre,
          imgEscudo
        )
      `)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al obtener partidos:', error);
    } else {
      setPartidos(data || []);
    }

    setLoading(false);
  };

  const handleCrearPartido = () => {
    navigate('/crear-partido');
  };

  return (
    <div className="pagina-container">

      {/* Navbar de búsqueda */}
      <div className="search-bar-container" style={{ marginTop: '2rem' }}>
        <div className="search-option">
          <i className="fa fa-map-marker-alt"></i>
          <select>
            <option>Buscar zona</option>
            <option>La boca</option>
            <option>Almagro</option>
            <option>Caballito</option>
          </select>
        </div>
        <div className="search-option">
          <i className="fa fa-calendar-alt"></i>
          <input type="date" />
        </div>
        <div className="search-option">
          <i className="fa fa-clock"></i>
          <input type="time" />
        </div>
        <button className="search-button">Buscar partido</button>
      </div>

      <div className="crear-container">
        <button className="boton-crear" onClick={handleCrearPartido}>
          Crear un partido
        </button>
      </div>

      <div className="partidos-container">
        <h2>Partidos disponibles</h2>

        {/* Contador de partidos */}
        {!loading && partidos.length > 0 && (
          <p className="contador-partidos">- {partidos.length} partidos disponibles</p>
        )}

        {loading ? (
          <p>Cargando...</p>
        ) : partidos.length === 0 ? (
          <p>No hay partidos disponibles</p>
        ) : (
          partidos.map((partido) => (
            <div key={partido.id_Partidos} className="partido-card">
              <img
                src={partido.Cancha?.FotoCancha || 'https://via.placeholder.com/300x150'}
                alt="Foto cancha"
                className="partido-imagen"
              />
              <div className="partido-info">
                <p><strong>Fecha:</strong> {new Date(partido.fecha).toLocaleDateString()}</p>
                <p><strong>Hora:</strong> {partido.horaInicio} - {partido.horaFin}</p>
                <p><strong>Cancha:</strong> {partido.Cancha?.nombre || 'Desconocida'}</p>
                <p><strong>Equipos:</strong> {partido.equipo1?.nombre || 'Equipo 1'} vs {partido.equipo2?.nombre || 'Equipo 2'}</p>
                <p><strong>Precio:</strong> {partido.Cancha?.precioXHora || 'Desconocida'}</p>

                <div className="boton-unirse-container">
                  <button className="boton-crear boton-unirse">Unirse al partido</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NuevaPagina;
