import React from 'react';
import './css/EditarPerfilEstudiante.css';

const EditarPerfilEstudiante = ({ onCancel, onSave }) => {
  return (
    <div className="editar-perfil-container">
      <div className="editar-perfil-header">
        <h2>Editar Mi Perfil</h2>
        <div className="editar-acciones-header">
          <button className="btn-cancelar" onClick={onCancel}>Cancelar</button>
          <button className="btn-guardar" onClick={onSave}>Guardar Cambios</button>
        </div>
      </div>

      <div className="editar-perfil-form">
        <section className="form-seccion">
          <h3>Información Básica</h3>
          <div className="form-grid">
            <div className="form-grupo">
              <label>Nombre Completo</label>
              <input type="text" defaultValue="Juan Pérez" className="input-estilizado" />
            </div>
            <div className="form-grupo">
              <label>Carrera / Grado</label>
              <input type="text" defaultValue="Ingeniería en Software" className="input-estilizado" />
            </div>
            <div className="form-grupo">
              <label>Semestre Actual</label>
              <input type="text" defaultValue="8vo Semestre" className="input-estilizado" />
            </div>
            <div className="form-grupo">
              <label>Ubicación</label>
              <input type="text" defaultValue="Ciudad de México, México" className="input-estilizado" />
            </div>
          </div>
        </section>

        <section className="form-seccion">
          <h3>Sobre Mí</h3>
          <div className="form-grupo">
            <label>Descripción Personal</label>
            <textarea 
              className="input-estilizado textarea-estilizado" 
              rows="5"
              defaultValue="Estudiante apasionado por el desarrollo web y la creación de interfaces de usuario intuitivas. Busco mi primera oportunidad profesional como desarrollador Frontend para aplicar mis conocimientos en React, JavaScript y diseño CSS moderno."
            ></textarea>
          </div>
        </section>

        <section className="form-seccion">
          <h3>Habilidades</h3>
          <p className="form-ayuda">Separa las habilidades con comas.</p>
          <div className="form-grupo">
            <input 
              type="text" 
              defaultValue="JavaScript (ES6+), React.js, HTML5 & CSS3, Git / GitHub, Figma, Node.js Básico" 
              className="input-estilizado" 
            />
          </div>
        </section>

        <section className="form-seccion">
          <h3>Experiencia y Proyectos (Destacados)</h3>
          
          <div className="experiencia-editar-card">
            <h4>Proyecto Académico 1</h4>
            <div className="form-grid">
              <div className="form-grupo">
                <label>Título / Puesto</label>
                <input type="text" defaultValue="Clon de E-commerce" className="input-estilizado" />
              </div>
              <div className="form-grupo">
                <label>Periodo</label>
                <input type="text" defaultValue="Ene 2024 - Presente" className="input-estilizado" />
              </div>
            </div>
            <div className="form-grupo">
              <label>Descripción</label>
              <input type="text" defaultValue="Desarrollo de una plataforma de ventas online usando React y Node.js para la clase de Ingeniería Web." className="input-estilizado" />
            </div>
            <button className="btn-eliminar">Eliminar Experiencia</button>
          </div>

          <button className="btn-secundario">+ Añadir Otra Experiencia</button>
        </section>

        <div className="editar-acciones-footer">
          <button className="btn-cancelar" onClick={onCancel}>Cancelar</button>
          <button className="btn-guardar" onClick={onSave}>Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfilEstudiante;
