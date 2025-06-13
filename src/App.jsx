import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './componentes/Header/Header';
import MenuLateral from './componentes/MenuLateral/MenuLateral';
import NuevaPagina from './componentes/NuevaPagina/NuevaPagina';
import CrearPartido from './componentes/CrearPartido/CrearPartido';
import Torneos from './componentes/Torneos/Torneos';
import CrearTorneoForm from './componentes/CrearTorneo/CrearTorneo';
import IniciarSesion from './componentes/IniciarSesion/IniciarSesion';
import Registrarse from './componentes/Registrarse/Registrarse';
import HomeLoggedOut from './componentes/Home/HomeLoggedOut';
import HomeLoggedIn from './componentes/Home/HomeLoggedIn';
import Footer from './componentes/Footer/Footer';
import Perfil from './componentes/Perfil/Perfil';
import Equipos from './componentes/Equipos/Equipos';
import InfoTorneo from './componentes/InfoTorneo/InfoTorneo';
import UnirseTorneo from './componentes/UnirseTorneo/UnirseTorneo';
import VerInfoPartido from './componentes/VerInfoPartido/VerInfoPartido';

function App() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [logueado, setLogueado] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  useEffect(() => {
    const guardado = localStorage.getItem('loggedInUser');
    if (guardado) {
      setUsuario(JSON.parse(guardado));
      setLogueado(true);
    }
  }, []);

  const abrirLogin = () => setMostrarLogin(true);
  const abrirRegistro = () => setMostrarRegistro(true);

  const loginExitoso = (user) => {
    setLogueado(true);
    setUsuario(user);
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    setMostrarLogin(false);
  };

  const registroExitoso = (user) => {
    setLogueado(true);
    setUsuario(user);
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    setMostrarRegistro(false);
  };

  const cerrarModales = () => {
    setMostrarLogin(false);
    setMostrarRegistro(false);
  };

  const cerrarSesion = () => {
    setLogueado(false);
    setUsuario(null);
    localStorage.removeItem('loggedInUser');
    setMenuAbierto(false);
  };

  return (
    <Router>
      <Header
        onMenuClick={() => setMenuAbierto(!menuAbierto)}
        isLoggedIn={logueado}
        onLoginClick={abrirLogin}
        onRegisterClick={abrirRegistro}
      />

      <MenuLateral
        menuOpen={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        user={usuario}
        onLogout={cerrarSesion}
      />

      <div className="content">
        <Routes>
          <Route path="/" element={logueado ? <HomeLoggedIn /> : <HomeLoggedOut />} />
          <Route path="/nueva-pagina" element={<NuevaPagina />} />
          <Route path="/crear-partido" element={<CrearPartido />} />
          <Route path="/torneos" element={<Torneos />} />
          <Route path="/crear-torneo" element={<CrearTorneoForm />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/equipos" element={<Equipos />} />
          <Route path="/info-torneo/:id" element={<InfoTorneo />} />
          <Route path="/unirse-torneo/:id" element={<UnirseTorneo />} />
          <Route path="/ver-info-partido/:id" element={<VerInfoPartido />} />
        </Routes>
      </div>

      <Footer />

      {mostrarLogin && (
        <IniciarSesion
          onClose={cerrarModales}
          onLoginSuccess={loginExitoso}
          onSwitchToRegister={() => {
            setMostrarLogin(false);
            setMostrarRegistro(true);
          }}
        />
      )}

      {mostrarRegistro && (
        <Registrarse
          onClose={cerrarModales}
          onRegisterSuccess={registroExitoso}
        />
      )}
    </Router>
  );
}

export default App;
