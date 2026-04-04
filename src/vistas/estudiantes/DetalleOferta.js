import React from 'react';
import LayoutEstudiante from './LayoutEstudiante';
import { IconoMapa, IconoDolar, IconoRayo } from '../../componentes/Iconos';

const DetalleOferta = ({ oferta, onBack, onLogout }) => {
  // Animación simple de entrada
  const [cargando, setCargando] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setCargando(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!oferta) return null;

  return (
    <LayoutEstudiante onLogout={onLogout}>
      <div className={`detalle-oferta-container ${!cargando ? 'visible' : ''}`}>
        <button className="back-btn" onClick={onBack}>
          ← Volver a las ofertas
        </button>

        <div className="detalle-header">
          <div className="company-logo-large">{oferta.empresa[0]}</div>
          <div className="header-info">
            <h1>{oferta.titulo}</h1>
            <div className="header-meta">
              <span className="company-text">{oferta.empresa}</span>
              <span className="dot">•</span>
              <span className="post-date">Publicado hace 2 días</span>
            </div>
          </div>
          <div className="header-actions">
             {oferta.estaSeleccionado ? (
                <span className="match-badge-success-large">Match Confirmado</span>
             ) : (
                <button className="apply-btn-large">
                  Postularme Ahora
                </button>
             )}
          </div>
        </div>

        <div className="detalle-grid">
          <div className="detalle-main-info">
            <section className="detalle-section">
              <h3>Sobre la posición</h3>
              <p>Estamos buscando un perfil con hambre de aprender y crecer en una de las empresas con mayor proyección tecnológica del sector. Formarás parte de un equipo multidisciplinar trabajando en proyectos de alto impacto.</p>
            </section>

            <section className="detalle-section">
              <h3>Requisitos</h3>
              <ul className="detalle-list">
                <li>Estudiante de últimos semestres de Ing. en Software o similar.</li>
                <li>Conocimientos básicos en React, Node.js y bases de datos SQL.</li>
                <li>Pasión por la resolución de problemas técnicos complejos.</li>
                <li>Capacidad para trabajar en equipo y buena comunicación.</li>
              </ul>
            </section>

            <section className="detalle-section">
              <h3>¿Qué ofrecemos?</h3>
              <p>Oportunidad de crecimiento real, horario flexible para sustentar tus estudios, mentoría personalizada y un ambiente de trabajo dinámico y joven.</p>
            </section>
          </div>

          <aside className="detalle-sidebar-info">
            <div className="info-card">
              <div className="info-item">
                <IconoMapa />
                <div>
                  <span className="label">Ubicación</span>
                  <span className="value">{oferta.ubicacion}</span>
                </div>
              </div>
              <div className="info-item">
                <IconoDolar />
                <div>
                  <span className="label">Salario Sugerido</span>
                  <span className="value">{oferta.salario}</span>
                </div>
              </div>
              <div className="info-item">
                <IconoRayo />
                <div>
                  <span className="label">Modalidad</span>
                  <span className="value">{oferta.modalidad}</span>
                </div>
              </div>
            </div>

            <div className="company-side-card">
              <h4>Sobre Tech Innovators</h4>
              <p>Empresa líder en desarrollo de soluciones de software escalables para el sector financiero en toda Latinoamérica.</p>
              <button className="secondary-btn">Ver Perfil Empresa</button>
            </div>
          </aside>
        </div>
      </div>

    </LayoutEstudiante>
  );
};

export default DetalleOferta;
