/**
 * MENU PRINCIPAL ESTUDIANTE (MenuPrincipal.js)
 * ─────────────────────────────────────────────────────────────────
 * Vista central del área de estudiantes. Es el "corazón" de la aplicación.
 * Gestiona TODAS las sub-rutas del área de estudiante usando React Router:
 *   - /estudiante        → Lista de ofertas (Feed de vacantes)
 *   - /estudiante/perfil → Vista de perfil de solo lectura
 *   - /estudiante/editar_perfil → Formulario de edición del perfil
 *   - /estudiante/notificaciones → Lista de notificaciones
 *
 * FLUJO PRINCIPAL:
 *   1. Al cargar, verifica si el perfil está completo
 *   2. Consulta las ofertas de Supabase filtradas por la carrera del alumno
 *   3. Cruza con las postulaciones del alumno para saber el estado de cada oferta
 *   4. Muestra el feed con filtros de modalidad y paginación
 *   5. Si se selecciona una oferta, renderiza DetalleOferta en su lugar
 */
import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./css/MenuPrincipal.css";
import LayoutEstudiante from "./LayoutEstudiante";
import { IconoMapa, IconoDolar } from "../../componentes/Iconos";
import DetalleOferta from "./DetalleOferta";
import EditarPerfilEstudiante from "./EditarPerfilEstudiante";
import PerfilEstudiante from "./PerfilEstudiante";
import NotificacionesEstudiante from "./NotificacionesEstudiante";
import { supabase } from "../../supabaseClient";

