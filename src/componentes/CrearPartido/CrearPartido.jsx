import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import './CrearPartido.css';

export default function CrearPartidoForm() {
  const [canchas, setCanchas] = useState([]);
  const [tiposCancha, setTiposCancha] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [errorMensaje, setErrorMensaje] = useState('');

  const [formData, setFormData] = useState({
    cancha: '',
    tipoCancha: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    equipo1: '',
    equipo2: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: canchasData } = await supabase.from('Cancha').select('*');
      setCanchas(canchasData);

      const { data: tiposData } = await supabase.from('tipoCancha').select('*');
      setTiposCancha(tiposData);

      const { data: equiposData } = await supabase.from('equipos').select('*');
      setEquipos(equiposData);
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMensaje('');

    const {
      cancha,
      tipoCancha,
      fecha,
      horaInicio,
      horaFin,
      equipo1,
      equipo2
    } = formData;

    if (!cancha || !tipoCancha || !fecha || !horaInicio || !horaFin || !equipo1 || !equipo2) {
      setErrorMensaje('Todos los campos son obligatorios.');
      return;
    }

    if (equipo1 === equipo2) {
      setErrorMensaje('Equipo 1 y Equipo 2 no pueden ser iguales.');
      return;
    }

    const fechaActual = new Date().toISOString().split('T')[0];
    if (fecha < fechaActual) {
      setErrorMensaje('La fecha debe ser igual o posterior a hoy.');
      return;
    }

    const inicio = new Date(`2000-01-01T${horaInicio}`);
    const fin = new Date(`2000-01-01T${horaFin}`);
    const diferenciaHoras = (fin - inicio) / (1000 * 60 * 60);

    if (diferenciaHoras < 1) {
      setErrorMensaje('La hora de finalización debe ser al menos 1 hora después de la hora de inicio.');
      return;
    }

    const { data, error } = await supabase.from('partidos').insert([
      {
        idCancha: parseInt(cancha),
        fecha,
        horaInicio: horaInicio + ':00',
        horaFin: horaFin + ':00',
        idEquipo1: parseInt(equipo1),
        idEquipo2: parseInt(equipo2)
      }
    ]);

    if (error) {
      console.error('Error al insertar el partido:', error.message);
      setErrorMensaje('Error al publicar el partido.');
    } else {
      alert('¡Partido publicado con éxito!');
      setFormData({
        cancha: '',
        tipoCancha: '',
        fecha: '',
        horaInicio: '',
        horaFin: '',
        equipo1: '',
        equipo2: ''
      });
    }
  };

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h2 className="titulo-formulario">Crear un partido</h2>

      {errorMensaje && <p style={{ color: 'red' }}>{errorMensaje}</p>}

      <label>Nombre de la cancha:</label>
      <select name="cancha" value={formData.cancha} onChange={handleChange}>
        <option value="">Selecciona una cancha</option>
        {[...new Set(canchas.map(c => c.nombre))].map((nombre) => {
          const cancha = canchas.find(c => c.nombre === nombre);
          return (
            <option key={cancha.id_Cancha} value={cancha.id_Cancha}>{nombre}</option>
          );
        })}
      </select>

      <label>Tipo de cancha:</label>
      <select name="tipoCancha" value={formData.tipoCancha} onChange={handleChange}>
        <option value="">Selecciona el tipo de cancha</option>
        {tiposCancha.map((tipo) => (
          <option key={tipo.id_Tipo} value={tipo.id_Tipo}>{tipo.descripcion}</option>
        ))}
      </select>

      <label>Equipo 1:</label>
      <select name="equipo1" value={formData.equipo1} onChange={handleChange}>
        <option value="">Selecciona el equipo 1</option>
        {equipos.map((equipo) => (
          <option key={equipo.id_Equipo} value={equipo.id_Equipo}>{equipo.nombre}</option>
        ))}
      </select>

      <label>Equipo 2:</label>
      <select name="equipo2" value={formData.equipo2} onChange={handleChange}>
        <option value="">Selecciona el equipo 2</option>
        {equipos.map((equipo) => (
          <option key={equipo.id_Equipo} value={equipo.id_Equipo}>{equipo.nombre}</option>
        ))}
      </select>

      <label>Fecha:</label>
      <input type="date" name="fecha" min={new Date().toISOString().split('T')[0]} value={formData.fecha} onChange={handleChange} />

      <label>Hora de inicio:</label>
      <input type="time" name="horaInicio" value={formData.horaInicio} onChange={handleChange} />

      <label>Hora de finalización:</label>
      <input type="time" name="horaFin" value={formData.horaFin} onChange={handleChange} />

      <button type="submit" className="boton">Publicar el partido</button>
    </form>
  );
}
