import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./css/MenuEmpresa.css";
import LayoutEmpresa from "./LayoutEmpresa";
import MisOfertas from "./MisOfertas";
import PerfilEmpresa from "./PerfilEmpresa";
import EditarPerfilEmpresa from "./EditarPerfilEmpresa";
import NotificacionesEmpresa from "./NotificacionesEmpresa";
import CandidatosEmpresa from "./CandidatosEmpresa";
import { supabase } from "../../supabaseClient";

const MenuPrincipalEmpresa = ({ onLogout, usuario, setUsuario }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [perfilCompleto, setPerfilCompleto] = useState(true);

  useEffect(() => {
    // Validación de Perfil Completo
    const incompleto = 
      !usuario?.sector || 
      !usuario?.descripcion || 
      !usuario?.ubicacion || 
      !usuario?.contacto_telefono ||
      !usuario?.beneficios ||
      !usuario?.tamano_empresa ||
      !usuario?.fundada_en;

    setPerfilCompleto(!incompleto);
  }, [usuario]);

  let activeView = 'inicio';
  if (location.pathname.includes('/ofertas')) activeView = 'ofertas';
  else if (location.pathname.includes('/candidatos')) activeView = 'candidatos';
  else if (location.pathname.includes('/perfil')) activeView = 'perfil';
  else if (location.pathname.includes('/editar_perfil')) activeView = 'editar_perfil';
  else if (location.pathname.includes('/notificaciones')) activeView = 'notificaciones';

  const handleCambiarVista = (vista) => {
    if (vista === 'inicio') navigate('/empresa');
    else navigate(`/empresa/${vista}`);
  };

  const DashboardInicio = () => {
    const [candidatosRecientes, setCandidatosRecientes] = useState([]);
    const [ofertasActivas, setOfertasActivas] = useState([]);
    const [cargandoDash, setCargandoDash] = useState(true);

    useEffect(() => {
        const fetchDashData = async () => {
            if (!usuario?.empresa_id) return;
            setCargandoDash(true);

            // 1. Obtener las 4 vacantes abiertas más recientes, con sus postulaciones
            const { data: ofertas } = await supabase
                .from('oferta_laboral')
                .select('oferta_id, titulo, postulacion(postulacion_id, estado)')
                .eq('empresa_id', usuario.empresa_id)
                .eq('estado', 'abierta')
                .order('fecha_publicacion', { ascending: false })
                .limit(4);

            // 2. Obtener los 5 candidatos más recientes de las ofertas de esta empresa
            const { data: postulaciones } = await supabase
                .from('postulacion')
                .select(`
                    postulacion_id,
                    estado,
                    fecha_postulacion,
                    oferta:oferta_id!inner (oferta_id, titulo, empresa_id),
                    alumno:alumno_id (alumno_id, nombre, apellido, carrera)
                `)
                .eq('oferta.empresa_id', usuario.empresa_id)
                .neq('estado', 'rechazado')   // Excluir rechazados del resumen
                .order('fecha_postulacion', { ascending: false })
                .limit(5);

            setOfertasActivas(ofertas || []);
            setCandidatosRecientes(postulaciones || []);
            setCargandoDash(false);
        };
        fetchDashData();
    }, [usuario]);

    if (!perfilCompleto) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0', marginTop: '20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>Panel Bloqueado</h2>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 20px' }}>
            Completa tu información corporativa para activar el panel de gestión.
          </p>
          <button onClick={() => handleCambiarVista('editar_perfil')} style={{padding:'12px 24px', background:'#2563eb', color:'white', border:'none', borderRadius:'12px', fontWeight:'700', cursor:'pointer'}}>Ir al Perfil</button>
        </div>
      );
    }

    if (cargandoDash) return <div style={{padding:'40px', textAlign:'center', color:'#64748b'}}>Cargando estadísticas...</div>;

    return (
      <div style={{animation: 'fadeIn 0.5s ease-out'}}>
        <div className="feed-header">
          <h2 style={{color:'#1e293b'}}>Resumen de Gestión</h2>
        </div>
        
        <div className="dashboard-grid-empresa" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(400px, 1fr))', gap:'30px', marginTop:'20px'}}>
          {/* Columna: Candidatos Recientes */}
          <div className="dashboard-panel" style={{background:'white', padding:'25px', borderRadius:'20px', border:'1px solid #e2e8f0'}}>
            <div className="panel-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <h3 style={{margin:0, color:'#1e293b'}}>Candidatos Recientes</h3>
              <button className="btn-text" style={{background:'none', border:'none', color:'#2563eb', fontWeight:'700', cursor:'pointer'}} onClick={() => handleCambiarVista('candidatos')}>Ver todos</button>
            </div>
            <div className="panel-list">
              {candidatosRecientes.length > 0 ? candidatosRecientes.map(c => (
                <div 
                    key={c.postulacion_id} 
                    onClick={() => navigate('/empresa/ofertas', { state: { openOfertaId: c.oferta.oferta_id, openAlumnoId: c.alumno.alumno_id } })}
                    style={{display:'flex', alignItems:'center', gap:'15px', padding:'15px 0', borderBottom:'1px solid #f1f5f9', cursor:'pointer'}}
                    className="hover-light"
                >
                  <div style={{width:'40px', height:'40px', background:'#eff6ff', color:'#2563eb', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800'}}>{c.alumno.nombre[0]}</div>
                  <div style={{flex:1}}>
                    <h4 style={{margin:0, color:'#0f172a', fontSize:'1rem'}}>{c.alumno.nombre} {c.alumno.apellido}</h4>
                    <span style={{fontSize:'0.8rem', color:'#64748b'}}>{c.alumno.carrera} • {c.oferta.titulo}</span>
                  </div>
                  <span style={{
                    fontSize:'0.7rem', 
                    fontWeight:'800', 
                    padding:'4px 8px', 
                    borderRadius:'6px',
                    background: c.estado === 'pendiente' ? '#fffbeb' : (c.estado === 'visto' ? '#ecfdf5' : '#fef2f2'),
                    color: c.estado === 'pendiente' ? '#b45309' : (c.estado === 'visto' ? '#059669' : '#dc2626')
                  }}>
                    {c.estado === 'visto' ? 'MATCH' : c.estado.toUpperCase()}
                  </span>
                </div>
              )) : <p style={{color:'#94a3b8', textAlign:'center', padding:'20px'}}>No hay aplicaciones recientes.</p>}
            </div>
          </div>

          {/* Columna: Ofertas Activas */}
          <div className="dashboard-panel" style={{background:'white', padding:'25px', borderRadius:'20px', border:'1px solid #e2e8f0'}}>
            <div className="panel-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <h3 style={{margin:0, color:'#1e293b'}}>Mis Vacantes Abiertas</h3>
              <button className="btn-text" style={{background:'none', border:'none', color:'#2563eb', fontWeight:'700', cursor:'pointer'}} onClick={() => handleCambiarVista('ofertas')}>Gestionar</button>
            </div>
            <div className="panel-list">
              {ofertasActivas.length > 0 ? ofertasActivas.map(o => (
                <div 
                    key={o.oferta_id} 
                    onClick={() => navigate('/empresa/ofertas', { state: { openOfertaId: o.oferta_id } })}
                    style={{padding:'15px', background:'#f8fafc', borderRadius:'12px', marginBottom:'12px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer'}}
                    className="hover-light"
                >
                   <div>
                    <h4 style={{margin:0, color:'#1e293b', fontSize:'0.95rem'}}>{o.titulo}</h4>
                     <span style={{fontSize:'0.8rem', color:'#64748b'}}>
                       {(o.postulacion || []).filter(p => p.estado !== 'rechazado').length} candidatos activos
                     </span>
                   </div>
                   <div style={{width:'8px', height:'8px', background:'#10b981', borderRadius:'50%'}}></div>
                </div>
              )) : <p style={{color:'#94a3b8', textAlign:'center', padding:'20px'}}>No tienes ofertas activas.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <LayoutEmpresa 
      onLogout={onLogout} 
      vistaActual={activeView === 'editar_perfil' ? 'perfil' : activeView} 
      onCambiarVista={handleCambiarVista}
      usuario={usuario}
    >
      {!perfilCompleto && activeView !== 'editar_perfil' && (
        <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #059669', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong>🏢 Perfil de Empresa Incompleto:</strong> Por favor, completa tu descripción y detalles para poder gestionar vacantes.</span>
          <button onClick={() => handleCambiarVista('editar_perfil')} style={{ padding:'8px 15px', background:'#059669', color: 'white', border:'none', borderRadius:'4px', cursor:'pointer', fontWeight:'bold' }}>Completar Perfil</button>
        </div>
      )}

      <Routes>
        <Route path="ofertas" element={<MisOfertas usuario={usuario} perfilCompleto={perfilCompleto} />} />
        <Route path="candidatos" element={<CandidatosEmpresa usuario={usuario} />} />
        <Route path="perfil" element={<PerfilEmpresa usuario={usuario} onEditClick={() => navigate('/empresa/editar_perfil')} />} />
        <Route path="editar_perfil" element={<EditarPerfilEmpresa usuario={usuario} setUsuario={setUsuario} onCancel={() => navigate('/empresa/perfil')} onSave={() => navigate('/empresa/perfil')} />} />
        <Route path="notificaciones" element={<NotificacionesEmpresa usuario={usuario} />} />
        <Route path="" element={<DashboardInicio />} />
        <Route path="*" element={
          <div className="placeholder-vista">
            <h2>Vista en construcción...</h2>
            <button className="btn-guardar" style={{marginTop: "20px"}} onClick={() => navigate('/empresa')}>Volver al Panel</button>
          </div>
        } />
      </Routes>
    </LayoutEmpresa>
  );
};

export default MenuPrincipalEmpresa;
