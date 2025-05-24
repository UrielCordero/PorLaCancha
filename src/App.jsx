import './App.css';
import { useState } from 'react';
import Header from './components/Header/Header';
import SideMenu from './components/SideMenu/SideMenu';
import Hero from './components/Hero/Hero';
import MonthlyTournaments from './components/MonthlyTournaments/MonthlyTournaments';
import FreePlay from './components/FreePlay/FreePlay';
import Features from './components/Features/Features';
import Growth from './components/Growth/Growth';
import Footer from './components/Footer/Footer';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Header onMenuClick={() => setMenuOpen(!menuOpen)} />
      <SideMenu menuOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <Hero />
      <MonthlyTournaments />
      <FreePlay />
      <Features />
      <Growth />
      <Footer />
    </>
  );
}

export default App;
