import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './NuevaPagina.css';
import '/src/componentes/Heroe/Heroe.css';

const NuevaPagina = () => {
  const [partidos, setPartidos] = useState([]);
  const [zonasDisponibles, setZonasDisponibles] = useState([]);
  const [tiposCancha, setTiposCancha] = useState([]);
  const [partidosFiltrados, setPartidosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);

  const [zonaSeleccionada, setZonaSeleccionada] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchPartidos();
    fetchTiposCancha();
  }, []);

  useEffect(() => {
    extraerZonasUnicas();
  }, [partidos]);

  // Prefill filters from navigation state if available
  useEffect(() => {
    if (location.state) {
      const { zonaSeleccionada, tipoSeleccionado, fechaSeleccionada } = location.state;
      if (zonaSeleccionada) setZonaSeleccionada(zonaSeleccionada);
      if (tipoSeleccionado) setTipoSeleccionado(tipoSeleccionado);
      if (fechaSeleccionada) setFechaSeleccionada(fechaSeleccionada);
    }
  }, [location.state]);

  // Automatically filter partidos when filters or partidos change
  useEffect(() => {
    if (partidos.length > 0) {
      handleBuscar();
    }
  }, [zonaSeleccionada, tipoSeleccionado, fechaSeleccionada, partidos]);

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
          precioXHora,
          zona,
          tipoCancha: id_Tipo (
            descripcion
          )
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
      setPartidosFiltrados(data || []);
    }

    setLoading(false);
  };

  const fetchTiposCancha = async () => {
    const { data, error } = await supabase
      .from('tipoCancha')
      .select('descripcion');

    if (error) {
      console.error('Error al obtener tipos de cancha:', error);
    } else {
      setTiposCancha(data.map((t) => t.descripcion));
    }
  };

  const extraerZonasUnicas = () => {
    const zonas = partidos
      .map((p) => p.Cancha?.zona)
      .filter((zona, index, self) => zona && self.indexOf(zona) === index);
    setZonasDisponibles(zonas);
  };

  const handleCrearPartido = () => {
    navigate('/crear-partido');
  };

  const handleBuscar = () => {
    const filtrados = partidos.filter((partido) => {
      const zonaMatch = zonaSeleccionada
        ? partido.Cancha?.zona === zonaSeleccionada
        : true;

      const tipoMatch = tipoSeleccionado
        ? partido.Cancha?.tipoCancha?.descripcion === tipoSeleccionado
        : true;

      const fechaMatch = fechaSeleccionada
        ? partido.fecha === fechaSeleccionada
        : true;

      return zonaMatch && tipoMatch && fechaMatch;
    });

    setPartidosFiltrados(filtrados);
  };

  return (
    <div className="pagina-container">
      <div className="search-bar-container" style={{ marginTop: '2rem' }}>
        <div className="search-option">
          <i className="fa fa-map-marker-alt"></i>
          <select value={zonaSeleccionada} onChange={(e) => setZonaSeleccionada(e.target.value)}>
            <option value="">Buscar zona</option>
            {zonasDisponibles.map((zona, index) => (
              <option key={index} value={zona}>
                {zona}
              </option>
            ))}
          </select>
        </div>

        <div className="search-option">
          <i className="fa fa-futbol"></i>
          <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)}>
            <option value="">Tipo cancha</option>
            {tiposCancha.map((tipo, index) => (
              <option key={index} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        <div className="search-option">
          <i className="fa fa-calendar-alt"></i>
          <input
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
          />
        </div>

        
      </div>

      <div className="crear-container">
        <button className="boton-crear" onClick={handleCrearPartido}>
          Crear un partido
        </button>
      </div>

      <div className="partidos-container">
        <h2>Partidos disponibles</h2>

        {!loading && partidosFiltrados.length > 0 && (
          <p className="contador-partidos">- {partidosFiltrados.length} partidos encontrados</p>
        )}

        {loading ? (
          <p>Cargando...</p>
        ) : partidosFiltrados.length === 0 ? (
          <p>No hay partidos disponibles con los filtros aplicados</p>
        ) : (
          partidosFiltrados.map((partido) => (
            <div key={partido.id_Partidos} className="partido-card">
              <img
                src={partido.Cancha?.FotoCancha || 'https://via.placeholder.com/300x150'}
                alt="Foto cancha"
                className="partido-imagen"
              />
              <div className="partido-info">
                <p><strong>Fecha:</strong> {(() => {
                  const [year, month, day] = partido.fecha.split('-');
                  return `${day}/${month}/${year}`;
                })()}</p>
                <p><strong>Hora:</strong> {partido.horaInicio} - {partido.horaFin}</p>
                <p><strong>Cancha:</strong> {partido.Cancha?.nombre || 'Desconocida'}</p>
                <p><strong>Zona:</strong> {partido.Cancha?.zona || 'Sin zona'}</p>
                <p><strong>Tipo de cancha:</strong> {partido.Cancha?.tipoCancha?.descripcion || 'Sin tipo'}</p>
                <p><strong>Equipos:</strong> 
                  {partido.equipo1?.nombre ? partido.equipo1.nombre : 'Sin equipo preestablecido'} 
                  {' vs '} 
                  {partido.equipo2?.nombre ? partido.equipo2.nombre : 'Sin equipo preestablecido'}
                </p>
                <p><strong>Precio:</strong> ${partido.Cancha?.precioXHora || 'Desconocido'}</p>

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
