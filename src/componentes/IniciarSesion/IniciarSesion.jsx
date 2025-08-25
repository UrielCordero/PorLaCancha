import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import './IniciarSesion.css';

function IniciarSesion({ onClose, onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      window.location.reload();
    } catch {
      setErrorMsg('Error al iniciar sesión');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>INICIAR SESION</h2>
        <form onSubmit={handleLogin} onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleLogin(e);
          }
        }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Contraseña</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="show-password-row">
            <input
              id="toggle-password-visibility"
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            <label htmlFor="toggle-password-visibility"> Mostrar contraseña</label>
          </div>
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
