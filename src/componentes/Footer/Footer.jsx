import React from 'react';
import './Footer.css';

function Footer({ fixed }) {
  return (
    <footer className={`footer ${fixed ? 'fixed-footer' : ''}`} id="contacto">
      <p>© 2025 PorLaCancha. Marca registrada por SASSON S.A.</p>
    </footer>
  );
}

export default Footer;
