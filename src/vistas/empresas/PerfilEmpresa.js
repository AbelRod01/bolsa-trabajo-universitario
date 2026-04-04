import React from 'react';
import './css/VistasEmpresa.css';
import '../estudiantes/css/PerfilEstudiante.css';

const PerfilEmpresa = ({ onEditClick }) => {
  return (
    <div className="perfil-empresa-container">
      <div className="empresa-header-card">
        <div className="empresa-logo-grande">T</div>
        <div className="empresa-info-principal">
          <h1>Tech Innovators S.A. de C.V.</h1>
          <h2>Sector Tecnología y Desarrollo de Software</h2>
          <p className="empresa-ubicacion">📍 Ciudad de México, México · 100-500 empleados</p>
        </div>
        <button className="btn-editar-perfil" onClick={onEditClick}>Editar Perfil</button>
      </div>

      <div className="perfil-grid">
        <div className="perfil-columna-principal">
          <section className="perfil-seccion">
            <h3>Sobre Nosotros</h3>
            <p>
              En Tech Innovators, estamos creando el futuro de las aplicaciones web. Somos una startup 
              en rápido crecimiento dedicada a ofrecer soluciones digitales de clase mundial para empresas de 
              toda la región. Nos apasiona la tecnología y promover la participación de talento joven y 
              estudiantil en nuestros equipos multidisciplinarios.
            </p>
          </section>

          <section className="perfil-seccion">
            <h3>Por qué trabajar con nosotros</h3>
            <div className="item-experiencia">
              <div className="exp-bullet"></div>
              <div className="exp-contenido">
                <h4>Cultura de Innovación</h4>
                <p>Nuestros equipos están formados por gente curiosa y creativa que busca siempre aprender las últimas herramientas del mercado.</p>
              </div>
            </div>
            <div className="item-experiencia">
              <div className="exp-bullet"></div>
              <div className="exp-contenido">
                <h4>Flexibilidad</h4>
                <p>Ofrecemos múltiples esquemas que se adaptan a tus horarios universitarios. Modalidad híbrida y remoto disponible.</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="perfil-columna-lateral">
          <section className="perfil-seccion">
            <h3>Tecnologías que usamos</h3>
            <div className="skills-container">
              <span className="skill-badge">React</span>
              <span className="skill-badge">Node.js</span>
              <span className="skill-badge">Python</span>
              <span className="skill-badge">AWS</span>
              <span className="skill-badge">GraphQL</span>
              <span className="skill-badge">Tailwind CSS</span>
            </div>
          </section>

          <section className="perfil-seccion">
            <h3>Beneficios Clave</h3>
            <div className="item-educacion">
              <h4>Seguro Médico Mayores</h4>
              <p>Seguro para todos nuestros colaboradores a tiempo completo y parcial.</p>
            </div>
            <div className="item-educacion" style={{marginTop: '16px'}}>
              <h4>Bono de Estudio</h4>
              <p>Asignación trimestral para libros y plataformas educativas certificadas.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default PerfilEmpresa;
