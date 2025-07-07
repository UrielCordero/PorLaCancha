import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import './Registrarse.css';

function Registrarse({ onClose, onRegisterSuccess }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState('');
  const [nivelHabilidad, setNivelHabilidad] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }
    if (nivelHabilidad === 0) {
      setErrorMsg('Debe seleccionar un nivel de habilidad');
      return;
    }
    try {
      // Insert user data into "Usuarios" table
      const { data, error: insertError } = await supabase
        .from('Usuarios')
        .insert([
          {
            nombre,
            email,
            contrasenia: password,
            fechaNacimiento,
            genero,
            nivelHabilidad,
            fotoDePerfil: '',
          },
        ])
        .select()
        .single();
      if (insertError) {
        setErrorMsg(insertError.message);
        return;
      }
      onRegisterSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg('Error al registrar usuario');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>REGISTRARSE</h2>
        <form onSubmit={handleRegister}>
          <label>Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label>Confirmar contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <label>Fecha de nacimiento</label>
          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            required
          />
          <label>Genero</label>
          <select
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            required
          >
            <option value="">Seleccione género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
          <label>Nivel de habilidad</label>
          <select
            value={nivelHabilidad}
            onChange={(e) => setNivelHabilidad(parseInt(e.target.value))}
            required
          >
            <option value={0}>Seleccione nivel</option>
            <option value={1}>★☆☆☆☆</option>
            <option value={2}>★★☆☆☆</option>
            <option value={3}>★★★☆☆</option>
            <option value={4}>★★★★☆</option>
            <option value={5}>★★★★★</option>
          </select>
          {errorMsg && <p className="error">{errorMsg}</p>}
          <button type="submit" className="btn-register">Registrarse</button>
          <button type="button" className="btn-close" onClick={onClose}>Cerrar</button>
        </form>
      </div>
    </div>
  );
}

export default Registrarse;
