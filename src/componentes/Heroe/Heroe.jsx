import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Heroe.css';

function Heroe({ isLoggedIn }) {
  const [zonasDisponibles, setZonasDisponibles] = useState([]);
  const [tiposCancha, setTiposCancha] = useState([]);

  const [zonaSeleccionada, setZonaSeleccionada] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchPartidos();
    fetchTiposCancha();
  }, []);

  const fetchPartidos = async () => {
    const { data, error } = await supabase
      .from('partidos')
      .select('Cancha ( zona )');

    if (error) {
      console.error('Error al obtener zonas:', error);
    } else {
      const zonas = data
        .map((p) => p.Cancha?.zona)
        .filter((zona, index, self) => zona && self.indexOf(zona) === index);
      setZonasDisponibles(zonas);
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
    navigate('/nueva-pagina', {
      state: {
        zonaSeleccionada,
        tipoSeleccionado,
        fechaSeleccionada,
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

            <div className="search-option no-border">
              <i className="fa fa-calendar-alt"></i>
              <input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
              />
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
