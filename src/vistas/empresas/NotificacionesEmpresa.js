import React from 'react';
import '../../componentes/Notificaciones.css';

const NotificacionesEmpresa = () => {
  const notificaciones = [
    { id: 1, tipo: 'match', titulo: '¡Nueva Postulación!', descripcion: 'Juan Pérez ha aplicado a tu vacante de "Desarrollador Frontend Junior".', fecha: 'Hace 15 minutos', leido: false },
    { id: 2, tipo: 'estado', titulo: 'Estadística de Oferta', descripcion: 'Tu oferta "Analista de Datos" ha superado las 50 visualizaciones hoy.', fecha: 'Hace 2 horas', leido: false },
    { id: 3, tipo: 'match', titulo: 'Candidato Destacado', descripcion: 'El sistema ha encontrado un candidato con 98% de compatibilidad para "Ingeniero DevOps".', fecha: 'Hace 1 día', leido: true },
    { id: 4, tipo: 'mensaje', titulo: 'Mensaje de Soporte', descripcion: 'El equipo de UniJob ha aprobado tu perfil de empresa correctamente.', fecha: 'Hace 3 días', leido: true },
  ];

  return (
    <div className="page-notificaciones-container">
      <div className="page-notificaciones-header">
        <div>
          <h2>Notificaciones de Empresa</h2>
          <p>Revisa las últimas postulaciones, métricas y mensajes de candidatos.</p>
        </div>
        <button className="btn-marcar-leidas">Marcar todas como leídas</button>
      </div>

      <div className="notificaciones-list-card">
        {notificaciones.map(noti => (
          <div key={noti.id} className={`noti-list-item empresa ${noti.leido ? '' : 'unread'}`}>
            <div className={`noti-icon-container ${noti.tipo}`}>
              {noti.tipo === 'match' ? '👤' : noti.tipo === 'estado' ? '📊' : '✅'}
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
              {noti.tipo === 'match' && <button className="btn-noti-accion">Ver Candidato</button>}
              {noti.tipo === 'estado' && <button className="btn-noti-accion">Ver Oferta</button>}
              {noti.tipo === 'mensaje' && <button className="btn-noti-accion">Ver Detalles</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificacionesEmpresa;
