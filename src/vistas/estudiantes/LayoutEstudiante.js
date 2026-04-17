/**
 * LAYOUT ESTUDIANTE (LayoutEstudiante.js)
 * ─────────────────────────────────────────
 * Componente "envoltorio" (wrapper) que define la estructura visual
 * que comparten TODAS las páginas del área de estudiante:
 *   - Barra lateral izquierda (sidebar) con navegación
 *   - Cabecera superior (top bar) con búsqueda y notificaciones
 *   - Área central donde se inyectan los componentes hijos ({children})
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IconoInicio, 
  IconoUsuario, 
  IconoSalir,
  IconoRayo,
  IconoBuscar,
  IconoCampana
} from '../../componentes/Iconos';
import { supabase } from '../../supabaseClient';

const LayoutEstudiante = ({ children, onLogout, vistaActual = 'inicio', onCambiarVista = () => {}, usuario }) => {
  // --- ESTADOS LOCALES ---
  const [mostrarNotis, setMostrarNotis] = useState(false);    // Controla si el dropdown de notificaciones está abierto
  const [notisDropdown, setNotisDropdown] = useState([]);     // Las últimas 4 notificaciones para el dropdown

  // Formateamos el nombre completo y las iniciales del avatar
  const nombreEstudiante = usuario?.nombre 
    ? `${usuario.nombre} ${usuario.apellido || ''}` 
    : "Estudiante";
    
  const iniciales = usuario?.nombre 
    ? `${usuario.nombre[0]}${usuario.apellido?.[0] || ''}`.toUpperCase() 
    : "U";

  const navigate = useNavigate();

  // --- EFECTO: CARGAR NOTIFICACIONES AL ABRIR EL DROPDOWN ---
  // Solo hace la petición a Supabase cuando el usuario abre el panel (lazy loading)
  useEffect(() => {
    const fetchNotisRapidas = async () => {
      if (!usuario?.alumno_id) return;
      const { data } = await supabase
        .from('notificacion')
        .select('*, postulacion(oferta_id), match_tabla(oferta_id)')
        .eq('destinatario_tipo', 'alumno')
        .eq('destinatario_id', usuario.alumno_id)
        .order('fecha_envio', { ascending: false })
        .limit(4); // Solo las 4 más recientes para el preview rápido
      
      if (data) setNotisDropdown(data);
    };

    if (mostrarNotis) fetchNotisRapidas();
  }, [mostrarNotis, usuario]);

  // Navega a la oferta relacionada con la notificación y la marca como leída
  const irAOfertaDesdeDropdown = async (noti) => {
    // Marcar como leída al hacer clic
    if (noti.estado_envio === 'no_leido') {
      await supabase.from('notificacion')
        .update({ estado_envio: 'leido' })
        .eq('notificacion_id', noti.notificacion_id);
      setNotisDropdown(prev => prev.map(n =>
        n.notificacion_id === noti.notificacion_id ? { ...n, estado_envio: 'leido' } : n
      ));
    }
    // Resolver el oferta_id: puede venir de postulacion o de match_tabla
    const idOferta = noti.postulacion?.oferta_id || noti.match_tabla?.oferta_id;
    if (idOferta && noti.tipo !== 'rechazo') {
      setMostrarNotis(false);
      navigate('/estudiante', { state: { openOfertaId: idOferta } });
    } else {
      // Si no tiene oferta válida o es rechazo, simplemente abre la vista de notificaciones
      onCambiarVista('notificaciones');
      setMostrarNotis(false);
    }
  };

  // Convierte una fecha ISO en texto relativo: "Hace 5 min", "Hace 2 h", o la fecha completa
  const formatearTiempo = (fecha) => {
    const ahora = new Date();
    const dif = ahora - new Date(fecha);
    const mins = Math.floor(dif / 60000);
    if (mins < 60) return `Hace ${mins} min`;
    const horas = Math.floor(mins / 60);
    if (horas < 24) return `Hace ${horas} h`;
    return new Date(fecha).toLocaleDateString();
  };

  return (
    // Al hacer clic en cualquier parte del fondo, cerramos el dropdown de notificaciones
    <div className="dashboard-container" onClick={() => mostrarNotis && setMostrarNotis(false)}>
      
      {/* ── BARRA LATERAL IZQUIERDA (Sidebar) ── */}
      <aside className="sidebar">
        {/* Logo / Marca de la plataforma */}
        <div className="sidebar-logo">
          <IconoRayo />
          <span>UniJob</span>
        </div>
        {/* Menú de navegación: el botón activo se resalta con la clase CSS 'active' */}
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
        {/* Botón de cierre de sesión, anclado al fondo del sidebar */}
        <button className="logout-btn" onClick={onLogout}>
          <IconoSalir />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* ── ÁREA PRINCIPAL (Contenido + Cabecera) ── */}
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-actions">
            {/* Resumen del usuario logueado: nombre y carrera */}
            <div className="user-profile-summary">
              <div className="user-info">
                <span className="user-name">{nombreEstudiante}</span>
                <span className="user-carrera">{usuario?.carrera || "Estudiante Universidad"}</span>
              </div>
              {/* Avatar circular con las iniciales del alumno */}
              <div className="user-avatar">
                {iniciales}
              </div>
            </div>

            {/* ── CENTRO DE NOTIFICACIONES ── */}
            <div className="notification-wrapper">
              {/* El punto rojo (dot) aparece si hay notificaciones sin leer */}
              <button 
                className={`action-btn notification-btn ${mostrarNotis ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevenir que el click cierre el dropdown inmediatamente
                  setMostrarNotis(!mostrarNotis);
                }}
              >
                <IconoCampana />
                {notisDropdown.some(n => n.estado_envio === 'no_leido') && <span className="dot"></span>}
              </button>
              
              {/* Dropdown de notificaciones (visible solo cuando mostrarNotis === true) */}
              {mostrarNotis && (
                <div className="notifications-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="dropdown-header">
                    <h3>Notificaciones Recientes</h3>
                  </div>
                  <div className="dropdown-content">
                    {notisDropdown.length > 0 ? notisDropdown.map(noti => (
                      // Cada notificación es clickeable: navega a la oferta relacionada
                      <div 
                        key={noti.notificacion_id} 
                        className={`notification-item ${noti.contenido.includes('\uD83C\uDF89') ? 'match' : ''} ${noti.estado_envio === 'no_leido' ? 'unread' : ''}`}
                        onClick={() => irAOfertaDesdeDropdown(noti)}
                        style={{ cursor: 'pointer' }}
                      >
                        <p>{noti.contenido}</p>
                        <span className="noti-time">{formatearTiempo(noti.fecha_envio)}</span>
                      </div>
                    )) : (
                      <div className="notification-item">
                        <p>No tienes notificaciones recientes.</p>
                      </div>
                    )}
                  </div>
                  {/* Botón para navegar a la vista completa de notificaciones */}
                  <button className="view-all-notis" onClick={() => {
                    onCambiarVista('notificaciones');
                    setMostrarNotis(false);
                  }}>Ver todas las notificaciones</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── ZONA DE CONTENIDO DINÁMICO ── */}
        {/* Los componentes hijos (MenuPrincipal, PerfilEstudiante, etc.) se renderizan aquí */}
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
