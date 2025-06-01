import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import './IniciarSesion.css';

function IniciarSesion({ onClose, onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('email', email)
        .eq('contrasenia', password)
        .single();

      if (error || !data) {
        setErrorMsg('Email o contraseña incorrectos');
        return;
      }

      onLoginSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg('Error al iniciar sesión');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>INICIAR SESION</h2>
        <form onSubmit={handleLogin}>
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
          {/* Removed Olvide mi contraseña link */}
          {errorMsg && <p className="error">{errorMsg}</p>}
          <p>¿No tienes cuenta? <button className="link-button" onClick={() => { onClose(); onSwitchToRegister(); }}>Registrate.</button></p>
          <button type="submit" className="btn-login">Iniciar sesion</button>
          <button type="button" className="btn-close" onClick={onClose}>Cerrar</button>
        </form>
      </div>
    </div>
  );
}

export default IniciarSesion;
