import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Torneos.css';

const Torneos = () => {
  const [torneos, setTorneos] = useState([]);
  const [filteredTorneos, setFilteredTorneos] = useState([]);
  const [provinciasDisponibles, setProvinciasDisponibles] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [localidadesDisponibles, setLocalidadesDisponibles] = useState([]);
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState('');
  const [tiposCanchaDisponibles, setTiposCanchaDisponibles] = useState([]);
  const [tipoCanchaSeleccionada, setTipoCanchaSeleccionada] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTorneos();
  }, []);

  useEffect(() => {
    extraerProvinciasUnicas();
    extraerLocalidadesUnicas();
    extraerTiposCanchaUnicas();
  }, [torneos]);

  useEffect(() => {
    if (torneos.length > 0) {
      handleFiltrar();
    }
  }, [provinciaSeleccionada, localidadSeleccionada, tipoCanchaSeleccionada, torneos]);

  const fetchTorneos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('torneo')
      .select(`
        id,
        fotoTorneo,
        nombreTorneo,
        fechaInicio,
        fechaFin,
        Cancha (
          Provinicia (
            nombre_provincia
          ),
          Localidad (
            Localidad
          ),
          tipoCancha (
            descripcion
          )
        )
      `)
      .order('fechaInicio', { ascending: true });

    if (error) {
      console.error('Error al obtener torneos:', error);
    } else {
      setTorneos(data || []);
      setFilteredTorneos(data || []);
    }

    setLoading(false);
  };

  const handleCrearTorneo = async () => {
    // Check if hamburger menu is present in DOM
    const hamburgerMenu = document.querySelector('img[src*="Menu.png"]');
    if (hamburgerMenu) {
      // Hamburger menu present, assume user logged in, allow navigation
      navigate('/crear-torneo');
      return;
    }

    // Otherwise, check user login status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Debe iniciar sesión');
      return;
    }
    navigate('/crear-torneo');
  };

  const extraerProvinciasUnicas = () => {
    const provincias = torneos
      .map((t) => t.Cancha?.Provinicia?.nombre_provincia)
      .filter((provincia, index, self) => provincia && self.indexOf(provincia) === index)
      .sort((a, b) => a.localeCompare(b));
    setProvinciasDisponibles(provincias);
  };

  const extraerLocalidadesUnicas = () => {
    const localidades = torneos
      .map((t) => t.Cancha?.Localidad?.Localidad)
      .filter((localidad, index, self) => localidad && self.indexOf(localidad) === index)
      .sort((a, b) => a.localeCompare(b));
    setLocalidadesDisponibles(localidades);
  };

  const extraerTiposCanchaUnicas = () => {
    const tipos = torneos
      .map((t) => t.Cancha?.tipoCancha?.descripcion)
      .filter((tipo, index, self) => tipo && self.indexOf(tipo) === index)
      .sort((a, b) => a.localeCompare(b));
    setTiposCanchaDisponibles(tipos);
  };

  const handleFiltrar = () => {
    const filtrados = torneos.filter((torneo) => {
      const provinciaMatch = provinciaSeleccionada
        ? torneo.Cancha?.Provinicia?.nombre_provincia === provinciaSeleccionada
        : true;
      const localidadMatch = localidadSeleccionada
        ? torneo.Cancha?.Localidad?.Localidad === localidadSeleccionada
        : true;
      const tipoMatch = tipoCanchaSeleccionada
        ? torneo.Cancha?.tipoCancha?.descripcion === tipoCanchaSeleccionada
        : true;
      return provinciaMatch && localidadMatch && tipoMatch;
    });
    setFilteredTorneos(filtrados);
  };

  const handleLimpiarFiltros = () => {
    setProvinciaSeleccionada('');
    setLocalidadSeleccionada('');
    setTipoCanchaSeleccionada('');
  };

  return (
    <div className="torneos-container">
      <div className="torneos-header">
        <div className="header-texto">
          <h2>Participa en torneos <br />amateurs organizados</h2>
          <p>
            Conéctate con otros jugadores y formá tu equipo para competir en diversos torneos
          </p>
          <button className="boton-crear" onClick={handleCrearTorneo}>
            Crea un torneo
          </button>
        </div>
        <img
          src="/src/assets/TorneoEj.png"
          alt="Jugadores festejando"
          className="imagen-header"
        />
      </div>

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
          <i className="fa fa-city"></i>
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
          <select value={tipoCanchaSeleccionada} onChange={(e) => setTipoCanchaSeleccionada(e.target.value)}>
            <option value="">Buscar tipo de cancha</option>
            {tiposCanchaDisponibles.map((tipo, index) => (
              <option key={index} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>
        <div className="search-option clear-filters" title="Reiniciar filtros" onClick={handleLimpiarFiltros}>
          <span style={{ color: 'white', fontWeight: 'bold' }}>×</span>
        </div>
      </div>

      <div className="torneos-lista">
        {loading ? (
          <p>Cargando torneos...</p>
        ) : filteredTorneos.length === 0 ? (
          <p>No hay torneos disponibles actualmente.</p>
        ) : (
          filteredTorneos.map((torneo) => (
            <div key={torneo.id} className="torneo-card">
              <img
                src={torneo.fotoTorneo}
                alt="Torneo"
                className="torneo-imagen"
              />
              <h3>{torneo.nombreTorneo}</h3>
              <p>
                {(() => {
                  const [, m1, d1] = torneo.fechaInicio.split('-');
                  const [, m2, d2] = torneo.fechaFin.split('-');
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

const getMes = (mesNumero) => {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return meses[parseInt(mesNumero, 10) - 1];
};

export default Torneos;
