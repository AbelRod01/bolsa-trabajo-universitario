import React from 'react';
import './css/PerfilEstudiante.css';

const PerfilEstudiante = ({ onEditClick }) => {
  return (
    <div className="perfil-container">
      <div className="perfil-header-card">
        <div className="perfil-avatar-grande">JP</div>
        <div className="perfil-info-principal">
          <h1>Juan Pérez</h1>
          <h2>Ingeniería en Software · 8vo Semestre</h2>
          <p className="perfil-ubicacion">📍 Ciudad de México, México</p>
        </div>
        <button className="btn-editar-perfil" onClick={onEditClick}>Editar Perfil</button>
      </div>

      <div className="perfil-grid">
        <div className="perfil-columna-principal">
          <section className="perfil-seccion">
            <h3>Sobre Mí</h3>
            <p>
              Estudiante apasionado por el desarrollo web y la creación de interfaces de usuario intuitivas. 
              Busco mi primera oportunidad profesional como desarrollador Frontend para aplicar mis 
              conocimientos en React, JavaScript y diseño CSS moderno.
            </p>
          </section>

          <section className="perfil-seccion">
            <h3>Experiencia & Proyectos Académicos</h3>
            <div className="item-experiencia">
              <div className="exp-bullet"></div>
              <div className="exp-contenido">
                <h4>Clon de E-commerce</h4>
                <span className="exp-fecha">Ene 2024 - Presente</span>
                <p>Desarrollo de una plataforma de ventas online usando React y Node.js para la clase de Ingeniería Web.</p>
              </div>
            </div>
            <div className="item-experiencia">
              <div className="exp-bullet"></div>
              <div className="exp-contenido">
                <h4>Líder de Desarrollo en Hackathon Universitario</h4>
                <span className="exp-fecha">Oct 2023</span>
                <p>Implementación de un sistema de gestión de donaciones que obtuvo el 2° lugar a nivel local.</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="perfil-columna-lateral">
          <section className="perfil-seccion">
            <h3>Habilidades Técnicas</h3>
            <div className="skills-container">
              <span className="skill-badge">JavaScript (ES6+)</span>
              <span className="skill-badge">React.js</span>
              <span className="skill-badge">HTML5 & CSS3</span>
              <span className="skill-badge">Git / GitHub</span>
              <span className="skill-badge">Figma</span>
              <span className="skill-badge">Node.js Básico</span>
            </div>
          </section>

          <section className="perfil-seccion">
            <h3>Educación</h3>
            <div className="item-educacion">
              <h4>Universidad Nacional Abierta</h4>
              <p>Ingeniería en Software</p>
              <span className="edu-fecha">2020 - 2025</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default PerfilEstudiante;
