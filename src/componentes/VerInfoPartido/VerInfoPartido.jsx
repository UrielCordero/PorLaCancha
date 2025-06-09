import React, { useEffect, useState } from 'react';
import './verInfoPartido.css';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

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
      <h1>Información del Partido</h1>
      <div className="partido-info">
        <p><strong>Fecha:</strong> {partido.fecha}</p>
        <p><strong>Hora:</strong> {partido.horaInicio} - {partido.horaFin}</p>
        <p><strong>Cancha:</strong> {cancha.nombre}</p>
        <p><strong>Dirección:</strong> {cancha.ubicacion}</p>
        <p><strong>Precio/hora:</strong> ${cancha.precioXHora}</p>
      </div>

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
    </div>
  );
};

export default VerInfoPartido;
