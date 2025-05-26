import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './componentes/Header/Header';
import MenuLateral from './componentes/MenuLateral/MenuLateral';
import Heroe from './componentes/Heroe/Heroe';
import TorneosMensuales from './componentes/TorneosMensuales/TorneosMensuales';
import JuegoLibre from './componentes/JuegoLibre/JuegoLibre';
import Caracteristicas from './componentes/Caracteristicas/Caracteristicas';
import Crecimiento from './componentes/Crecimiento/Crecimiento';
import Footer from './componentes/Footer/Footer';
import NuevaPagina from './componentes/NuevaPagina/NuevaPagina';
import CrearPartido from './componentes/CrearPartido/CrearPartido';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Router>
      <Header onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuLateral menuOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="content">
        <Routes>
          <Route path="/" element={
            <>
              <Heroe />
              <TorneosMensuales />
              <JuegoLibre />
              <Caracteristicas />
              <Crecimiento />
            </>
          } />
          <Route path="/nueva-pagina" element={<NuevaPagina />} />
          <Route path="/crear-partido" element={<CrearPartido />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
