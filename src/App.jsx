import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Header from './componentes/Header/Header';
import MenuLateral from './componentes/MenuLateral/MenuLateral';
import VerPartido from './componentes/VerPartido/VerPartido';
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
import MisPartidos from './componentes/MisPartidos/MisPartidos';
import MiEquipo from './componentes/MiEquipo/MiEquipo';
import ErrorBoundary from './componentes/ErrorBoundary/ErrorBoundary';
import MisTorneos from './componentes/MisTorneos/MisTorneos';
import CrearEquipo from './componentes/CrearEquipo/CrearEquipo';

function AppWrapper() {
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [logueado, setLogueado] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  useEffect(() => {
    const guardado = localStorage.getItem('loggedInUser');
    if (guardado && guardado !== 'undefined') {
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

  // Determine if footer should be fixed based on current path
  const fixedFooterPaths = ['/mis-partidos', '/mis-torneos'];
  const isFooterFixed = fixedFooterPaths.includes(location.pathname);

  return (
    <>
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
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={logueado ? <HomeLoggedIn /> : <HomeLoggedOut />} />
            <Route path="/ver-partidos" element={<VerPartido />} />
            <Route path="/crear-partido" element={<CrearPartido />} />
            <Route path="/torneos" element={<Torneos />} />
            <Route path="/crear-torneo" element={<CrearTorneoForm />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/equipos" element={<Equipos />} />
            <Route path="/crear-equipo" element={<CrearEquipo />} />
            <Route path="/info-torneo/:id" element={<InfoTorneo />} />
            <Route path="/unirse-torneo/:id" element={<UnirseTorneo />} />
            <Route path="/ver-info-partido/:id" element={<VerInfoPartido />} />
            <Route path="/mis-partidos" element={<MisPartidos />} />
            <Route path="/mi-equipo" element={<MiEquipo />} />
            <Route path="/mis-torneos" element={<MisTorneos />} />
          </Routes>
        </ErrorBoundary>
      </div>

      <Footer fixed={isFooterFixed} />

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
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
