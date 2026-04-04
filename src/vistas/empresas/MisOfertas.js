import React from 'react';
import './css/VistasEmpresa.css';

const MisOfertas = () => {
  const [ofertaSeleccionada, setOfertaSeleccionada] = React.useState(null);
  const [tabActiva, setTabActiva] = React.useState('candidatos'); // 'candidatos' o 'editar'

  const misOfertasData = [
    { id: 1, titulo: "Desarrollador Frontend Junior", descripcion: "Buscamos un estudiante entusiasta con conocimientos en React y CSS.", estado: "activa", aplicantes: 45, vistas: 340, diasRestantes: 12 },
    { id: 2, titulo: "Analista de Datos", descripcion: "Perfil analítico para manejo de bases de datos SQL y dashboards en PowerBI.", estado: "activa", aplicantes: 28, vistas: 210, diasRestantes: 5 },
    { id: 3, titulo: "Diseñador UI/UX", descripcion: "Prácticas profesionales en nuestro departamento de producto y diseño web.", estado: "activa", aplicantes: 15, vistas: 98, diasRestantes: 20 },
    { id: 4, titulo: "Ingeniero de DevOps", descripcion: "Experiencia básica en contenedores Docker y flujos CI/CD.", estado: "cerrada", aplicantes: 60, vistas: 500, diasRestantes: 0 },
  ];

  const [creandoNueva, setCreandoNueva] = React.useState(false);

  const handleSeleccionarOferta = (oferta, tab) => {
    setOfertaSeleccionada(oferta);
    setTabActiva(tab);
    setCreandoNueva(false);
  };

  const handleVolver = () => {
    setOfertaSeleccionada(null);
    setCreandoNueva(false);
  };

  if (creandoNueva) {
    return (
      <div className="mis-ofertas-container">
        <div className="detalle-oferta-header">
          <button className="btn-volver" onClick={handleVolver}>← Volver</button>
          <h2>Crear Nueva Oferta</h2>
        </div>

        <div className="editar-oferta-form" style={{maxWidth: "800px", margin: "0 auto"}}>
          <form className="form-oferta">
            <div className="form-group">
              <label>Título de la Oferta</label>
              <input type="text" placeholder="Ej: Desarrollador Backend Node.js" />
            </div>
            <div className="form-row" style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
              <div className="form-group">
                <label>Categoría</label>
                <select>
                  <option>Tecnología</option>
                  <option>Diseño</option>
                  <option>Administración</option>
                  <option>Marketing</option>
                </select>
              </div>
              <div className="form-group">
                <label>Modalidad</label>
                <select>
                  <option>Remoto</option>
                  <option>Presencial</option>
                  <option>Híbrido</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Descripción del Puesto</label>
              <textarea placeholder="Describe las responsabilidades, requisitos y beneficios..."></textarea>
            </div>
            <div className="form-group">
              <label>Requisitos Clave</label>
              <textarea placeholder="Ej: React, Node.js, SQL..."></textarea>
            </div>
            <div style={{display: "flex", gap: "12px", marginTop: "10px"}}>
              <button type="button" className="btn-guardar-cambios" style={{flex: 1, backgroundColor: "#2563eb"}} onClick={handleVolver}>Publicar Oferta</button>
              <button type="button" className="btn-volver" style={{flex: 1, border: "1px solid #e2e8f0"}} onClick={handleVolver}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  if (ofertaSeleccionada) {
    return (
      <div className="mis-ofertas-container">
        <div className="detalle-oferta-header">
          <button className="btn-volver" onClick={handleVolver}>← Volver</button>
          <h2>{ofertaSeleccionada.titulo}</h2>
        </div>

        <div className="oferta-tabs">
          <button 
            className={`tab-btn ${tabActiva === 'candidatos' ? 'active' : ''}`}
            onClick={() => setTabActiva('candidatos')}
          >
            Candidatos ({ofertaSeleccionada.aplicantes})
          </button>
          <button 
            className={`tab-btn ${tabActiva === 'editar' ? 'active' : ''}`}
            onClick={() => setTabActiva('editar')}
          >
            Editar Oferta
          </button>
        </div>

        <div className="tab-content">
          {tabActiva === 'candidatos' ? (
            <div className="candidatos-list">
              <div className="candidatos-grid-completo">
                {[
                  { id: 1, nombre: "Juan Daniel Pérez", carrera: "Ing. Software", ciclo: "7mo Ciclo", fecha: "Hace 2 horas", iniciales: "JP" },
                  { id: 2, nombre: "María Garcia", carrera: "Ciencia de Datos", ciclo: "9no Ciclo", fecha: "Hace 5 horas", iniciales: "MG" },
                  { id: 3, nombre: "Carlos Rodriguez", carrera: "Diseño Gráfico", ciclo: "4to Ciclo", fecha: "Ayer", iniciales: "CR" },
                  { id: 4, nombre: "Ana Martínez", carrera: "Ing. Sistemas", ciclo: "8vo Ciclo", fecha: "Ayer", iniciales: "AM" }
                ].map(candidato => (
                  <div key={candidato.id} className="candidato-card-dashboard">
                    <div className="candidato-card-header">
                      <div className="candidato-avatar-large">{candidato.iniciales}</div>
                      <div className="candidato-main-info">
                        <h4>{candidato.nombre}</h4>
                        <p>{candidato.carrera} • {candidato.ciclo}</p>
                      </div>
                    </div>
                    
                    <div className="candidato-card-body">
                      <div className="info-item">
                        <span className="label">Estado:</span>
                        <span className="value">Pendiente</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Aplicó:</span>
                        <span className="value">{candidato.fecha}</span>
                      </div>
                    </div>

                    <div className="candidato-card-footer">
                      <button className="btn-perfil-full">Ver Perfil Completo</button>
                      <button className="btn-whatsapp-mock">Contactar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="editar-oferta-form">
              <form className="form-oferta">
                <div className="form-group">
                  <label>Título de la Oferta</label>
                  <input type="text" defaultValue={ofertaSeleccionada.titulo} />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea defaultValue={ofertaSeleccionada.descripcion}></textarea>
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select defaultValue={ofertaSeleccionada.estado}>
                    <option value="activa">Activa</option>
                    <option value="cerrada">Cerrada</option>
                  </select>
                </div>
                <button type="button" className="btn-guardar-cambios">Guardar Cambios</button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mis-ofertas-container">
      <div className="mis-ofertas-header">
        <h2>Mis Ofertas</h2>
        <button className="btn-crear-oferta" onClick={() => setCreandoNueva(true)}>+ Crear Nueva Oferta</button>
      </div>

      <div className="ofertas-empresa-grid">
        {misOfertasData.map(oferta => (
          <div key={oferta.id} className="oferta-empresa-card">
            <span className={`oferta-empresa-badge ${oferta.estado}`}>
              {oferta.estado === "activa" ? "🟢 Activa" : "⚫ Cerrada"}
            </span>
            <h3>{oferta.titulo}</h3>
            <p>{oferta.descripcion}</p>
            
            <div className="oferta-empresa-stats">
              <div className="oferta-empresa-stat">
                <strong>{oferta.aplicantes}</strong>
                <span>Candidatos</span>
              </div>
              <div className="oferta-empresa-stat">
                <strong>{oferta.vistas}</strong>
                <span>Vistas</span>
              </div>
              <div className="oferta-empresa-stat">
                <strong>{oferta.diasRestantes}</strong>
                <span>Días Rest.</span>
              </div>
            </div>

            <div className="oferta-empresa-actions">
              <button 
                className="btn-oferta-outline"
                onClick={() => handleSeleccionarOferta(oferta, 'candidatos')}
              >
                Candidatos
              </button>
              <button 
                className="btn-oferta-outline"
                onClick={() => handleSeleccionarOferta(oferta, 'editar')}
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MisOfertas;
