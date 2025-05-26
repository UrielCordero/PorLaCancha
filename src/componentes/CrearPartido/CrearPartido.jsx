import React, { useState } from 'react';
import './CrearPartido.css';

function CrearPartido() {
  const [escudo, setEscudo] = useState(null);
  const [cancha, setCancha] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [duracion, setDuracion] = useState('1 hora');
  const [tipoPartido, setTipoPartido] = useState('Futbol 5');
  const [precio, setPrecio] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleFileChange = (e) => {
    setEscudo(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!escudo || !cancha || !fecha || !hora || !duracion || !tipoPartido || !precio) {
      setMensaje('Por favor, complete todos los campos.');
      return;
    }
    const nuevoPartido = {
      escudo,
      cancha,
      fecha,
      hora,
      duracion,
      tipoPartido,
      precio,
    };
    console.log('Nuevo partido creado:', nuevoPartido);
    setMensaje('Partido creado con éxito!');
    
    setEscudo(null);
    setCancha('');
    setFecha('');
    setHora('');
    setDuracion('1 hora');
    setTipoPartido('Futbol 5');
    setPrecio('');
    
    e.target.reset();
  };

  return (
    <main className="crear-partido-content">
      <h2>Crea un partido</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Foto del escudo del equipo:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {escudo && <p>Archivo seleccionado: {escudo.name}</p>}
        </div>
        <div>
          <label>Nombre de la cancha:</label>
          <input
            type="text"
            value={cancha}
            onChange={(e) => setCancha(e.target.value)}
            placeholder="Nombre de la cancha"
          />
        </div>
        <div>
          <label>Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <div>
          <label>Hora de arranque:</label>
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          />
        </div>
        <div>
          <label>Duración:</label>
          <select value={duracion} onChange={(e) => setDuracion(e.target.value)}>
            <option value="1 hora">1/2 hora</option>
            <option value="1.5 horas">1 hora</option>
            <option value="1.5 horas">1.5 hora</option>
            <option value="2 horas">2 horas</option>
          </select>
        </div>
        <div>
          <label>Tipo de partido:</label>
          <select value={tipoPartido} onChange={(e) => setTipoPartido(e.target.value)}>
            <option value="Futbol 5">Futbol 5</option>
            <option value="Futbol 8">Futbol 8</option>
          </select>
        </div>
        <div>
          <label>Precio de la cancha:</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="$3500"
            min="0"
          />
        </div>
        <button type="submit" className="btn-publicar">Publicar el partido</button>
      </form>
      {mensaje && <p className="mensaje">{mensaje}</p>}
    </main>
  );
}

export default CrearPartido;
