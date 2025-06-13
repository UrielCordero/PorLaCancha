import React, { useEffect, useState } from 'react';
import './VerInfoPartido.css';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const jugadores = [
  {
    id: 1,
    nombre: 'Francisco Marapopoden',
    foto: '/src/assets/ImgPerfil.png',
  },
  {
    id: 2,
    nombre: 'Jazinto Moguillner',
    foto: '/src/assets/ImgPerfil.png',
  },
  {
    id: 3,
    nombre: 'Bruno Maratisto',
    foto: '/src/assets/ImgPerfil.png',
  },
  {
    id: 4,
    nombre: 'Santiago Solemsky',
    foto: '/src/assets/ImgPerfil.png',
  },
];

const VerInfoPartido = () => {
  const { id } = useParams();
  const [partido, setPartido] = useState(null);
  const [cancha, setCancha] = useState(null);
  const [coordenadas, setCoordenadas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartido = async () => {
      const { data: partidoData, error } = await supabase
        .from('partidos')
        .select('*, Cancha(*)')
        .eq('id_Partidos', id)
        .single();

      if (error) {
        console.error('Error al obtener el partido:', error);
      } else {
        setPartido(partidoData);
        setCancha(partidoData.Cancha);
        obtenerCoordenadas(partidoData.Cancha.ubicacion);
      }

      setLoading(false);
    };

    const obtenerCoordenadas = async (direccion) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`);
        const data = await response.json();
        if (data.length > 0) {
          setCoordenadas({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
          });
        }
      } catch (error) {
        console.error('Error obteniendo coordenadas:', error);
      }
    };

    fetchPartido();
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (!partido || !cancha) return <div>No se encontró el partido</div>;

  const marcadorIcono = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <div className="ver-info-container">
      <h2 className="titulo">Detalles del partido</h2>
      <div className="ubicacion-mapa">
        {coordenadas && (
          <MapContainer center={[coordenadas.lat, coordenadas.lon]} zoom={15} className="mapa-cancha">
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[coordenadas.lat, coordenadas.lon]} icon={marcadorIcono}>
              <Popup>{cancha.nombre}</Popup>
            </Marker>
          </MapContainer>
        )}
        <p className="direccion">{cancha ? cancha.ubicacion : ''}</p>
      </div>

      <div className="info-boxes">
        <div className="info-box">
          <div className="icono">&#128197;</div>
          <div className="texto">{partido ? partido.fecha : ''}</div>
        </div>
        <div className="info-box">
          <div className="icono">&#128337;</div>
          <div className="texto">{partido ? partido.horaInicio.slice(0,5) : ''}</div>
        </div>
        <div className="info-box">
          <div className="icono">&#36;</div>
          <div className="texto">{cancha ? `$${cancha.precioXHora}` : ''}</div>
        </div>
      </div>

      <h3 className="subtitulo">Jugadores ({jugadores.length}/10)</h3>
      <div className="jugadores-lista">
        {jugadores.map((jugador) => (
          <div key={jugador.id} className="jugador">
            <img src={jugador.foto} alt={jugador.nombre} className="avatar" />
            <p className="nombre-jugador">{jugador.nombre}</p>
          </div>
        ))}
      </div>

      <button className="boton-unirme">Unirme al partido</button>
      <p className="footer-texto">Faltan {10 - jugadores.length} jugadores</p>
    </div>
  );
};

export default VerInfoPartido;
