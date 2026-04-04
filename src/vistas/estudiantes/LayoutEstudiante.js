import React, { useState } from 'react';
import { 
  IconoInicio, 
  IconoUsuario, 
  IconoSalir,
  IconoRayo,
  IconoBuscar,
  IconoCampana
} from '../../componentes/Iconos';

const LayoutEstudiante = ({ children, onLogout, vistaActual = 'inicio', onCambiarVista = () => {}, usuario = { nombre: "Juan Pérez", carrera: "Ing. en software" } }) => {
  const [mostrarNotis, setMostrarNotis] = useState(false);

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
          <div className="search-container">
            <IconoBuscar />
            <input type="text" placeholder="Buscar empleo, empresa o habilidad..." />
          </div>
          <div className="top-bar-actions">
            <div className="user-profile-summary">
              <div className="user-info">
                <span className="user-name">{usuario.nombre}</span>
                <span className="user-carrera">{usuario.carrera}</span>
              </div>
              <div className="user-avatar">
                {usuario.nombre[0]}{usuario.nombre.split(' ')[1]?.[0] || ''}
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
                      <p>¡Nuevo Match! <strong>Fast Code</strong> está interesado en tu perfil.</p>
                      <span className="noti-time">Hace 2m</span>
                    </div>
                    <div className="notification-item estado">
                      <p>Tu postulación en <strong>Global Tech</strong> cambió a "En Revisión".</p>
                      <span className="noti-time">Hace 1h</span>
                    </div>
                    <div className="notification-item match">
                      <p>¡Nuevo Match! <strong>Creative Studio</strong> te ha enviado una invitación.</p>
                      <span className="noti-time">Hace 3h</span>
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
