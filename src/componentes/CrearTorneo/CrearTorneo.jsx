import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './CrearTorneo.css';

export default function CrearTorneo() {
  const [todasLasCanchas, setTodasLasCanchas] = useState([]);
  const [nombresCanchasUnicos, setNombresCanchasUnicos] = useState([]);
  const [tiposCancha, setTiposCancha] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombreTorneo: '',
    fotoTorneo: '',
    nombreCancha: '',
    Id_Cancha: '',
    fechaInicio: '',
    fechaFin: '',
    cantEquipos: 4,
    id_Tipo: '',
    premio: '',
    precioPersona: '',
  });

  useEffect(() => {
    const fetchCanchas = async () => {
      const { data, error } = await supabase.from('Cancha').select('*');
      if (!error && data) {
        setTodasLasCanchas(data);
        const nombresUnicos = [...new Set(data.map(c => c.nombre))];
        setNombresCanchasUnicos(nombresUnicos);
      }
    };
    fetchCanchas();
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMensaje('');

    if (name === 'nombreCancha') {
      const canchasConEseNombre = todasLasCanchas.filter(c => c.nombre === value);
      if (canchasConEseNombre.length > 0) {
        const tiposUnicos = [...new Set(canchasConEseNombre.map(c => c.id_Tipo))];
        const { data: tiposData, error } = await supabase
          .from('tipoCancha')
          .select('*')
          .in('id_Tipo', tiposUnicos);

        if (!error && tiposData) {
          setTiposCancha(tiposData);
        }

        setFormData(prev => ({
          ...prev,
          Id_Cancha: canchasConEseNombre[0].id_Cancha, // ID real
        }));
      } else {
        setTiposCancha([]);
        setFormData(prev => ({
          ...prev,
          Id_Cancha: '',
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      nombreTorneo, fotoTorneo, Id_Cancha, fechaInicio, fechaFin,
      cantEquipos, id_Tipo, premio, precioPersona
    } = formData;

    if (!nombreTorneo || !fotoTorneo || !Id_Cancha || !fechaInicio || !fechaFin ||
        !cantEquipos || !id_Tipo || !premio || !precioPersona) {
      setMensaje('⚠️ Todos los campos son obligatorios.');
      return;
    }

    if (parseInt(cantEquipos) < 4) {
      setMensaje('⚠️ La cantidad mínima de equipos es 4.');
      return;
    }

    if (fechaFin < fechaInicio) {
      setMensaje('⚠️ La fecha de finalización no puede ser anterior a la de inicio.');
      return;
    }

    const { error } = await supabase.from('torneo').insert([{
      nombreTorneo,
      fotoTorneo,
      Id_Cancha: parseInt(Id_Cancha),
      fechaInicio,
      fechaFin,
      cantEquipos: parseInt(cantEquipos),
      id_Tipo: parseInt(id_Tipo),
      premio: parseFloat(premio),
      precioPersona: parseFloat(precioPersona)
    }]);

    if (error) {
      setMensaje('❌ Error al publicar el torneo: ' + error.message);
    } else {
      setMensaje('✅ ¡Torneo publicado con éxito!');
      setFormData({
        nombreTorneo: '',
        fotoTorneo: '',
        nombreCancha: '',
        Id_Cancha: '',
        fechaInicio: '',
        fechaFin: '',
        cantEquipos: 4,
        id_Tipo: '',
        premio: '',
        precioPersona: '',
      });
      setTiposCancha([]);
    }
  };

  return (
    <div className="form-container">
      <form className="formulario" onSubmit={handleSubmit}>
        <h2 className="titulo-formulario">Crear un torneo</h2>
        {mensaje && (
          <p className="mensaje" style={{ color: mensaje.startsWith('✅') ? 'green' : 'red' }}>
            {mensaje}
          </p>
        )}

        <label>Nombre del torneo:</label>
        <input
          type="text"
          name="nombreTorneo"
          value={formData.nombreTorneo}
          onChange={handleChange}
        />

        <label>URL de imagen del torneo:</label>
        <input
          type="text"
          name="fotoTorneo"
          value={formData.fotoTorneo}
          onChange={handleChange}
        />

        <label>Cancha:</label>
        <select name="nombreCancha" value={formData.nombreCancha} onChange={handleChange}>
          <option value="">Selecciona una cancha</option>
          {nombresCanchasUnicos.map((nombre, index) => (
            <option key={index} value={nombre}>
              {nombre}
            </option>
          ))}
        </select>

        <label>Tipo de torneo:</label>
        <select
          name="id_Tipo"
          value={formData.id_Tipo}
          onChange={handleChange}
          disabled={tiposCancha.length === 0}
        >
          <option value="">Selecciona tipo</option>
          {tiposCancha.map((tipo) => (
            <option key={tipo.id_Tipo} value={tipo.id_Tipo}>
              {tipo.descripcion}
            </option>
          ))}
        </select>

        <label>Fecha de inicio:</label>
        <input
          type="date"
          name="fechaInicio"
          value={formData.fechaInicio}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
        />

        <label>Fecha de finalización:</label>
        <input
          type="date"
          name="fechaFin"
          value={formData.fechaFin}
          onChange={handleChange}
          min={formData.fechaInicio || new Date().toISOString().split('T')[0]}
        />

        <label>Cantidad de equipos:</label>
        <input
          type="number"
          name="cantEquipos"
          value={formData.cantEquipos}
          onChange={handleChange}
          min="4"
        />

        <label>Premio:</label>
        <input
          type="text"
          name="premio"
          value={formData.premio}
          onChange={handleChange}
        />

        <label>Precio por persona ($):</label>
        <input
          type="number"
          name="precioPersona"
          value={formData.precioPersona}
          onChange={handleChange}
          step="0.01"
        />

        <button type="submit" className="boton">Publicar el torneo</button>
        <button type="button" className="boton" onClick={() => navigate('/torneos')}>Volver</button>
      </form>
    </div>
  );
}