const MenuPrincipalEstudiante = ({ onLogout, usuario, setUsuario }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- ESTADOS GLOBALES DEL FEED ---
  const [perfilCompleto, setPerfilCompleto] = useState(true);      // Si false, bloquea el feed y muestra el panel de aviso
  const [filtroActivo, setFiltroActivo] = useState("todo");         // Filtro de modalidad activo (todo/presencial/hibrido/remoto)
  const [paginaActual, setPaginaActual] = useState(1);              // Página activa de la paginación
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null); // Si tiene valor, muestra DetalleOferta
  const [ofertasData, setOfertasData] = useState([]);               // Array de ofertas ya transformadas y enriquecidas
  const [cargandoOfertas, setCargandoOfertas] = useState(true);    // Estado de carga inicial
  
  const ofertasPorPagina = 12; // Número máximo de ofertas por página

  // --- FUNCIÓN PRINCIPAL DE CARGA DE OFERTAS ---
  // useCallback memoiøza la función para poder pasarla como callback a DetalleOferta
  // sin causar bucles de re-renderizado infinito
  const fetchOfertas = useCallback(async () => {
    if (!usuario || !usuario.alumno_id) {
      return;
    }
    
    setCargandoOfertas(true);
    
    // Paso 1: Traer las ofertas ABIERTAS que coincidan con la carrera del alumno
    // Se usa !inner join para que si no hay coincidencia de carrera, la oferta NO aparezca
    const { data: ofertas, error: errO } = await supabase
      .from('oferta_laboral')
      .select(`
        *,
        empresa:empresa_id(nombre),
        oferta_carrera!inner(
          carrera!inner(nombre)
        )
      `)
      .eq('estado', 'abierta')
      .eq('oferta_carrera.carrera.nombre', usuario.carrera);

    if (errO) {
      console.error("Error cargando ofertas:", errO);
      setOfertasData([]);
    } else {
      // Paso 2: Traer las postulaciones del alumno para saber el estado de cada oferta
      // (si ya se postuló, verá "Postulado" en lugar del botón)
      const { data: postulaciones } = await supabase
        .from('postulacion')
        .select('oferta_id, estado')
        .eq('alumno_id', usuario.alumno_id);

      // Creamos un mapa {oferta_id → estado} para consultar en O(1)
      // Ejemplo: { 5: 'pendiente', 12: 'visto' }
      const mapaEstados = {};
      postulaciones?.forEach(p => {
        mapaEstados[p.oferta_id] = p.estado;
      });

      // Paso 3: Transformar el resultado de Supabase en el formato que usa la UI
      // (aplanamos los datos relacionales en un objeto simple y manejable)
      const ofertasTransformadas = ofertas.map(o => ({
        oferta_id: o.oferta_id,
        titulo: o.titulo,
        empresa: o.empresa?.nombre || "Empresa Desconocida",
        empresa_id: o.empresa_id,
        ubicacion: o.ubicacion || "No especificada",
        modalidad: o.modalidad || "No especificada",
        carrera: o.oferta_carrera?.[0]?.carrera?.nombre || "N/A",
        estaSeleccionado: false, 
        estadoPostulacion: mapaEstados[o.oferta_id] || null,
        descripcion_completa: o.descripcion
      }));
      setOfertasData(ofertasTransformadas);
    }
    setCargandoOfertas(false);
  }, [usuario]);

  // --- EFECTO: VALIDACIÓN DEL PERFIL ---
  // Se ejecuta cada vez que los datos del usuario cambian.
  // Si algún campo obligatorio está vacío, el feed muestra el "Panel Bloqueado"
  useEffect(() => {
    // Campos requeridos para considerar el perfil completo
    const camposInpletos = 
      !usuario?.telefono || 
      !usuario?.descripcion || 
      !usuario?.habilidades || 
      !usuario?.universidad || 
      !usuario?.carrera || 
      !usuario?.cv_url;

    setPerfilCompleto(!camposInpletos);
  }, [usuario]);

  useEffect(() => {
    fetchOfertas();
  }, [fetchOfertas]);

  // --- EFECTO: DEEP LINK DESDE NOTIFICACIONES ---
  // Si se navega desde una notificación con un openOfertaId en el estado,
  // buscamos esa oferta en la lista y la abrimos automáticamente
  useEffect(() => {
    if (location.state?.openOfertaId && ofertasData.length > 0) {
      const oferta = ofertasData.find(o => String(o.oferta_id) === String(location.state.openOfertaId));
      if (oferta) setOfertaSeleccionada(oferta);
    }
  }, [location.state, ofertasData]);

  // --- LÓGICA DE FILTROS DE MODALIDAD ---
  // Las ofertas Híbridas se muestran TANTO en Presencial como en Remoto
  // porque son compatibles con ambas modalidades de trabajo
  const ofertasFiltradas = ofertasData.filter((oferta) => {
    if (filtroActivo === "todo") return true;
    const modalidad = oferta.modalidad.toLowerCase();
    
    if (filtroActivo === "presencial") return modalidad === "presencial" || modalidad === "híbrido";
    if (filtroActivo === "remoto") return modalidad === "remoto" || modalidad === "híbrido";
    if (filtroActivo === "hibrido") return modalidad === "híbrido";
    
    return modalidad === filtroActivo;
  });

  // --- LÓGICA DE PAGINACIÓN ---
  // Dividimos el array filtrado en páginas de N elementos
  const totalPaginas = Math.ceil(ofertasFiltradas.length / ofertasPorPagina);
  const indiceUltimaOferta = paginaActual * ofertasPorPagina;
  const indicePrimeraOferta = indiceUltimaOferta - ofertasPorPagina;
  const ofertasPaginadas = ofertasFiltradas.slice(indicePrimeraOferta, indiceUltimaOferta);

  const cambiarPagina = (numero) => setPaginaActual(numero);

  const obtenerPaginasAMostrar = () => {
    const paginas = [];
    for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    return paginas;
  };

  const handleCambiarVista = (vista) => {
    if (vista === 'inicio') navigate('/estudiante');
    else navigate(`/estudiante/${vista}`);
  };

  // --- RENDER CONDICIONAL: DETALLE DE OFERTA ---
  // Si el alumno clickeó una oferta, mostramos DetalleOferta en lugar del feed.
  // Al volver (onBack), limpiamos la selección y refrescamos las ofertas para
  // que el estado del botón se actualice (ej: ya no mostrar "Ver Oferta" si se postuló)
  if (ofertaSeleccionada) {
    return (
      <DetalleOferta 
        oferta={ofertaSeleccionada} 
        usuario={usuario}
        onBack={() => {
            setOfertaSeleccionada(null);
            fetchOfertas();
        }} 
        onLogout={onLogout} 
        onCambiarVista={(vista) => {
          setOfertaSeleccionada(null);
          handleCambiarVista(vista);
        }}
        perfilCompleto={perfilCompleto}
        onPostulacionExitosa={fetchOfertas}
      />
    );
  }

  // --- COMPONENTE INTERNO: FEED DE OFERTAS ---
  // Se define como componente funcional interno para mantener el código organizado
  // y poder acceder al estado del padre sin pasar props extra
  const FeedContent = () => (
    <>
      {/* ── PANEL BLOQUEADO: Solo visible si el perfil está incompleto ── */}
      {/* Muestra un candado y un CTA para completar el perfil en lugar del feed */}
      {!perfilCompleto && (
        <div style={{
          background: '#f8fafc',
          border: '2px dashed #e2e8f0',
          borderRadius: '24px',
          padding: '40px 20px',
          textAlign: 'center',
          marginBottom: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{ fontSize: '40px' }}>🔒</div>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: '800' }}>Panel Limitado</h2>
          <p style={{ margin: 0, color: '#64748b', maxWidth: '450px', lineHeight: '1.5' }}>
            Completa tu información profesional (CV, Carrera, Universidad) para poder visualizar y postularte a las vacantes disponibles.
          </p>
          <button 
            onClick={() => handleCambiarVista('editar_perfil')}
            style={{
              marginTop: '10px',
              padding: '12px 30px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            🚀 Completar mi Perfil
          </button>
        </div>
      )}

      {cargandoOfertas ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Cargando ofertas...</div>
      ) : (
        <>
          <div className="feed-header">
            <h2>Ofertas para {usuario.carrera} ({ofertasFiltradas.length})</h2>
            <div className="feed-filters">
              <button className={`filter-chip ${filtroActivo === "todo" ? "active" : ""}`} onClick={() => { setFiltroActivo("todo"); setPaginaActual(1); }}>Todo</button>
              <button className={`filter-chip ${filtroActivo === "presencial" ? "active" : ""}`} onClick={() => { setFiltroActivo("presencial"); setPaginaActual(1); }}>Presencial</button>
              <button className={`filter-chip ${filtroActivo === "hibrido" ? "active" : ""}`} onClick={() => { setFiltroActivo("hibrido"); setPaginaActual(1); }}>Híbrido</button>
              <button className={`filter-chip ${filtroActivo === "remoto" ? "active" : ""}`} onClick={() => { setFiltroActivo("remoto"); setPaginaActual(1); }}>Remoto</button>
            </div>
          </div>

          <div className="jobs-grid">
            {ofertasPaginadas.map((oferta) => (
              <div key={oferta.oferta_id} className="job-card" style={{cursor: 'default'}}>
                <div className="job-card-header">
                  <div className="company-logo-placeholder">{oferta.empresa[0]}</div>
                  <div className="job-info">
                    <h3>{oferta.titulo}</h3>
                    <span className="company-name">{oferta.empresa}</span>
                  </div>
                </div>
                <div className="job-details">
                  <div className="detail-item">
                    <IconoMapa />
                    <span>{oferta.ubicacion}</span>
                  </div>
                  <div className="detail-item" style={{background: '#eff6ff', color: '#1e40af', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.75rem'}}>
                    🎓 {oferta.carrera}
                  </div>
                </div>
                <div className="job-card-footer">
                  {oferta.estadoPostulacion === 'pendiente' && (
                    <span style={{background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold'}}>
                      ⏳ Postulado
                    </span>
                  )}
                  {oferta.estadoPostulacion === 'visto' && (
                    <span style={{background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold'}}>
                      🤝 Match Hecho
                    </span>
                  )}
                  {oferta.estadoPostulacion === 'rechazado' && (
                    <span style={{background: '#fee2e2', color: '#991b1b', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold'}}>
                      ❌ No seleccionado
                    </span>
                  )}
                  {!oferta.estadoPostulacion && (
                    <button 
                      className="apply-btn-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!perfilCompleto) {
                          alert("⚠️ Atención: Completa tu perfil para poder postularte después.");
                        }
                        setOfertaSeleccionada(oferta);
                      }}
                      style={{
                        padding: '10px 20px',
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      📄 Ver Oferta
                    </button>
                  )}
                  {oferta.estadoPostulacion && (
                    <button 
                      onClick={() => setOfertaSeleccionada(oferta)}
                      style={{
                        padding: '10px 20px',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      🔍 Ver Detalles
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="pagination">
              <button disabled={paginaActual === 1} onClick={() => cambiarPagina(paginaActual - 1)} className="pagination-arrow">←</button>
              {obtenerPaginasAMostrar().map((p, idx) => (
                <button key={idx} className={paginaActual === p ? "active" : ""} onClick={() => cambiarPagina(p)}>{p}</button>
              ))}
              <button disabled={paginaActual === totalPaginas} onClick={() => cambiarPagina(paginaActual + 1)} className="pagination-arrow">→</button>
            </div>
          )}
        </>
      )}
    </>
  );

  let activeView = 'inicio';
  if (location.pathname.includes('/perfil')) activeView = 'perfil';
  else if (location.pathname.includes('/notificaciones')) activeView = 'notificaciones';

  return (
    <LayoutEstudiante onLogout={onLogout} vistaActual={activeView} onCambiarVista={handleCambiarVista} usuario={usuario}>
      <Routes>
        <Route path="editar_perfil" element={<EditarPerfilEstudiante usuario={usuario} setUsuario={setUsuario} onCancel={() => navigate('/estudiante/perfil')} onSave={() => navigate('/estudiante/perfil')} />} />
        <Route path="notificaciones" element={<NotificacionesEstudiante usuario={usuario} />} />
        <Route path="perfil" element={<PerfilEstudiante usuario={usuario} onEditClick={() => navigate('/estudiante/editar_perfil')} />} />
        <Route path="" element={<FeedContent />} />
      </Routes>
    </LayoutEstudiante>
  );
};

export default MenuPrincipalEstudiante;
