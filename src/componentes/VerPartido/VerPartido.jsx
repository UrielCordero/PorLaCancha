
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './VerPartido.css';
import '/src/componentes/Heroe/Heroe.css';

const VerPartido = () => {
  const [partidos, setPartidos] = useState([]);
  const [localidadesDisponibles, setLocalidadesDisponibles] = useState([]);
  const [provinciasDisponibles, setProvinciasDisponibles] = useState([]);
  const [tiposCancha, setTiposCancha] = useState([]);
  const [partidosFiltrados, setPartidosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [fechaInicioSeleccionada, setFechaInicioSeleccionada] = useState('');
  const [fechaFinSeleccionada, setFechaFinSeleccionada] = useState('');
  const [CurrentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to format time string by removing seconds
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.split(':').slice(0, 2).join(':');
  };

  useEffect(() => {
    fetchPartidos();
    fetchTiposCancha();

    // Get current user on mount and subscribe to auth changes
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('getUser user:', user);
      setCurrentUser(user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('onAuthStateChange session:', session);
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    extraerLocalidadesUnicas();
    extraerProvinciasUnicas();
  }, [partidos]);

  // Prefill filters from navigation state if available
  useEffect(() => {
    if (location.state) {
      const { localidadSeleccionada: zonaSeleccionada, tipoSeleccionado, fechaSeleccionada, fechaInicioSeleccionada, fechaFinSeleccionada } = location.state;
      if (zonaSeleccionada) setLocalidadSeleccionada(zonaSeleccionada);
      if (tipoSeleccionado) setTipoSeleccionado(tipoSeleccionado);
      if (fechaSeleccionada) setFechaSeleccionada(fechaSeleccionada);
      if (fechaInicioSeleccionada) setFechaInicioSeleccionada(fechaInicioSeleccionada);
      if (fechaFinSeleccionada) setFechaFinSeleccionada(fechaFinSeleccionada);
    }
  }, [location.state]);

  // Automatically filter partidos when filters or partidos change
  useEffect(() => {
    if (partidos.length > 0) {
      handleBuscar();
      setCurrentPage(1); // Reset to first page on filter change
    }
  }, [provinciaSeleccionada, localidadSeleccionada, tipoSeleccionado, fechaSeleccionada, fechaInicioSeleccionada, fechaFinSeleccionada, partidos]);


  const fetchPartidos = async () => {
    setLoading(true);

    // Obtener fecha actual ajustada por zona horaria
    const fechaHoy = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    console.log('Fecha usada para filtrar:', fechaHoy);

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
          Provinicia (
            nombre_provincia
          ),
          Localidad (
            Localidad
          ),
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
      .gte('fecha', fechaHoy) // Solo partidos con fecha igual o posterior a hoy (ajustado por zona horaria)
      .order('fecha', { ascending: true });

    if (error) {
      console.error('Error al obtener partidos:', error);
    } else {
      console.log('Partidos obtenidos:', data);
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

  const extraerLocalidadesUnicas = () => {
    const localidades = partidos
      .map((p) => p.Cancha?.Localidad?.Localidad)
      .filter((localidad, index, self) => localidad && self.indexOf(localidad) === index)
      .sort((a, b) => a.localeCompare(b));
    setLocalidadesDisponibles(localidades);
  };

  const extraerProvinciasUnicas = () => {
    const provincias = partidos
      .map((p) => p.Cancha?.Provinicia?.nombre_provincia)
      .filter((provincia, index, self) => provincia && self.indexOf(provincia) === index)
      .sort((a, b) => a.localeCompare(b));
    setProvinciasDisponibles(provincias);
  };

  const handleCrearPartido = async () => {
    
    const hamburgerMenu = document.querySelector('img[src*="Menu.png"]');
    if (hamburgerMenu) {
      
      navigate('/crear-partido');
      return;
    }

    // Otherwise, check user login status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Debe iniciar sesión');
      return;
    }
    navigate('/crear-partido');
  };

  const handleBuscar = () => {
    const filtrados = partidos.filter((partido) => {
      const provinciaMatch = provinciaSeleccionada
        ? partido.Cancha?.Provinicia?.nombre_provincia === provinciaSeleccionada
        : true;

      const localidadMatch = localidadSeleccionada
        ? partido.Cancha?.Localidad?.Localidad === localidadSeleccionada
        : true;

      const tipoMatch = tipoSeleccionado
        ? partido.Cancha?.tipoCancha?.descripcion === tipoSeleccionado
        : true;

      const fechaMatch = fechaSeleccionada
        ? partido.fecha === fechaSeleccionada
        : true;

      const fechaInicioMatch = fechaInicioSeleccionada
        ? partido.fecha >= fechaInicioSeleccionada
        : true;

      const fechaFinMatch = fechaFinSeleccionada
        ? partido.fecha <= fechaFinSeleccionada
        : true;

      return provinciaMatch && localidadMatch && tipoMatch && fechaMatch && fechaInicioMatch && fechaFinMatch;
    });

    setPartidosFiltrados(filtrados);
  };

  return (
    <div className="pagina-container">
      <div className="search-bar-container" style={{ marginTop: '2rem' }}>
        <div className="search-option">
          <i className="fa fa-map-marker-alt"></i>
          <select value={provinciaSeleccionada} onChange={(e) => setProvinciaSeleccionada(e.target.value)}>
            <option value="">Buscar provincia</option>
            {provinciasDisponibles.map((provincia, index) => (
              <option key={index} value={provincia}>
                {provincia}
              </option>
            ))}
          </select>
        </div>

        <div className="search-option">
          <i className="fa fa-map-marker-alt"></i>
          <select value={localidadSeleccionada} onChange={(e) => setLocalidadSeleccionada(e.target.value)}>
            <option value="">Buscar localidad</option>
            {localidadesDisponibles.map((localidad, index) => (
              <option key={index} value={localidad}>
                {localidad}
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

      <div className="search-option no-border" style={{ position: 'relative' }}>
        <input
          type="date"
          value={fechaInicioSeleccionada}
          onChange={(e) => {
            setFechaInicioSeleccionada(e.target.value);
            if (fechaFinSeleccionada && e.target.value > fechaFinSeleccionada) {
              setFechaFinSeleccionada('');
            }
          }}
          title="Fecha inicio"
          style={{
            position: 'relative',
            zIndex: 2,
            background: 'transparent',
            color: fechaInicioSeleccionada ? 'inherit' : 'transparent',
          }}
        />
        {!fechaInicioSeleccionada && (
          <span
            style={{
              position: 'absolute',
              left: '1rem',
              top: '40%',
              transform: 'translateY(-50%)',
              color: '#555',
              pointerEvents: 'none',
              zIndex: 1,
              fontSize: '1rem',
              fontWeight: 'normal',
              fontFamily: 'inherit',
              lineHeight: 'normal',
            }}
          >
            Desde
          </span>
        )}
      </div>
      <div className="search-option no-border" style={{ position: 'relative' }}>
        <input
          type="date"
          value={fechaFinSeleccionada}
          onChange={(e) => {
            if (!fechaInicioSeleccionada || e.target.value >= fechaInicioSeleccionada) {
              setFechaFinSeleccionada(e.target.value);
            } else {
              alert('La fecha fin debe ser igual o posterior a la fecha inicio');
            }
          }}
          title="Fecha fin"
          style={{
            position: 'relative',
            zIndex: 2,
            background: 'transparent',
            color: fechaFinSeleccionada ? 'inherit' : 'transparent',
          }}
        />
        {!fechaFinSeleccionada && (
          <span
            style={{
              position: 'absolute',
              left: '1rem',
              top: '40%',
              transform: 'translateY(-50%)',
              color: '#555',
              pointerEvents: 'none',
              zIndex: 1,
              fontSize: '1rem',
              fontWeight: 'normal',
              fontFamily: 'inherit',
              lineHeight: 'normal',
            }}
          >
            Hasta
          </span>
        )}
      </div>
      <div className="search-option clear-filters" title="Reiniciar filtros" onClick={() => {
        setProvinciaSeleccionada('');
        setLocalidadSeleccionada('');
        setTipoSeleccionado('');
        setFechaSeleccionada('');
        setFechaInicioSeleccionada('');
        setFechaFinSeleccionada('');
      }}>
        <span style={{ color: 'white', fontWeight: 'bold' }}>×</span>
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
          <>
          <div className="partidos-grid">
            {partidosFiltrados
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((partido) => (
                <div key={partido.id_Partidos} className="partido-card">
                  <img
                    src={partido.Cancha?.FotoCancha || 'https://via.placeholder.com/300x150'}
                    alt="Foto cancha"
                    className="partido-imagen"
                  />
                  <div className="partido-info">
                    <p><strong>Fecha:</strong> {(() => {
                      const d = partido.fecha.split('-');
                      const dateObj = new Date(Date.UTC(d[0], d[1] - 1, d[2]));
                      dateObj.setUTCDate(dateObj.getUTCDate() + 1);
                      return dateObj.toLocaleDateString('es-AR');
                    })()}</p>
                    <p><strong>Hora:</strong> {formatTime(partido.horaInicio)} - {formatTime(partido.horaFin)}</p>
                    <p><strong>Cancha:</strong> {partido.Cancha?.nombre || 'Desconocida'}</p>
                    <p><strong>Precio:</strong> ${partido.Cancha?.precioXHora || 'Desconocido'}</p>
                    <div className="boton-unirse-container">
                      <button
                        className="boton-crear boton-unirse"
                        onClick={() => navigate(`/ver-info-partido/${partido.id_Partidos}`)}
                      >
                        Ver mas info
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            {Array.from({ length: itemsPerPage - Math.min(itemsPerPage, partidosFiltrados.length - (currentPage - 1) * itemsPerPage) }).map((_, index) => (
              <div key={`placeholder-${index}`} className="partido-card placeholder-card" aria-hidden="true" />
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
                { length: Math.ceil(partidosFiltrados.length / itemsPerPage) },
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
                    Math.min(prev + 1, Math.ceil(partidosFiltrados.length / itemsPerPage))
                  )
                }
                disabled={currentPage === Math.ceil(partidosFiltrados.length / itemsPerPage)}
              >
                {'>'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerPartido;
