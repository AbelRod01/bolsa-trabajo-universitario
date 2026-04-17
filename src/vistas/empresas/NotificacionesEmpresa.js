/**
 * NOTIFICACIONES EMPRESA (NotificacionesEmpresa.js)
 * ─────────────────────────────────────────────────────
 * Vista completa de notificaciones para el usuario empresa.
 * Recibe alertas cuando un alumno se postula a una de sus vacantes.
 *
 * FLUJO DE DATOS EN SUPABASE:
 *   - Notificación de nueva postulación: notificacion → postulacion → oferta_id
 *   - Si hay un match previo: notificacion → match_tabla → oferta_id (directo)
 *
 * Al hacer clic en "Ver Vacante", navega a la gestión de esa oferta específica.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../componentes/Notificaciones.css';
import { supabase } from '../../supabaseClient';

const NotificacionesEmpresa = ({ usuario }) => {
  const [notificaciones, setNotificaciones] = useState([]);  // Lista de notificaciones de la empresa
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // --- EFECTO: CARGAR NOTIFICACIONES AL MONTAR ---
  useEffect(() => {
    const fetchNotificaciones = async () => {
      if (!usuario?.empresa_id) return;
      setCargando(true);
      
      const { data, error } = await supabase
        .from('notificacion')
        .select(`
            *,
            postulacion(oferta_id),
            match_tabla(oferta_id)
        `)
        // Filtramos solo las notificaciones dirigidas a esta empresa
        .eq('destinatario_tipo', 'empresa')
        .eq('destinatario_id', usuario.empresa_id)
        .order('fecha_envio', { ascending: false });

      if (!error) {
        setNotificaciones(data);
      }
      setCargando(false);
    };

    fetchNotificaciones();
  }, [usuario]);

  // Marca todas las notificaciones de la empresa como leídas en Supabase
  const marcarComoLeidas = async () => {
    if (!usuario?.empresa_id) return;
    const { error } = await supabase
      .from('notificacion')
      .update({ estado_envio: 'leido' })
      .eq('destinatario_tipo', 'empresa')
      .eq('destinatario_id', usuario.empresa_id);
    
    if (!error) {
      // Actualización optimista del estado local sin recargar
      setNotificaciones(prev => prev.map(n => ({ ...n, estado_envio: 'leido' })));
    }
  };

  // Elimina una notificación individual de la BD
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

  // Navega al gestor de la oferta específica relacionada con esta notificación
  const irAOferta = async (noti) => {
    // Resolvemos el oferta_id:
    // - Si es notificación de postulación: viene de postulacion.oferta_id
    // - Si es notificación de match: viene de match_tabla.oferta_id directamente
    const idOferta = noti.postulacion?.oferta_id || noti.match_tabla?.oferta_id;
    console.log("Navegando a oferta (Empresa):", idOferta, "desde noti:", noti);
    
    // Marcamos como leída al hacer clic (si no lo estaba)
    if (noti.estado_envio === 'no_leido') {
      await supabase.from('notificacion')
        .update({ estado_envio: 'leido' })
        .eq('notificacion_id', noti.notificacion_id);
      setNotificaciones(prev => prev.map(n =>
        n.notificacion_id === noti.notificacion_id ? { ...n, estado_envio: 'leido' } : n
      ));
    }

    if (idOferta) {
        // Navegamos al gestor de ofertas de la empresa con el ID de la oferta
        // MisOfertas.js detecta el 'openOfertaId' en location.state y abre esa oferta automáticamente
        navigate('/empresa/ofertas', { state: { openOfertaId: idOferta } });
    } else {
        alert("Esta notificación no tiene una oferta asociada o es antigua.");
    }
  };

  if (cargando) return <div style={{padding:'50px', textAlign:'center', color:'#64748b'}}>Cargando notificaciones...</div>;

  return (
    <div className="page-notificaciones-container">
      {/* ── CABECERA DE LA PÁGINA ── */}
      <div className="page-notificaciones-header">
        <div>
          <h2>Notificaciones de Empresa</h2>
          <p>Revisa las últimas postulaciones y actualizaciones de tus vacantes.</p>
        </div>
        <button className="btn-marcar-leidas" onClick={marcarComoLeidas}>Marcar todas como leídas</button>
      </div>

      {/* ── LISTA DE NOTIFICACIONES ── */}
      <div className="notificaciones-list-card">
        {notificaciones.length > 0 ? notificaciones.map(noti => (
          <div key={noti.notificacion_id} className={`noti-list-item empresa ${noti.estado_envio === 'no_leido' ? 'unread' : ''}`}>
            <button className="btn-eliminar-noti" onClick={() => borrarNotificacion(noti.notificacion_id)} title="Eliminar">×</button>
            
            {/* Icono: 👤 para nuevas postulaciones (con 👋), 📋 para otras actualizaciones */}
            <div className={`noti-icon-container ${noti.contenido.includes('👋') ? 'match' : 'estado'}`}>
              {noti.contenido.includes('👋') ? '👤' : '📋'}
            </div>
            
            <div className="noti-content-full">
              <h4>{noti.contenido.includes('👋') ? '¡Nueva Postulación!' : 'Actualización'}</h4>
              <p>{noti.contenido}</p>
              <div className="noti-meta">
                <span>{new Date(noti.fecha_envio).toLocaleDateString()}</span>
                {noti.estado_envio === 'no_leido' && <span className="unread-dot"></span>}
              </div>
            </div>

            {/* Al hacer clic, navega directamente a la oferta a la que se postuló el alumno */}
            <div className="noti-actions-side">
                <button className="btn-noti-accion" onClick={() => irAOferta(noti)}>Ver Vacante</button>
            </div>
          </div>
        )) : (
          <div style={{padding:'40px', textAlign:'center', color:'#94a3b8'}}>No hay notificaciones recientes.</div>
        )}
      </div>
    </div>
  );
};

export default NotificacionesEmpresa;
