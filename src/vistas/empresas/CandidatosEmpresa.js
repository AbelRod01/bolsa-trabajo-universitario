import React from 'react';
import './css/VistasEmpresa.css';

const CandidatosEmpresa = () => {
  // Mock data concatenada de aplicantes a todas las ofertas
  const todosLosCandidatos = [
    { id: 1, nombre: "Juan Daniel Pérez", carrera: "Ing. Software", ciclo: "7mo Ciclo", oferta: "Desarrollador Frontend Junior", fecha: "Hace 2 horas", iniciales: "JP" },
    { id: 2, nombre: "María Garcia", carrera: "Ciencia de Datos", ciclo: "9no Ciclo", oferta: "Analista de Datos", fecha: "Hace 5 horas", iniciales: "MG" },
    { id: 3, nombre: "Carlos Rodriguez", carrera: "Diseño Gráfico", ciclo: "4to Ciclo", oferta: "Diseñador UI/UX", fecha: "Ayer", iniciales: "CR" },
    { id: 4, nombre: "Ana Martínez", carrera: "Ing. Sistemas", ciclo: "8vo Ciclo", oferta: "Desarrollador Frontend Junior", fecha: "Ayer", iniciales: "AM" },
    { id: 5, nombre: "Roberto Gómez", carrera: "Ing. Sistemas", ciclo: "10mo Ciclo", oferta: "Ingeniero de DevOps", fecha: "Hace 2 días", iniciales: "RG" },
    { id: 6, nombre: "Lucía Fernández", carrera: "Economía", ciclo: "6to Ciclo", oferta: "Analista de Datos", fecha: "Hace 3 días", iniciales: "LF" },
  ];

  return (
    <div className="perfil-empresa-container">
      <div className="mis-ofertas-header">
        <h2>Todos los Candidatos</h2>
        <div className="filtros-candidatos">
          <select className="select-filtro">
            <option>Todas las ofertas</option>
            <option>Frontend Junior</option>
            <option>Analista de Datos</option>
          </select>
        </div>
      </div>

      <div className="candidatos-grid-completo">
        {todosLosCandidatos.map(candidato => (
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
                <span className="label">Oferta:</span>
                <span className="value">{candidato.oferta}</span>
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
  );
};

export default CandidatosEmpresa;
