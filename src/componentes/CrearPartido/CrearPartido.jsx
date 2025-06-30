import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './CrearPartido.css';

export default function CrearPartidoForm() {
  const [canchas, setCanchas] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [errorMensaje, setErrorMensaje] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombreCancha: '',
    cancha: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    equipo1: '',
    equipo2: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: canchasData } = await supabase
        .from('Cancha')
        .select('*, tipoCancha: id_Tipo (descripcion)');
      setCanchas(canchasData || []);

      const { data: equiposData } = await supabase.from('equipos').select('*');
      setEquipos(equiposData || []);
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'nombreCancha' ? { cancha: '' } : {}) // Si cambia el nombre, limpiamos el id_Cancha
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMensaje('');

    const {
      cancha,
      fecha,
      horaInicio,
      horaFin,
      equipo1,
      equipo2
    } = formData;

    if (!cancha || !fecha || !horaInicio || !horaFin) {
      setErrorMensaje('Todos los campos son obligatorios, excepto los equipos.');
      return;
    }

    if (equipo1 && equipo2 && equipo1 === equipo2) {
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

    const { error } = await supabase.from('partidos').insert([
      {
        idCancha: parseInt(cancha),
        fecha,
        horaInicio: horaInicio + ':00',
        horaFin: horaFin + ':00',
        idEquipo1: equipo1 ? parseInt(equipo1) : null,
        idEquipo2: equipo2 ? parseInt(equipo2) : null
      }
    ]);

    if (error) {
      console.error('Error al insertar el partido:', error.message);
      setErrorMensaje('Error al publicar el partido.');
    } else {
      alert('¡Partido publicado con éxito!');
      setFormData({
        nombreCancha: '',
        cancha: '',
        fecha: '',
        horaInicio: '',
        horaFin: '',
        equipo1: '',
        equipo2: ''
      });
    }
  };

  // Canchas filtradas por el nombre seleccionado
  const canchasFiltradas = canchas.filter(c => c.nombre === formData.nombreCancha);

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h2 className="titulo-formulario">Crear un partido</h2>

      {errorMensaje && <p style={{ color: 'red' }}>{errorMensaje}</p>}

      {/* Selección del nombre de la cancha */}
      <label>Nombre de la cancha:</label>
      <select name="nombreCancha" value={formData.nombreCancha} onChange={handleChange}>
        <option value="">Selecciona un nombre de cancha</option>
        {[...new Set(canchas.map(c => c.nombre))].map(nombre => (
          <option key={nombre} value={nombre}>{nombre}</option>
        ))}
      </select>

      {/* Selección de tipo si hay más de uno */}
      {formData.nombreCancha && (
        <>
          <label>Tipo de cancha:</label>
          <select name="cancha" value={formData.cancha} onChange={handleChange}>
            <option value="">Selecciona un tipo de cancha</option>
            {canchasFiltradas.map(cancha => (
              <option key={cancha.id_Cancha} value={cancha.id_Cancha}>
                {cancha.tipoCancha?.descripcion || 'Tipo desconocido'}
              </option>
            ))}
          </select>
        </>
      )}

      <label>Equipo 1:</label>
      <select name="equipo1" value={formData.equipo1} onChange={handleChange}>
        <option value="">Sin equipo</option>
        {equipos.map((equipo) => (
          <option key={equipo.id_Equipo} value={equipo.id_Equipo}>{equipo.nombre}</option>
        ))}
      </select>

      <label>Equipo 2:</label>
      <select name="equipo2" value={formData.equipo2} onChange={handleChange}>
        <option value="">Sin equipo</option>
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
      <button type="button" className="boton" onClick={() => navigate('/ver-partidos')}>Volver</button>
    </form>
  );
}
