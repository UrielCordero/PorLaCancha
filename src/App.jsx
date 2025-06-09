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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Load login state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // For debugging, log the login state
  useEffect(() => {
    console.log('isLoggedIn:', isLoggedIn);
  }, [isLoggedIn]);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleRegisterClick = () => {
    setShowRegisterModal(true);
  };

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setLoggedInUser(user);
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    setShowLoginModal(false);
    // Redirect to home logged-in page after login
    window.history.pushState({}, '', '/');
  };

  const handleRegisterSuccess = (user) => {
    setIsLoggedIn(true);
    setLoggedInUser(user);
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    setShowRegisterModal(false);
    // Redirect to home logged-in page after registration
    window.history.pushState({}, '', '/');
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  return (
    <Router>
      <Header
        onMenuClick={() => setMenuOpen(!menuOpen)}
        isLoggedIn={isLoggedIn}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
      />
      <MenuLateral menuOpen={menuOpen} onClose={() => setMenuOpen(false)} user={loggedInUser} onLogout={() => {
        setIsLoggedIn(false);
        setLoggedInUser(null);
        localStorage.removeItem('loggedInUser');
        setMenuOpen(false);
        window.history.pushState({}, '', '/');
      }} />
      <div className="content">
        <Routes>
          <Route
            path="/"
            element={isLoggedIn ? <HomeLoggedIn /> : <HomeLoggedOut isLoggedIn={isLoggedIn} />}
          />
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
    {showLoginModal && (
      <IniciarSesion
        onClose={handleCloseModal}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
    )}
    {showRegisterModal && (
      <Registrarse onClose={handleCloseModal} onRegisterSuccess={handleRegisterSuccess} />
    )}
  </Router>
);
}

export default App;
