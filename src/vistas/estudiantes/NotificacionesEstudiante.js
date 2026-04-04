import React from 'react';
import '../../componentes/Notificaciones.css';

const NotificacionesEstudiante = () => {
  const notificaciones = [
    { id: 1, tipo: 'match', titulo: '¡Nuevo Match!', descripcion: 'Fast Code está interesado en tu perfil para la vacante de Desarrollador Web.', fecha: 'Hace 2 horas', leido: false },
    { id: 2, tipo: 'estado', titulo: 'Actualización en Postulación', descripcion: 'Tu postulación en Global Tech cambió a "En Revisión".', fecha: 'Hace 1 día', leido: false },
    { id: 3, tipo: 'match', titulo: 'Invitación a Aplicar', descripcion: 'Creative Studio te ha enviado una invitación para unirte a su equipo de diseño.', fecha: 'Hace 3 días', leido: true },
    { id: 4, tipo: 'mensaje', titulo: 'Nuevo Mensaje', descripcion: 'El reclutador de Data Solutions te ha enviado un mensaje directo.', fecha: 'Hace 1 semana', leido: true },
  ];

  return (
    <div className="page-notificaciones-container">
      <div className="page-notificaciones-header">
        <div>
          <h2>Tus Notificaciones</h2>
          <p>Mantente al tanto de tus postulaciones, matches y mensajes.</p>
        </div>
        <button className="btn-marcar-leidas">Marcar todas como leídas</button>
      </div>

      <div className="notificaciones-list-card">
        {notificaciones.map(noti => (
          <div key={noti.id} className={`noti-list-item ${noti.leido ? '' : 'unread'}`}>
            <div className={`noti-icon-container ${noti.tipo}`}>
              {noti.tipo === 'match' ? '🔥' : noti.tipo === 'estado' ? '📋' : '💬'}
            </div>
            
            <div className="noti-content-full">
              <h4>{noti.titulo}</h4>
              <p>{noti.descripcion}</p>
              <div className="noti-meta">
                <span>{noti.fecha}</span>
                {!noti.leido && <span className="unread-dot"></span>}
              </div>
            </div>

            <div className="noti-actions-side">
              {noti.tipo === 'match' && <button className="btn-noti-accion">Ver Vacante</button>}
              {noti.tipo === 'estado' && <button className="btn-noti-accion">Ver Estado</button>}
              {noti.tipo === 'mensaje' && <button className="btn-noti-accion">Leer Mensaje</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificacionesEstudiante;
