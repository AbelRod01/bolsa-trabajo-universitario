import React, { useState } from "react";
import "./css/MenuEmpresa.css";
import { IconoUsuario, IconoMaleta } from "../../componentes/Iconos";
import LayoutEmpresa from "./LayoutEmpresa";
import MisOfertas from "./MisOfertas";
import PerfilEmpresa from "./PerfilEmpresa";
import EditarPerfilEmpresa from "./EditarPerfilEmpresa";
import NotificacionesEmpresa from "./NotificacionesEmpresa";
import CandidatosEmpresa from "./CandidatosEmpresa";

const MenuPrincipalEmpresa = ({ onLogout }) => {
  const [vistaActual, setVistaActual] = useState("inicio");

  // Mock datos rápidos para el dashboard
  const estadisticas = {
    vistasPerfil: 124,
    candidatosNuevos: 12,
    ofertasActivas: 3
  };

  const candidatosRecientes = [
    { id: 1, nombre: "Juan Pérez", carrera: "Ing. en Software", oferta: "Desarrollador Frontend", match: "95%", estado: "Nuevo" },
    { id: 2, nombre: "Ana Gómez", carrera: "Diseño Gráfico", oferta: "Diseñador UI/UX", match: "88%", estado: "En Revisión" },
    { id: 3, nombre: "Luis Ramírez", carrera: "Ciencia de Datos", oferta: "Analista de Datos", match: "91%", estado: "Entrevistado" },
  ];

  const ofertasActivas = [
    { id: 1, titulo: "Desarrollador Frontend Junior", aplicantes: 45, diasRestantes: 12 },
    { id: 2, titulo: "Analista de Datos", aplicantes: 28, diasRestantes: 5 },
    { id: 3, titulo: "Diseñador UI/UX", aplicantes: 15, diasRestantes: 20 },
  ];

  return (
    <LayoutEmpresa 
      onLogout={onLogout} 
      vistaActual={vistaActual} 
      onCambiarVista={setVistaActual}
    >
      {vistaActual === 'inicio' ? (
        <div className="empresa-dashboard">
          <div className="feed-header">
            <h2>Panel General</h2>
          </div>
          
          <div className="stats-grid-empresa">
            <div className="stat-card-empresa">
              <div className="stat-icon-wrapper blue">
                <IconoMaleta />
              </div>
              <div className="stat-info">
                <h3>{estadisticas.ofertasActivas}</h3>
                <span>Ofertas Activas</span>
              </div>
            </div>
            <div className="stat-card-empresa">
              <div className="stat-icon-wrapper green">
                <IconoUsuario />
              </div>
              <div className="stat-info">
                <h3>{estadisticas.candidatosNuevos}</h3>
                <span>Candidatos Nuevos</span>
              </div>
            </div>
            <div className="stat-card-empresa">
              <div className="stat-icon-wrapper purple">
                <IconoUsuario />
              </div>
              <div className="stat-info">
                <h3>{estadisticas.vistasPerfil}</h3>
                <span>Vistas al Perfil</span>
              </div>
            </div>
          </div>

          <div className="panels-grid">
            <div className="dashboard-panel">
              <div className="panel-header">
                <h3>Candidatos Recientes</h3>
                <button className="btn-link" onClick={() => setVistaActual('candidatos')}>Ver todos</button>
              </div>
              <div className="panel-list">
                {candidatosRecientes.map(c => (
                  <div key={c.id} className="candidato-item">
                    <div className="candidato-avatar">{c.nombre[0]}</div>
                    <div className="candidato-info">
                      <h4>{c.nombre}</h4>
                      <div className="candidato-meta">
                        <span>{c.carrera}</span>
                        <span className="dot">•</span>
                        <span className="oferta-tag">{c.oferta}</span>
                      </div>
                    </div>
                    <button 
                      className="btn-outline-small"
                    >
                      Revisar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="panel-header">
                <h3>Tus Ofertas Activas</h3>
                <button className="btn-link" onClick={() => setVistaActual('ofertas')}>Gestionar</button>
              </div>
              <div className="panel-list">
                {ofertasActivas.map(o => (
                  <div key={o.id} className="oferta-item-mini">
                    <div className="oferta-info-mini">
                      <h4>{o.titulo}</h4>
                      <span>Faltan {o.diasRestantes} días</span>
                    </div>
                    <div className="oferta-stats-mini">
                      <strong>{o.aplicantes}</strong>
                      <span>Aplicantes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : vistaActual === 'ofertas' ? (
        <MisOfertas />
      ) : vistaActual === 'candidatos' ? (
        <CandidatosEmpresa />
      ) : vistaActual === 'perfil' ? (
        <PerfilEmpresa onEditClick={() => setVistaActual('editar_perfil')} />
      ) : vistaActual === 'editar_perfil' ? (
        <EditarPerfilEmpresa onCancel={() => setVistaActual('perfil')} onSave={() => setVistaActual('perfil')} />
      ) : vistaActual === 'notificaciones' ? (
        <NotificacionesEmpresa />
      ) : (
        <div className="placeholder-vista">
          <h2>Vista "{vistaActual}" en construcción...</h2>
          <p>Pronto podrás gestionar tus ofertas y perfil desde aquí.</p>
          <button className="btn-guardar" style={{marginTop: "20px"}} onClick={() => setVistaActual('inicio')}>Volver al Panel</button>
        </div>
      )}
    </LayoutEmpresa>
  );
};

export default MenuPrincipalEmpresa;
