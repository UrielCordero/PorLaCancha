import './App.css';

function App() {
  return (
    <div>
      <header className="header">
        <nav className="navbar">
          <div className="logo">
            <img src="/src/assets/Logo.png" alt="PorLaCancha Logo" style={{ height: '70px' }} />
          </div>
          <div className="nav-links">
            <img src="/src/assets/Menu.png" alt="Menu Icon" style={{ height: '60px', cursor: 'pointer' }} />
          </div>
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
                <option>Almagro</option>
                <option>Caballito</option>
                <option>Marapode</option>
                <option>MarasiLandia</option>
                <option>Lanús</option>
                <option>La Fortaleza</option>
              </select>
              <select aria-label="Fecha">
                <option>25/5</option>
                <option>26/5</option>
                <option>27/5</option>
                <option>28/5</option>
                <option>29/5</option>
              </select>
              <select aria-label="Hora">
                <option>14:00</option>
                <option>15:00</option>
                <option>16:00</option>
                <option>17:00</option>
                <option>18:00</option>
                <option>19:00</option>
                <option>20:00</option>
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
