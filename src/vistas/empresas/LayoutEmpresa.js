/**
 * LAYOUT EMPRESA (LayoutEmpresa.js)
 * ─────────────────────────────────────────
 * Componente "envoltorio" que define la estructura visual compartida
 * por TODAS las páginas del área de empresa:
 *   - Barra lateral con navegación (Panel, Ofertas, Perfil)
 *   - Cabecera con identidad de empresa y sistema de notificaciones
 *   - Zona central donde se renderizan los componentes hijos ({children})
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { supabase } from '../../supabaseClient';

const LayoutEmpresa = ({ children, onLogout, vistaActual = 'inicio', onCambiarVista = () => {}, usuario }) => {
  // --- ESTADOS LOCALES ---
  const [mostrarNotis, setMostrarNotis] = useState(false);    // Abre/cierra el panel de notificaciones
  const [notisDropdown, setNotisDropdown] = useState([]);     // Últimas 4 notificaciones (vista previa)

  const navigate = useNavigate();

  // Datos de la empresa para mostrar en el top bar
  const nombreEmpresa = usuario?.nombre || "Empresa";
  const sectorEmpresa = usuario?.sector || "Empresa Registrada";

  // --- EFECTO: CARGA LAZY DE NOTIFICACIONES ---
  // Solo consulta Supabase cuando el usuario abre el panel (evita peticiones innecesarias)
  useEffect(() => {
    const fetchNotisRapidas = async () => {
      if (!usuario?.empresa_id) return;
      const { data } = await supabase
        .from('notificacion')
        .select('*, postulacion(oferta_id)')
        .eq('destinatario_tipo', 'empresa')
        .eq('destinatario_id', usuario.empresa_id)
        .order('fecha_envio', { ascending: false })
        .limit(4);
      
      if (data) setNotisDropdown(data);
    };

    if (mostrarNotis) fetchNotisRapidas();
  }, [mostrarNotis, usuario]);

  // Navega a la oferta relacionada con la notificación y la marca como leída
  const irAOfertaDesdeDropdown = async (noti) => {
    if (noti.estado_envio === 'no_leido') {
      await supabase.from('notificacion')
        .update({ estado_envio: 'leido' })
        .eq('notificacion_id', noti.notificacion_id);
      setNotisDropdown(prev => prev.map(n =>
        n.notificacion_id === noti.notificacion_id ? { ...n, estado_envio: 'leido' } : n
      ));
    }
    // Las notificaciones de empresa siempre tienen postulacion_id con la oferta
    const idOferta = noti.postulacion?.oferta_id;
    setMostrarNotis(false);
    if (idOferta) {
      navigate('/empresa/ofertas', { state: { openOfertaId: idOferta } });
    } else {
      onCambiarVista('notificaciones');
    }
  };

  // Convierte un timestamp ISO a texto relativo: "Hace 5 min", "Hace 3 h", o fecha completa
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
    // Click en el fondo cierra el dropdown si está abierto
    <div className="dashboard-container" onClick={() => mostrarNotis && setMostrarNotis(false)}>
      
      {/* ── BARRA LATERAL IZQUIERDA (Sidebar Empresa) ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <IconoRayo />
          <span>UniJob Empresa</span>
        </div>
        {/* Navegación principal: Panel General, Mis Ofertas, Perfil de Empresa */}
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

      {/* ── ÁREA PRINCIPAL ── */}
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-actions">
            {/* Identidad de la empresa: nombre y sector */}
            <div className="user-profile-summary">
              <div className="user-info">
                <span className="user-name">{nombreEmpresa}</span>
                <span className="user-carrera">{sectorEmpresa}</span>
              </div>
              {/* Avatar con la inicial del nombre de la empresa */}
              <div className="user-avatar empresa-avatar">
                {nombreEmpresa[0].toUpperCase()}
              </div>
            </div>

            {/* ── SISTEMA DE NOTIFICACIONES EMPRESA ── */}
            <div className="notification-wrapper">
              {/* El punto rojo indica notificaciones no leídas */}
              <button 
                className={`action-btn notification-btn ${mostrarNotis ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setMostrarNotis(!mostrarNotis);
                }}
              >
                <IconoCampana />
                {notisDropdown.some(n => n.estado_envio === 'no_leido') && <span className="dot"></span>}
              </button>
              
              {mostrarNotis && (
                <div className="notifications-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="dropdown-header">
                    <h3>Notificaciones de Empresa</h3>
                  </div>
                  <div className="dropdown-content">
                    {notisDropdown.length > 0 ? notisDropdown.map(noti => (
                      // Cada notificación es clickeable: navega directamente a la oferta
                      <div 
                        key={noti.notificacion_id} 
                        className={`notification-item ${noti.contenido.includes('\uD83D\uDC4B') ? 'match' : ''} ${noti.estado_envio === 'no_leido' ? 'unread' : ''}`}
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
                  {/* Enlace a la vista completa de notificaciones */}
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
        {/* Aquí React renderiza el componente hijo correspondiente a la ruta activa */}
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
