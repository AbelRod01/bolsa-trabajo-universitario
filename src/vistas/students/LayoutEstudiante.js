import React, { useState } from 'react';
import { 
  IconoInicio, 
  IconoUsuario, 
  IconoSalir,
  IconoRayo,
  IconoBuscar,
  IconoCampana
} from '../../componentes/Iconos';

const LayoutEstudiante = ({ children, onLogout, vistaActual = 'inicio', onCambiarVista = () => {}, usuario }) => {
  const [mostrarNotis, setMostrarNotis] = useState(false);

  // Valores por defecto y formateo
  const nombreEstudiante = usuario?.nombre 
    ? `${usuario.nombre} ${usuario.apellido || ''}` 
    : "Estudiante";
    
  const iniciales = usuario?.nombre 
    ? `${usuario.nombre[0]}${usuario.apellido?.[0] || ''}`.toUpperCase() 
    : "U";

  return (
    <div className="dashboard-container" onClick={() => mostrarNotis && setMostrarNotis(false)}>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <IconoRayo />
          <span>UniJob</span>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${vistaActual === 'inicio' ? 'active' : ''}`}
            onClick={() => onCambiarVista('inicio')}
          >
            <IconoInicio />
            <span>Inicio</span>
          </button>
          <button 
            className={`nav-item ${vistaActual === 'perfil' ? 'active' : ''}`}
            onClick={() => onCambiarVista('perfil')}
          >
            <IconoUsuario />
            <span>Mi Perfil</span>
          </button>
        </nav>
        <button className="logout-btn" onClick={onLogout}>
          <IconoSalir />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-actions">
            <div className="user-profile-summary">
              <div className="user-info">
                <span className="user-name">{nombreEstudiante}</span>
                <span className="user-carrera">{usuario?.carrera || "Estudiante Universidad"}</span>
              </div>
              <div className="user-avatar">
                {iniciales}
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
                    <h3>Notificaciones Recientes</h3>
                    <button className="clear-all">Marcar leídas</button>
                  </div>
                  <div className="dropdown-content">
                    <div className="notification-item match">
                      <p>¡Bienvenido a <strong>UniJob</strong>!</p>
                      <span className="noti-time">Ahora</span>
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

export default LayoutEstudiante;
