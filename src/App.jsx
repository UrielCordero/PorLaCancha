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

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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
    setShowLoginModal(false);
  };

  const handleRegisterSuccess = (user) => {
    setIsLoggedIn(true);
    setShowRegisterModal(false);
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
      <MenuLateral menuOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="content">
        <Routes>
          <Route
            path="/"
            element={isLoggedIn ? <HomeLoggedIn /> : <HomeLoggedOut />}
          />
          <Route path="/nueva-pagina" element={<NuevaPagina />} />
          <Route path="/crear-partido" element={<CrearPartido />} />
          <Route path="/torneos" element={<Torneos />} />
          <Route path="/crear-torneo" element={<CrearTorneoForm />} />
        </Routes>
      </div>
      <Footer />
      {showLoginModal && (
        <IniciarSesion onClose={handleCloseModal} onLoginSuccess={handleLoginSuccess} />
      )}
      {showRegisterModal && (
        <Registrarse onClose={handleCloseModal} onRegisterSuccess={handleRegisterSuccess} />
      )}
    </Router>
  );
}

export default App;
