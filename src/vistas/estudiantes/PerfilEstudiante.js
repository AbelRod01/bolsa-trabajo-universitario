/**
 * PERFIL ESTUDIANTE (PerfilEstudiante.js)
 * ─────────────────────────────────────────────────────
 * Vista de solo lectura del perfil profesional del alumno.
 * Muestra toda la información que las empresas verán del candidato:
 *   - Nombre, carrera, universidad
 *   - Descripción personal ("Sobre Mí")
 *   - Experiencia y proyectos
 *   - Habilidades técnicas (como chips/badges)
 *   - Enlace al CV en PDF
 *
 * Nota: Este componente NO edita datos. Para editar, se usa EditarPerfilEstudiante.js
 */
import React from 'react';
import './css/PerfilEstudiante.css';

const PerfilEstudiante = ({ usuario, onEditClick }) => {
  // Manejo de valores por defecto si el usuario no tiene datos completos aún
  const nombreMostrado = (usuario?.nombre && usuario?.apellido) 
    ? `${usuario.nombre} ${usuario.apellido}` 
    : (usuario?.nombre || "Usuario");
    
  // Las iniciales se usan para el avatar grande del perfil
  const iniciales = usuario?.nombre 
    ? `${usuario.nombre[0]}${usuario.apellido?.[0] || ''}`.toUpperCase() 
    : "U";

  const carreraMostrada = usuario?.carrera || "Carrera no especificada";

  return (
    <div className="perfil-container">
      
      {/* ── TARJETA DE CABECERA DEL PERFIL ── */}
      {/* Contiene el avatar, nombre principal, carrera y los botones de acción */}
      <div className="perfil-header-card">
        <div className="perfil-avatar-grande">{iniciales}</div>
        <div className="perfil-info-principal">
          <h1>{nombreMostrado}</h1>
          <h2>{carreraMostrada}</h2>
          <p className="perfil-ubicacion">📍 {usuario?.universidad || "Universidad no especificada"}</p>
        </div>
        <div className="perfil-header-acciones">
            {/* Botón para ir al formulario de edición */}
            <button className="btn-editar-perfil" onClick={onEditClick}>Editar Perfil</button>
            {/* El botón de CV solo aparece si el alumno ha subido un archivo */}
            {usuario?.cv_url && (
                <a href={usuario.cv_url} target="_blank" rel="noopener noreferrer" className="btn-cv-perfil">
                   📄 Ver Currículum
                </a>
            )}
        </div>
      </div>

      {/* ── CUADRÍCULA DE INFORMACIÓN DETALLADA ── */}
      <div className="perfil-grid">
        
        {/* Columna izquierda: Sobre Mí y Experiencia */}
        <div className="perfil-columna-principal">
          <section className="perfil-seccion">
            <h3>Sobre Mí</h3>
            <p>
              {usuario?.descripcion || "Aún no has agregado una descripción a tu perfil."}
            </p>
          </section>

          <section className="perfil-seccion">
            <h3>Experiencia & Proyectos</h3>
            <div className="item-experiencia">
              {usuario?.proyectos ? (
                  // whiteSpace: pre-wrap respeta los saltos de línea que el usuario escribió
                  <p style={{whiteSpace: 'pre-wrap'}}>{usuario.proyectos}</p>
              ) : (
                  <p>Completa tu perfil para que las empresas puedan ver tus proyectos y experiencia académica.</p>
              )}
            </div>
          </section>
        </div>

        {/* Columna derecha/lateral: Habilidades y Formación */}
        <aside className="perfil-columna-lateral">
          <section className="perfil-seccion">
            <h3>Habilidades Técnicas</h3>
            <div className="skills-container">
              {usuario?.habilidades ? (
                // Las habilidades se guardan como texto separado por comas (ej: "React, SQL, Excel")
                // Aquí las convertimos en chips visuales individuales
                usuario.habilidades.split(',').map((skill, index) => (
                  <span key={index} className="skill-badge">{skill.trim()}</span>
                ))
              ) : (
                <p style={{ fontSize: '0.9rem', color: '#666' }}>No hay habilidades registradas.</p>
              )}
            </div>
          </section>

          {/* Datos académicos del alumno */}
          <section className="perfil-seccion">
            <h3>Educación</h3>
            <div className="item-educacion">
              <h4>{usuario?.universidad || "Universidad no especificada"}</h4>
              <p>{carreraMostrada}</p>
              <span className="edu-fecha">{usuario?.periodo_educacion || "Periodo no especificado"}</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default PerfilEstudiante;
