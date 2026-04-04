import React from 'react';
import '../estudiantes/css/EditarPerfilEstudiante.css';

const EditarPerfilEmpresa = ({ onCancel, onSave }) => {
  return (
    <div className="editar-perfil-container">
      <div className="editar-perfil-header">
        <h2>Editar Perfil de Empresa</h2>
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
              <label>Nombre de la Empresa</label>
              <input type="text" defaultValue="Tech Innovators S.A. de C.V." className="input-estilizado" />
            </div>
            <div className="form-grupo">
              <label>Sector / Industria</label>
              <input type="text" defaultValue="Tecnología y Desarrollo de Software" className="input-estilizado" />
            </div>
            <div className="form-grupo">
              <label>Tamaño de Empresa</label>
              <select className="input-estilizado">
                <option value="1-50">1 a 50 empleados</option>
                <option value="50-200">50 a 200 empleados</option>
                <option value="200-500" selected>200 a 500 empleados</option>
                <option value="500+">Más de 500 empleados</option>
              </select>
            </div>
            <div className="form-grupo">
              <label>Ubicación Central</label>
              <input type="text" defaultValue="Ciudad de México, México" className="input-estilizado" />
            </div>
          </div>
        </section>

        <section className="form-seccion">
          <h3>Sobre Nosotros</h3>
          <div className="form-grupo">
            <label>Descripción de la Empresa</label>
            <textarea 
              className="input-estilizado textarea-estilizado" 
              rows="5"
              defaultValue="En Tech Innovators, estamos creando el futuro de las aplicaciones web. Somos una startup en rápido crecimiento dedicada a ofrecer soluciones digitales de clase mundial para empresas de toda la región."
            ></textarea>
          </div>
        </section>

        <section className="form-seccion">
          <h3>Tecnologías y Entorno</h3>
          <p className="form-ayuda">Separa las tecnologías con comas. Ayuda a los estudiantes a saber qué se usa internamente.</p>
          <div className="form-grupo">
            <input 
              type="text" 
              defaultValue="React, Node.js, Python, AWS, GraphQL, Tailwind CSS" 
              className="input-estilizado" 
            />
          </div>
        </section>

        <section className="form-seccion">
          <h3>Beneficios Clave</h3>
          
          <div className="experiencia-editar-card">
            <h4>Beneficio 1</h4>
            <div className="form-grupo">
              <label>Título del Beneficio</label>
              <input type="text" defaultValue="Seguro Médico Mayores" className="input-estilizado" />
            </div>
            <div className="form-grupo">
              <label>Descripción</label>
              <input type="text" defaultValue="Seguro para todos nuestros colaboradores a tiempo completo y parcial." className="input-estilizado" />
            </div>
            <button className="btn-eliminar">Eliminar Beneficio</button>
          </div>

          <button className="btn-secundario">+ Añadir Otro Beneficio</button>
        </section>

        <div className="editar-acciones-footer">
          <button className="btn-cancelar" onClick={onCancel}>Cancelar</button>
          <button className="btn-guardar" onClick={onSave}>Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfilEmpresa;
