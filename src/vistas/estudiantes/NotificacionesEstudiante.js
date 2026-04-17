/**
 * NOTIFICACIONES ESTUDIANTE (NotificacionesEstudiante.js)
 * ─────────────────────────────────────────────────────────
 * Vista completa de notificaciones para el alumno.
 * Muestra todas las notificaciones ordenadas por fecha, con opciones de:
 *   - Marcar todas como leídas
 *   - Eliminar una notificación individual
 *   - Navegar directamente a la oferta asociada (deep link)
 *
 * FLUJO DE DATOS EN SUPABASE:
 *   - Notificación de Postulación: notificacion → postulacion → oferta_id
 *   - Notificación de Match:       notificacion → match_tabla → oferta_id (directo)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../componentes/Notificaciones.css';
import { supabase } from '../../supabaseClient';

const NotificacionesEstudiante = ({ usuario }) => {
  const [notificaciones, setNotificaciones] = useState([]); // Lista de notificaciones del alumno
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // --- EFECTO: CARGAR NOTIFICACIONES AL MONTAR EL COMPONENTE ---
  useEffect(() => {
    const fetchNotificaciones = async () => {
      if (!usuario?.alumno_id) return;
      setCargando(true);
      
      const { data, error } = await supabase
        .from('notificacion')
        .select(`
            *,
            postulacion(oferta_id),
            match_tabla(oferta_id)
        `)
        // Filtros: solo notificaciones de este alumno específico
        .eq('destinatario_id', usuario.alumno_id)
        .eq('destinatario_tipo', 'alumno')
        .order('fecha_envio', { ascending: false }); // Las más recientes primero

      if (!error) {
        setNotificaciones(data);
      }
      setCargando(false);
    };

    fetchNotificaciones();
  }, [usuario]);

  // Actualiza el estado 'estado_envio' a 'leido' para TODAS las notificaciones del alumno
  const marcarComoLeidas = async () => {
    if (!usuario?.alumno_id) return;
    const { error } = await supabase
      .from('notificacion')
      .update({ estado_envio: 'leido' })
      .eq('destinatario_tipo', 'alumno')
      .eq('destinatario_id', usuario.alumno_id);
    
    // Actualización optimista: no esperamos a recargar, actualizamos el estado local directamente
    if (!error) {
      setNotificaciones(prev => prev.map(n => ({ ...n, estado_envio: 'leido' })));
    }
  };

  // Elimina una notificación individual de la BD y la quita de la lista local
  const borrarNotificacion = async (id) => {
    const { error } = await supabase
      .from('notificacion')
      .delete()
      .eq('notificacion_id', id);
    
    if (!error) {
      setNotificaciones(prev => prev.filter(n => n.notificacion_id !== id));
    } else {
      alert("Error al eliminar la notificación.");
    }
  };

  // Navega al detalle de la oferta relacionada con la notificación
  const irAOferta = async (noti) => {
    // Resolvemos el oferta_id según el tipo de notificación:
    // - Postulación/Rechazo: postulacion.oferta_id
    // - Match: match_tabla.oferta_id (match_tabla tiene oferta_id directamente)
    const idOferta = noti.postulacion?.oferta_id || noti.match_tabla?.oferta_id;

    // Marcamos como leída al hacer clic (si no lo estaba ya)
    if (noti.estado_envio === 'no_leido') {
      await supabase.from('notificacion')
        .update({ estado_envio: 'leido' })
        .eq('notificacion_id', noti.notificacion_id);
      setNotificaciones(prev => prev.map(n =>
        n.notificacion_id === noti.notificacion_id ? { ...n, estado_envio: 'leido' } : n
      ));
    }

    if (idOferta) {
        // Pasamos el ID de la oferta como estado de navegación para que MenuPrincipal
        // abra automáticamente el detalle de esa oferta específica
        navigate('/estudiante', { state: { openOfertaId: idOferta } });
    }
  };

  // Determina si una notificación debe mostrar el botón "Ver Vacante".
  // Se oculta en rechazos y cuando la oferta ya no existe (postulacion_id o match_id nulo).
  const puedeVerVacante = (noti) => {
    if (noti.tipo === 'rechazo') return false;   // Rechazo: la vacante no aplica más
    if (noti.tipo === 'sistema') return false;   // Mensajes del sistema: sin oferta asociada
    // Solo mostramos si la FK resuelve un oferta_id real
    const tieneOferta = noti.postulacion?.oferta_id || noti.match_tabla?.oferta_id;
    return !!tieneOferta;
  };

  if (cargando) return <div style={{padding:'50px', textAlign:'center', color:'#64748b'}}>Cargando notificaciones...</div>;

  return (
    <div className="page-notificaciones-container">
      {/* ── CABECERA DE LA PÁGINA ── */}
      <div className="page-notificaciones-header">
        <div>
          <h2>Tus Notificaciones</h2>
          <p>Mantente al tanto de tus postulaciones, matches y mensajes.</p>
        </div>
        <button className="btn-marcar-leidas" onClick={marcarComoLeidas}>Marcar todas como leídas</button>
      </div>

      {/* ── LISTA DE NOTIFICACIONES ── */}
      <div className="notificaciones-list-card">
        {notificaciones.length > 0 ? notificaciones.map(noti => (
          // Las notificaciones no leídas tienen la clase 'unread' para resaltarse visualmente
          <div key={noti.notificacion_id} className={`noti-list-item ${noti.estado_envio === 'no_leido' ? 'unread' : ''}`}>
            
            {/* Botón de eliminar (×) posicionado en la esquina de la tarjeta */}
            <button className="btn-eliminar-noti" onClick={() => borrarNotificacion(noti.notificacion_id)} title="Eliminar">×</button>
            
            {/* Icono visual según el tipo de notificación */}
            <div className={`noti-icon-container ${noti.tipo === 'match' || noti.contenido.includes('🎉') ? 'match' : noti.tipo === 'rechazo' ? 'rechazo' : 'estado'}`}>
              {noti.tipo === 'match' || noti.contenido.includes('🎉') ? '🔥' : noti.tipo === 'rechazo' ? '❌' : '📋'}
            </div>
            
            {/* Contenido principal de la notificación */}
            <div className="noti-content-full">
              <h4>{noti.tipo === 'match' || noti.contenido.includes('🎉') ? '🎉 ¡Nuevo Match!' : noti.tipo === 'rechazo' ? '😔 Postulación no avanzó' : 'Actualización'}</h4>
              <p>{noti.contenido}</p>
              <div className="noti-meta">
                <span>{new Date(noti.fecha_envio).toLocaleDateString()}</span>
                {/* Punto rojo para notificaciones no leídas */}
                {noti.estado_envio === 'no_leido' && <span className="unread-dot"></span>}
              </div>
            </div>

            {/* Botón "Ver Vacante": solo se muestra si la notificación tiene oferta válida y no es un rechazo */}
            {puedeVerVacante(noti) && (
              <div className="noti-actions-side">
                <button className="btn-noti-accion" onClick={() => irAOferta(noti)}>Ver Vacante</button>
              </div>
            )}
          </div>
        )) : (
          <div style={{padding:'40px', textAlign:'center', color:'#94a3b8'}}>No tienes notificaciones por el momento.</div>
        )}
      </div>
    </div>
  );
};

export default NotificacionesEstudiante;
