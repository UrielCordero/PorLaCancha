import './App.css';

function App() {
  return (
    <div>
      <header className="header">
        <nav className="navbar">
          <div className="logo">PorLaCancha</div>
          <ul className="nav-links">
            <li><a href="#torneos">Torneos</a></li>
            <li><a href="#funcionalidades">Funcionalidades</a></li>
            <li><a href="#testimonios">Testimonios</a></li>
            <li><a href="#contacto">Contacto</a></li>
          </ul>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>¿Tenés ganas de jugar? Nosotros te conseguimos rival y cancha.</h1>
            <p>Compite en torneos organizados o arma partidos con jugadores cerca tuyo.</p>
            <div className="search-bar">
              <select aria-label="Buscar zona">
                <option>Buscar zona</option>
                <option>Zona 1</option>
                <option>Zona 2</option>
              </select>
              <select aria-label="Fecha">
                <option>Ma&ntilde;ana 25</option>
                <option>Hoy 24</option>
              </select>
              <select aria-label="Hora">
                <option>14:30</option>
                <option>15:00</option>
              </select>
              <button className="btn-primary">Buscar partido</button>
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
          <div className="card">
            <h3>Unite a partidos</h3>
            <p>Unite a partidos abiertos en tu zona y jugá cuando quieras.</p>
          </div>
          <div className="card">
            <h3>Reservá tu cancha</h3>
            <p>Alquilá canchas disponibles y jugá sin complicaciones.</p>
          </div>
          <div className="card">
            <h3>Invitá a tus amigos</h3>
            <p>Sumá amigos a tu partido y organizá encuentros fácilmente.</p>
          </div>
          <div className="card">
            <h3>Gestioná tu equipo</h3>
            <p>Organizá horarios, votá figuras y registrá estadísticas.</p>
          </div>
        </div>
      </section>

      <section className="growth">
        <div className="growth-content">
          <h2>Estamos creciendo.</h2>
          <p>Sumate a la comunidad de jugadores amateur más grande.</p>
          <blockquote>
            <p>"Me ayudó a organizar y encontrar rivales para mi equipo"</p>
            <p>"Organizar partidos nunca fue tan simple, en minutos ya tengo rival y cancha confirmada."</p>
            <p>"Encontré partido en 10 minutos, increíble!"</p>
          </blockquote>
        </div>
      </section>

      <footer className="footer" id="contacto">
        <p>© 2025 PorLaCancha. Marca registrada por Tomás Alan Sosaín Delmastro.</p>
      </footer>
    </div>
  );
}

export default App;
