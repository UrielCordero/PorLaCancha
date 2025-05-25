import './App.css';
import { useState } from 'react';
import Header from './componentes/Header/Header';
import MenuLateral from './componentes/MenuLateral/MenuLateral';
import Heroe from './componentes/Heroe/Heroe';
import TorneosMensuales from './componentes/TorneosMensuales/TorneosMensuales';
import JuegoLibre from './componentes/JuegoLibre/JuegoLibre';
import Caracteristicas from './componentes/Caracteristicas/Caracteristicas';
import Crecimiento from './componentes/Crecimiento/Crecimiento';
import Footer from './componentes/Footer/Footer';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Header onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuLateral menuOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <Heroe />
      <TorneosMensuales />
      <JuegoLibre />
      <Caracteristicas />
      <Crecimiento />
      <Footer />
    </>
  );
}

export default App;
