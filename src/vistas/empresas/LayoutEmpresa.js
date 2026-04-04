import React, { useState } from 'react';
import { 
  IconoInicio, 
  IconoUsuario, 
  IconoSalir,
  IconoRayo,
  IconoBuscar,
  IconoCampana,
  IconoMaleta
} from '../../componentes/Iconos';
import './css/MenuEmpresa.css';

const LayoutEmpresa = ({ children, onLogout, vistaActual = 'inicio', onCambiarVista = () => {}, empresa = { nombre: "Tech Innovators", sector: "Tecnología" } }) => {
  const [mostrarNotis, setMostrarNotis] = useState(false);

  return (
    <div className="dashboard-container" onClick={() => mostrarNotis && setMostrarNotis(false)}>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <IconoRayo />
          <span>UniJob Empresa</span>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${vistaActual === 'inicio' ? 'active' : ''}`}
            onClick={() => onCambiarVista('inicio')}
          >
            <IconoInicio />
            <span>Panel General</span>
          </button>
          <button 
            className={`nav-item ${vistaActual === 'ofertas' ? 'active' : ''}`}
            onClick={() => onCambiarVista('ofertas')}
          >
            <IconoMaleta />
            <span>Mis Ofertas</span>
          </button>
          <button 
            className={`nav-item ${vistaActual === 'perfil' ? 'active' : ''}`}
            onClick={() => onCambiarVista('perfil')}
          >
            <IconoUsuario />
            <span>Perfil Empresa</span>
          </button>
        </nav>
        <button className="logout-btn" onClick={onLogout}>
          <IconoSalir />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="search-container">
            <IconoBuscar />
            <input type="text" placeholder="Buscar candidatos, perfiles o habilidades..." />
          </div>
          <div className="top-bar-actions">
            <div className="user-profile-summary">
              <div className="user-info">
                <span className="user-name">{empresa.nombre}</span>
                <span className="user-carrera">{empresa.sector}</span>
              </div>
              <div className="user-avatar empresa-avatar">
                {empresa.nombre[0]}
              </div>
            </div>

            <div className="notification-wrapper">
              <button 
                className={`action-btn notification-btn ${mostrarNotis ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setMostrarNotis(!mostrarNotis);
                }}
              >
                <IconoCampana />
                <span className="dot"></span>
              </button>
              
              {mostrarNotis && (
                <div className="notifications-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="dropdown-header">
                    <h3>Notificaciones de Empresa</h3>
                    <button className="clear-all">Marcar leídas</button>
                  </div>
                  <div className="dropdown-content">
                    <div className="notification-item match">
                      <p><strong>Juan Pérez</strong> aplicó a "Desarrollador Frontend Junior".</p>
                      <span className="noti-time">Hace 15m</span>
                    </div>
                    <div className="notification-item estado">
                      <p>Tu oferta "Analista de Datos" ha alcanzado 50 vistas.</p>
                      <span className="noti-time">Hace 2h</span>
                    </div>
                  </div>
                  <button className="view-all-notis" onClick={() => {
                    onCambiarVista('notificaciones');
                    setMostrarNotis(false);
                  }}>Ver todas las notificaciones</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="feed-layout">
          <div className="feed-main">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LayoutEmpresa;
