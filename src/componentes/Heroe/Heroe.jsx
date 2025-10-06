import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Heroe.css';

function Heroe({ isLoggedIn }) {
  const [zonasDisponibles, setZonasDisponibles] = useState([]);
  const [provinciasDisponibles, setProvinciasDisponibles] = useState([]);
  const [tiposCancha, setTiposCancha] = useState([]);

  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [zonaSeleccionada, setZonaSeleccionada] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [fechaInicioSeleccionada, setFechaInicioSeleccionada] = useState('');
  const [fechaFinSeleccionada, setFechaFinSeleccionada] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchPartidos();
    fetchTiposCancha();
  }, []);

  const fetchPartidos = async () => {
    const { data, error } = await supabase
      .from('partidos')
      .select(`
        Cancha (
          Localidad (
            Localidad
          ),
          Provinicia (
            nombre_provincia
          )
        )
      `);

    if (error) {
      console.error('Error al obtener localidades y provincias:', error);
    } else {
      const localidades = data
        .map((p) => p.Cancha?.Localidad?.Localidad)
        .filter((localidad, index, self) => localidad && self.indexOf(localidad) === index)
        .sort((a, b) => a.localeCompare(b));
      setZonasDisponibles(localidades);

      const provincias = data
        .map((p) => p.Cancha?.Provinicia?.nombre_provincia)
        .filter((provincia, index, self) => provincia && self.indexOf(provincia) === index)
        .sort((a, b) => a.localeCompare(b));
      setProvinciasDisponibles(provincias);
    }
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

  const handleBuscar = () => {
    if (!isLoggedIn) {
      alert('Debe iniciar sesión para realizar esta acción.');
      return;
    }
    navigate('/ver-partidos', {
      state: {
        provinciaSeleccionada,
        localidadSeleccionada: zonaSeleccionada,
        tipoSeleccionado,
        fechaInicioSeleccionada,
        fechaFinSeleccionada,
      },
    });
  };

  return (
    <section className="hero">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1>¿Tenés ganas de jugar? Nosotros te conseguimos rival y cancha.</h1>
          <p>Compite en torneos organizados o arma partidos con jugadores cerca tuyo.</p>
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
              <select value={zonaSeleccionada} onChange={(e) => setZonaSeleccionada(e.target.value)}>
                <option value="">Buscar localidad</option>
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

            <div className="search-button-wrapper">
              <button className="boton-crear" onClick={handleBuscar}>
                Buscar partido
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Heroe;
