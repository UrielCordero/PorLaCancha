import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './Torneos.css';
import '/src/componentes/Heroe/Heroe.css';

const Torneos = () => {
  const [torneos, setTorneos] = useState([]);
  const [tiposCancha, setTiposCancha] = useState([]);
  const [torneosFiltrados, setTorneosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchTorneos();
    fetchTiposCancha();
  }, []);

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
        cantEquipos,
        premio,
        precioPersona,
        tipoCancha: id_Tipo (
          descripcion
        )
      `)
      .order('fechaInicio', { ascending: true });

    if (error) {
      console.error('Error al obtener torneos:', error);
    } else {
      setTorneos(data || []);
      setTorneosFiltrados(data || []);
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

  const handleCrearTorneo = () => {
    navigate('/crear-torneo');
  };

  const handleBuscar = () => {
    const filtrados = torneos.filter((torneo) => {
      const tipoMatch = tipoSeleccionado
        ? torneo.tipoCancha?.descripcion === tipoSeleccionado
        : true;

      const fechaMatch = fechaSeleccionada
        ? torneo.fechaInicio === fechaSeleccionada
        : true;

      return tipoMatch && fechaMatch;
    });

    setTorneosFiltrados(filtrados);
  };

  return (
    <div className="pagina-container">
      <div className="search-bar-container" style={{ marginTop: '2rem' }}>
        <div className="search-option">
          <i className="fa fa-futbol"></i>
          <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)}>
            <option value="">Tipo de cancha</option>
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

        <div className="search-button-wrapper">
          <button className="boton-crear" onClick={handleBuscar}>
            Buscar torneo
          </button>
        </div>
      </div>

      <div className="crear-container">
        <button className="boton-crear" onClick={handleCrearTorneo}>
          Crear un torneo
        </button>
      </div>

      <div className="partidos-container">
        <h2>Torneos disponibles</h2>

        {!loading && torneosFiltrados.length > 0 && (
          <p className="contador-partidos">- {torneosFiltrados.length} torneos encontrados</p>
        )}

        {loading ? (
          <p>Cargando...</p>
        ) : torneosFiltrados.length === 0 ? (
          <p>No hay torneos disponibles con los filtros aplicados</p>
        ) : (
          torneosFiltrados.map((torneo) => (
            <div key={torneo.id} className="partido-card">
              <img
                src={torneo.fotoTorneo || 'https://via.placeholder.com/300x150'}
                alt="Foto torneo"
                className="partido-imagen"
              />
              <div className="partido-info">
                <p><strong>Nombre:</strong> {torneo.nombreTorneo}</p>
                <p><strong>Fecha:</strong> {(() => {
                  const [y1, m1, d1] = torneo.fechaInicio.split('-');
                  const [y2, m2, d2] = torneo.fechaFin.split('-');
                  return `${d1}/${m1}/${y1} - ${d2}/${m2}/${y2}`;
                })()}</p>
                <p><strong>Tipo de cancha:</strong> {torneo.tipoCancha?.descripcion || 'Sin tipo'}</p>
                <p><strong>Cantidad de equipos:</strong> {torneo.cantEquipos}</p>
                <p><strong>Premio:</strong> ${torneo.premio}</p>
                <p><strong>Precio por persona:</strong> ${torneo.precioPersona}</p>

                <div className="boton-unirse-container">
                  <button className="boton-crear boton-unirse">Unirse al torneo</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Torneos;
