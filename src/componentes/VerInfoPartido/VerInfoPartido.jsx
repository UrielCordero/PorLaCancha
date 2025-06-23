import React, { useEffect, useState } from 'react';
import './VerInfoPartido.css';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const VerInfoPartido = () => {
  const { id } = useParams();
  const [partido, setPartido] = useState(null);
  const [cancha, setCancha] = useState(null);
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
      }

      setLoading(false);
    };

    fetchPartido();
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (!partido || !cancha) return <div>No se encontró el partido</div>;

  return (
    <div className="ver-info-container">
      <h2 className="titulo">Detalles del partido</h2>
      <div className="ubicacion-mapa">
        {cancha && (
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(cancha.ubicacion)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa de Cancha"
          ></iframe>
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

      <button className="boton-unirme">Unirme al partido</button>
    </div>
  );
};

export default VerInfoPartido;
