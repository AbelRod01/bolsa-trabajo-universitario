/**
 * DETALLE OFERTA (DetalleOferta.js)
 * ─────────────────────────────────────────────────────────────────
 * Vista de detalle de una oferta laboral seleccionada.
 * Muestra la información completa de la vacante y permite al alumno postularse.
 *
 * PROP IMPORTANTE: onPostulacionExitosa
 *   Callback que llama a fetchOfertas() en el padre (MenuPrincipal)
 *   para refrescar la lista y que el botón cambie a "Postulado" si el alumno
 *   regresa al feed después de postularse.
 *
 * FLUJO DE POSTULACIÓN:
 *   1. Alumno hace clic en "Postularme Ahora"
 *   2. Se inserta un registro en la tabla POSTULACIÓN
 *   3. Se inserta una NOTIFICACIÓN para la empresa
 *   4. Se actualiza el estado local (yaPostulado = true)
 *   5. Se llama a onPostulacionExitosa para refrescar el feed padre
 *
 * PROTECCIÓN ANTI-DUPLICADO:
 *   El error code '23505' de PostgreSQL indica violación de UNIQUE (oferta_id, alumno_id)
 *   Si ocurre, simplemente marcamos como ya postulado en lugar de mostrar un error.
 */
import React, { useState } from 'react';
import LayoutEstudiante from './LayoutEstudiante';
import { IconoMapa, IconoDolar, IconoRayo } from '../../componentes/Iconos';
import { supabase } from '../../supabaseClient';

