/**
 * CANDIDATOS EMPRESA (CandidatosEmpresa.js)
 * ─────────────────────────────────────────────────────
 * Vista "Central de Candidatos": muestra TODOS los alumnos que han
 * aplicado a CUALQUIERA de las ofertas de esta empresa, en un grid de tarjetas.
 *
 * Funcionalidades:
 *   - Lista todos los candidatos con su estado (Pendiente, Match, Rechazado)
 *   - Botón "Ver Perfil y Evaluar" que lleva a la gestión de esa oferta específica
 *   - Botón de CV para abrir el PDF del candidato en una nueva pestaña
 *
 * CONSULTA SUPABASE:
 *   postulacion → oferta (inner join filtrando por empresa_id) → alumno (*)
 *   Esto trae todos los candidatos de las ofertas de ESTA empresa.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/VistasEmpresa.css';
import { supabase } from '../../supabaseClient';

const CandidatosEmpresa = ({ usuario }) => {
  const [candidatos, setCandidatos] = useState([]);  // Array de postulaciones con datos del alumno
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // --- EFECTO: CARGAR TODOS LOS CANDIDATOS AL MONTAR ---
  // La dependencia es empresa_id (no el objeto usuario completo) para evitar re-renders innecesarios
  useEffect(() => {
    const fetchTodosLosCandidatos = async () => {
      if (!usuario?.empresa_id) return;
      setCargando(true);

      const { data, error } = await supabase
        .from('postulacion')
        .select(`
          postulacion_id,
          estado,
          fecha_postulacion,
          oferta:oferta_id!inner (oferta_id, titulo, empresa_id),
          alumno:alumno_id (*)
        `)
        // !inner garantiza que solo traemos postulaciones donde la oferta pertenece a esta empresa
        .eq('oferta.empresa_id', usuario.empresa_id)
        .neq('estado', 'rechazado')           // Excluir candidatos ya descartados
        .order('fecha_postulacion', { ascending: false }); // Los más recientes primero

      if (error) {
        console.error("Error cargando candidatos:", error);
      } else {
        setCandidatos(data || []);
      }
      setCargando(false);
    };

    fetchTodosLosCandidatos();
  }, [usuario?.empresa_id]);

  if (cargando) return <div style={{padding:'50px', textAlign:'center', color:'#64748b'}}>Consultando base de datos de talento...</div>;

  return (
    <div className="perfil-empresa-container" style={{animation: 'fadeIn 0.5s ease-out'}}>
      {/* ── CABECERA DE LA VISTA ── */}
      <div className="mis-ofertas-header" style={{marginBottom:'30px'}}>
        <h2 style={{color:'#1e293b', fontSize:'1.8rem'}}>Central de Candidatos</h2>
        <p style={{color:'#64748b'}}>Explora a todos los alumnos que han aplicado a tus vacantes profesionales.</p>
      </div>

      {/* ── GRID DE TARJETAS DE CANDIDATOS ── */}
      <div className="candidatos-grid-completo" style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'25px'}}>
        {candidatos.length > 0 ? candidatos.map(item => (
          <div key={item.postulacion_id} style={{
            background: 'white', 
            padding: '24px', 
            borderRadius: '20px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            {/* Cabecera de la tarjeta: avatar + nombre + carrera */}
            <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px'}}>
              <div style={{width:'50px', height:'50px', background:'#eff6ff', color:'#2563eb', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', fontSize:'1.2rem'}}>
                {item.alumno.nombre[0]}
              </div>
              <div>
                <h4 style={{margin:0, color:'#1e293b'}}>{item.alumno.nombre} {item.alumno.apellido}</h4>
                <p style={{margin:0, fontSize:'0.85rem', color:'#64748b'}}>{item.alumno.carrera}</p>
              </div>
            </div>
            
            {/* Panel de datos: nombre de la oferta y estado de la postulación */}
            <div style={{background:'#f8fafc', padding:'15px', borderRadius:'12px', marginBottom:'20px'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                <span style={{fontSize:'0.8rem', color:'#94a3b8'}}>Aplicó a:</span>
                <span style={{fontSize:'0.8rem', color:'#1e293b', fontWeight:'700'}}>{item.oferta.titulo}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <span style={{fontSize:'0.8rem', color:'#94a3b8'}}>Estado:</span>
                {/* Color del estado: amarillo=pendiente, verde=match, rojo=rechazado */}
                <span style={{
                    fontSize:'0.75rem', 
                    fontWeight:'800',
                    color: item.estado === 'pendiente' ? '#b45309' : (item.estado === 'visto' ? '#059669' : '#dc2626')
                }}>{item.estado === 'visto' ? 'MATCH' : item.estado.toUpperCase()}</span>
              </div>
            </div>

            {/* Acciones: botón principal de evaluación + acceso rápido al CV */}
            <div style={{display:'flex', gap:'10px'}}>
              {/* Al hacer clic, navega a MisOfertas con la oferta y el alumno específico ya seleccionados */}
              <button 
                onClick={() => navigate('/empresa/ofertas', { state: { openOfertaId: item.oferta.oferta_id, openAlumnoId: item.alumno.alumno_id } })}
                style={{
                    flex:1, 
                    padding:'10px', 
                    background:'#eff6ff', 
                    color:'#2563eb', 
                    border:'none', 
                    borderRadius:'10px', 
                    fontWeight:'700', 
                    cursor:'pointer', 
                    fontSize:'0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = '#2563eb';
                    e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = '#eff6ff';
                    e.currentTarget.style.color = '#2563eb';
                }}
              >
                <span>🔍</span> Ver Perfil y Evaluar
              </button>
              {/* Botón de CV: solo visible si el alumno subió su currículum */}
              {item.alumno.cv_url && (
                <button 
                  onClick={() => window.open(item.alumno.cv_url, '_blank')}
                  style={{padding:'10px', background:'none', border:'1px solid #e2e8f0', color:'#64748b', borderRadius:'10px', cursor:'pointer'}}
                >
                  📄
                </button>
              )}
            </div>
          </div>
        )) : (
            <div style={{gridColumn:'1/-1', textAlign:'center', padding:'100px', background:'white', borderRadius:'20px', border:'2px dashed #e2e8f0', color:'#94a3b8'}}>
                Aún no tienes candidatos en tu base de datos profesional.
            </div>
        )}
      </div>
    </div>
  );
};

export default CandidatosEmpresa;
