import './App.css';
import { useState } from 'react';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import Hero from './components/Hero';
import MonthlyTournaments from './components/MonthlyTournaments';
import FreePlay from './components/FreePlay';
import Features from './components/Features';
import Growth from './components/Growth';
import Footer from './components/Footer';

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