const DetalleOferta = ({ oferta, usuario, onBack, onLogout, perfilCompleto, onCambiarVista, onPostulacionExitosa }) => {
  // Estados locales del componente
  const [cargando, setCargando] = useState(false);                         // Bloquea el botón durante el envío
  const [yaPostulado, setYaPostulado] = useState(!!oferta?.estadoPostulacion); // true si ya existe una postulación

  if (!oferta) return null;

  // --- FUNCIÓN PRINCIPAL: MANEJAR POSTULACIÓN ---
  const manejarPostulacion = async () => {
    // Bloqueo de seguridad: si el perfil está incompleto, no se puede postular
    if (!perfilCompleto) {
      alert("⚠️ Acción denegada: Completa los datos de tu perfil primero.");
      return;
    }

    setCargando(true); // Deshabilita el botón durante el proceso
    try {
      // Insertar la postulación en la BD
      // La constraint UNIQUE(oferta_id, alumno_id) previene duplicados a nivel de BD
      const { data: posData, error } = await supabase
        .from('postulacion')
        .insert([
          { 
            oferta_id: oferta.oferta_id,  // ID unificado, no usar oferta.id
            alumno_id: usuario.alumno_id,
            estado: 'pendiente'
          }
        ]).select().single();

      if (error) {
        // Error 23505 = violación de UNIQUE: el alumno ya se había postulado
        if (error.code === '23505') {
          alert("📋 Nota: Ya te habías postulado a esta vacante anteriormente. ¡Tu perfil ya está en manos de la empresa!");
          setYaPostulado(true);
        } else {
          throw error;
        }
      } else {
        // Paso 2: Notificar a la empresa sobre la nueva postulación
        await supabase.from('notificacion').insert([
          {
            destinatario_tipo: 'empresa',
            destinatario_id: oferta.empresa_id,
            canal: 'app',
            tipo: 'postulacion',
            postulacion_id: posData?.postulacion_id || null, // Vinculamos la notificación a la postulación
            contenido: `👋 ¡Nuevo Candidato! El alumno ${usuario.nombre} ${usuario.apellido} se ha postulado para tu vacante: ${oferta.titulo}.`
          }
        ]);
        alert("¡Postulación enviada con éxito! La empresa ha sido notificada.");
        setYaPostulado(true);
        // Paso 3: Refrescamos la lista de ofertas en el padre para que el botón
        // cambie a "Postulado" si el alumno regresa al feed principal
        if (onPostulacionExitosa) onPostulacionExitosa();
      }
    } catch (error) {
       alert("Error al enviar postulación: " + error.message);
    } finally {
      setCargando(false); // Siempre desbloqueamos el botón al terminar
    }
  };

  return (
    <LayoutEstudiante onLogout={onLogout} usuario={usuario} onCambiarVista={onCambiarVista} vistaActual="inicio">
      <div style={{
        animation: 'fadeIn 0.4s ease-out',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <button 
          className="back-btn" 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color 0.2s'
          }}
        >
          ← Volver a las ofertas
        </button>

        {/* HEADER MODERNO - Adaptable */}
        <div style={{
          background: 'white',
          padding: 'clamp(20px, 5vw, 40px)',
          borderRadius: '30px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          marginBottom: '30px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decoración de fondo */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: '50%',
            opacity: 0.6
          }}></div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', zIndex: 1, minWidth: '280px' }}>
            <div style={{
              width: 'clamp(60px, 10vw, 90px)',
              height: 'clamp(60px, 10vw, 90px)',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: '800',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)'
            }}>
              {oferta.empresa[0]}
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <h1 style={{ margin: 0, color: '#0f172a', fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', fontWeight: '900', lineHeight: 1.2 }}>{oferta.titulo}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '12px', color: '#64748b', fontWeight: '500' }}>
                <span style={{fontSize: '0.9rem'}}>{oferta.empresa}</span>
                <span style={{ 
                    background: '#eff6ff', 
                    color: '#1e40af', 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem',
                    fontWeight: '700'
                }}>🎓 {oferta.carrera}</span>
              </div>
            </div>
          </div>

          <div style={{ zIndex: 1, width: '100%', maxWidth: '300px' }}>
             {/* ── ESTADOS DE POSTULACIÓN ── */}
             {/* Se muestra un badge de color según el estado actual de la postulación */}
             
             {/* Estado PENDIENTE o recién enviada (estado local yaPostulado) */}
             {(oferta.estadoPostulacion === 'pendiente' || (yaPostulado && !oferta.estadoPostulacion)) && (
                <span style={{width: '100%', textAlign: 'center', background: '#fef3c7', color: '#92400e', padding: '14px', borderRadius: '16px', fontSize: '0.9rem', fontWeight: '800', display: 'block', border:'1px solid #fde68a'}}>
                  ⏳ Postulación Enviada
                </span>
             )}
             {oferta.estadoPostulacion === 'visto' && (
                <span style={{width: '100%', textAlign: 'center', background: '#dcfce7', color: '#166534', padding: '14px', borderRadius: '16px', fontSize: '0.9rem', fontWeight: '800', display: 'block', border:'1px solid #bbf7d0'}}>
                  🤝 ¡Has hecho Match!
                </span>
             )}
             {oferta.estadoPostulacion === 'rechazado' && (
                <span style={{width: '100%', textAlign: 'center', background: '#fee2e2', color: '#991b1b', padding: '14px', borderRadius: '16px', fontSize: '0.9rem', fontWeight: '800', display: 'block', border:'1px solid #fecaca'}}>
                  ❌ No seleccionado
                </span>
             )}
             
             {(oferta.estadoPostulacion === 'rechazado' || !oferta.estadoPostulacion) && !yaPostulado && (
                <button 
                  onClick={manejarPostulacion}
                  disabled={cargando}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '18px',
                    fontWeight: '800',
                    cursor: cargando ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)',
                    transition: 'all 0.2s',
                    opacity: !perfilCompleto ? 0.6 : 1
                  }}
                >
                  {cargando ? "Enviando..." : "🚀 Postularme Ahora"}
                </button>
             )}
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL - Adaptable */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
          <div style={{
            flex: '1',
            minWidth: 'min(100%, 650px)',
            background: 'white',
            padding: 'clamp(20px, 5vw, 40px)',
            borderRadius: '30px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{fontSize:'1.3rem', color:'#0f172a', fontWeight:'900', marginBottom:'20px', display:'flex', alignItems:'center', gap:'12px'}}>
               <span style={{width:'4px', height:'24px', background:'#2563eb', borderRadius:'2px'}}></span>
               Descripción Detallada
            </h3>
            <div style={{
              lineHeight:'1.8', 
              color:'#475569', 
              whiteSpace:'pre-line', 
              fontSize:'1rem'
            }}>
              {oferta.descripcion_completa || "La empresa no ha proporcionado una descripción detallada todavía."}
            </div>
          </div>

          <aside style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: '#f8fafc',
              padding: '25px',
              borderRadius: '30px',
              border: '1px solid #e2e8f0',
            }}>
               <h4 style={{margin:'0 0 20px 0', color:'#0f172a', fontSize:'1rem', fontWeight:'800'}}>Resumen del Puesto</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <IconoMapa />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' }}>UBICACIÓN</span>
                    <span style={{ color: '#334155', fontWeight: '700', fontSize: '0.95rem' }}>{oferta.ubicacion}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <IconoRayo />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' }}>MODALIDAD</span>
                    <span style={{ color: '#334155', fontWeight: '700', fontSize: '0.95rem' }}>{oferta.modalidad}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                padding: '25px',
                borderRadius: '30px',
                color: 'white',
                textAlign: 'center'
            }}>
                <p style={{fontSize:'0.85rem', marginBottom:'10px', opacity:0.8}}>Tip Pro:</p>
                <p style={{fontSize:'0.75rem', lineHeight:'1.5'}}>Revisa tus habilidades antes de postularte. ¡Mucha suerte!</p>
            </div>
          </aside>
        </div>
      </div>
    </LayoutEstudiante>
  );
};

export default DetalleOferta;
