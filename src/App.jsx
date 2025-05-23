import './App.css';
import { useState, useEffect, useRef } from 'react';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div>
      <header className="header">
        <nav className="navbar">
          <div className="logo">
            <img src="/src/assets/Logo.png" alt="PorLaCancha Logo" style={{ height: '70px' }} />
          </div>
          <div className="nav-links">
            <img
              src="/src/assets/Menu.png"
              alt="Menu Icon"
              style={{ height: '60px', cursor: 'pointer' }}
              onClick={() => setMenuOpen(!menuOpen)}
            />
          </div>
        </nav>
      </header>

      {/* Menú lateral con imagen de perfil */}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`} ref={menuRef}>
        <button className="close-button" onClick={() => setMenuOpen(false)}>×</button>
        
        {/* Imagen de perfil */}
        <div className="profile-section">
          <img src="/src/assets/ImgPerfil.png" alt="Perfil" className="profile-image" />
        </div>

        <ul>
          <li><a href="#funcionalidades" onClick={() => setMenuOpen(false)}>Partidos</a></li>
          <li><a href="#contacto" onClick={() => setMenuOpen(false)}>Torneos</a></li>
          <li><a href="#torneos" onClick={() => setMenuOpen(false)}>Equipos</a></li>
           <li><a href="#torneos" onClick={() => setMenuOpen(false)}>Historial</a></li>
            <li><a href="#torneos" onClick={() => setMenuOpen(false)}>Cerrar Sesion</a></li>
            
        </ul>
      </div>


      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>¿Tenés ganas de jugar? Nosotros te conseguimos rival y cancha.</h1>
            <p>Compite en torneos organizados o arma partidos con jugadores cerca tuyo.</p>
            <div className="search-bar-container">
  <div className="search-option">
    <i className="fa fa-map-marker-alt"></i>
    <select>
      <option>Buscar zona</option>
      <option>Lanus</option>
      <option>Almagro</option>
      <option>Caballito</option>
      
    </select>
  </div>
  <div className="search-option">
    <i className="fa fa-calendar-alt"></i>
    <select>
      <option> Hoy 2/5</option>
      <option>3/5</option>
      <option>4/5</option>
      <option>5/5</option>
    </select>
  </div>
  <div className="search-option">
    <i className="fa fa-clock"></i>
    <select>
      <option>14:00</option>
      <option>15:00</option>
      <option>16:00</option>
      <option>17:00</option>
    </select>
  </div>
  <button className="search-button">Buscar partido</button>
</div>

          </div>
        </div>
      </section>

      <section className="monthly-tournaments">
        <div className="tournaments-content">
          <h2>Competí con tu grupo de amigos en torneos mensuales con recompensa.</h2>
          <p>Armá tu equipo, enfrentá a rivales de tu zona y participá por premios todos los meses.</p>
          <button className="btn-secondary">Ver torneos disponibles!</button>
        </div>
      </section>

      <section className="free-play">
        <h2>¡Juega de forma segura y gratuita!</h2>
      </section>

      <section className="features" id="funcionalidades">
        <h2>¿Qué podés hacer en Por La Cancha?</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <img src="/src/assets/Ej1.png" alt="Unite a partidos" className="feature-icon" />
            <h3>Unite a partidos</h3>
            <p>Unite a partidos abiertos o encontrá equipos para jugar contra tu equipo.</p>
          </div>
          <div className="feature-card">
            <img src="/src/assets/Ej2.png" alt="Reservá tu cancha" className="feature-icon" />
            <h3>Reserva tu canchas</h3>
            <p>Alquilá canchas en diferentes ubicaciones y horarios en minutos.</p>
          </div>
          <div className="feature-card">
            <img src="/src/assets/Ej3.png" alt="Invitá a tus amigos" className="feature-icon" />
            <h3>Invita a tus amigos</h3>
            <p>Sumá amigos a tus partidos y armá tu equipo ideal fácilmente.</p>
          </div>
          <div className="feature-card">
            <img src="/src/assets/Ej4.png" alt="Gestioná tu equipo" className="feature-icon" />
            <h3>Gestiona tu equipo</h3>
            <p>Controlá tus partidos, estadísticas y el rendimiento de tu equipo.</p>
          </div>
        </div>
      </section>

      <section className="growth">
        <div className="growth-wrapper">
          <img
            src="/src/assets/mapaArgEjemplo.png"
            alt="Mapa Argentina Ejemplo"
            className="growth-image"
          />
          <div className="growth-content">
            <h2>Estamos creciendo.</h2>
            <p>Sumate a la comunidad de jugadores amateur más grande.</p>
            <blockquote>
              <span className="quote-left">"Me ayudó a organizar y encontrar rivales para mi equipo"</span>
              <span className="quote-center">"Organizar partidos nunca fue tan simple, en minutos ya tengo rival y cancha confirmada."</span>
              <span className="quote-right">"Encontré partido en 10 minutos, increíble!"</span>
            </blockquote>
          </div>
        </div>
      </section>

      <footer className="footer" id="contacto">
        <p>© 2025 PorLaCancha. Marca registrada por SASSON S.A.</p>
      </footer>
    </div>
  );
}

export default App;
