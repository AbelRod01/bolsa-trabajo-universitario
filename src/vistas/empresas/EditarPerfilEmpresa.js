/**
 * EDITAR PERFIL EMPRESA (EditarPerfilEmpresa.js)
 * ─────────────────────────────────────────────────────
 * Formulario de edición del perfil corporativo de la empresa.
 * Incluye 3 secciones: Información Básica, Contacto y Cultura/Beneficios.
 *
 * Al guardar, actualiza el registro en la tabla 'empresa' de Supabase
 * y sincroniza el estado global de React vía setUsuario(data).
 * Esto activa inmediatamente la validación de "Perfil Completo".
 *
 * CAMPOS REQUERIDOS PARA PERFIL COMPLETO (validados en MenuPrincipalEmpresa.js):
 *   sector, descripcion, ubicacion, contacto_telefono, beneficios, tamano_empresa, fundada_en
 */
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import './css/VistasEmpresa.css';

const EditarPerfilEmpresa = ({ usuario, setUsuario, onCancel, onSave }) => {
  // --- ESTADOS DEL FORMULARIO ---
  // Cada campo inicializado con el valor actual del usuario o vacío si no existe
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [sector, setSector] = useState(usuario?.sector || '');
  const [ubicacion, setUbicacion] = useState(usuario?.ubicacion || '');
  const [sitioWeb, setSitioWeb] = useState(usuario?.sitio_web || '');
  const [telefono, setTelefono] = useState(usuario?.contacto_telefono || '');
  const [descripcion, setDescripcion] = useState(usuario?.descripcion || '');
  const [beneficios, setBeneficios] = useState(usuario?.beneficios || '');
  const [tamano, setTamano] = useState(usuario?.tamano_empresa || '');
  const [fundacion, setFundacion] = useState(usuario?.fundada_en || '');
  
  const [cargando, setCargando] = useState(false); // Bloquea el botón de guardar durante la operación

  // --- FUNCIÓN: GUARDAR CAMBIOS EN SUPABASE ---
  const guardarCambios = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario HTML
    setCargando(true);

    try {
      const { data, error } = await supabase
        .from('empresa')
        .update({
          nombre,
          sector,
          ubicacion,
          sitio_web: sitioWeb,
          contacto_telefono: telefono,
          descripcion,
          beneficios,
          tamano_empresa: tamano,
          fundada_en: fundacion
        })
        .eq('empresa_id', usuario.empresa_id)
        .select()   // Retorna el registro actualizado
        .single();

      if (error) throw error;

      if (data) {
        // Actualizamos el estado global: esto reactiva la validación de "Perfil Completo"
        // en MenuPrincipalEmpresa.js y desbloquea el acceso al Dashboard completo
        setUsuario(data);
        alert("¡Perfil corporativo actualizado con éxito!");
        onSave(); // Navega de regreso a la vista de perfil
      }
    } catch (error) {
      alert("Error al actualizar: " + error.message);
    } finally {
      setCargando(false); // Siempre desbloqueamos el botón al terminar
    }
  };

  return (
    <div className="editar-perfil-empresa-container">
      {/* ── CABECERA: TÍTULO Y BOTÓN CANCELAR ── */}
      <div className="detalle-oferta-header">
        <button className="btn-volver" onClick={onCancel}>← Cancelar</button>
        <h2>Editar Perfil Profesional de Empresa</h2>
      </div>

      <div className="editar-oferta-form" style={{maxWidth: "900px", margin: "0 auto"}}>
        <form className="form-oferta" onSubmit={guardarCambios}>
          
          {/* ── SECCIÓN 1: Información Básica ── */}
          <section className="form-seccion-empresa" style={{marginBottom: '30px'}}>
            <h3 style={{color: '#059669', borderBottom: '2px solid #ecfdf5', paddingBottom: '10px', marginBottom: '20px'}}>
              Información Básica
            </h3>
            <div className="form-grid-empresa" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
               <div className="form-group">
                 <label>Nombre de la Organización</label>
                 <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
               </div>
               <div className="form-group">
                 <label>Sector Industrial</label>
                 <input type="text" value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Ej: Tecnología, Logística..." />
               </div>
               <div className="form-group">
                 <label>Año de Fundación</label>
                 <input type="text" value={fundacion} onChange={(e) => setFundacion(e.target.value)} placeholder="Ej: 1995" />
               </div>
               <div className="form-group">
                 <label>Tamaño de la Empresa</label>
                 {/* Dropdown con rangos predefinidos de tamaño */}
                 <select value={tamano} onChange={(e) => setTamano(e.target.value)}>
                    <option value="">Seleccionar...</option>
                    <option value="1-10 empleados">1-10 empleados (Startup)</option>
                    <option value="11-50 empleados">11-50 empleados (Pyme)</option>
                    <option value="51-200 empleados">51-200 empleados (Mediana)</option>
                    <option value="201-500 empleados">201-500 empleados (Grande)</option>
                    <option value="500+ empleados">500+ empleados (Corporativo)</option>
                 </select>
               </div>
            </div>
          </section>

          {/* ── SECCIÓN 2: Contacto y Redes ── */}
          <section className="form-seccion-empresa" style={{marginBottom: '30px'}}>
            <h3 style={{color: '#059669', borderBottom: '2px solid #ecfdf5', paddingBottom: '10px', marginBottom: '20px'}}>
              Contacto y Redes
            </h3>
            <div className="form-grid-empresa" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
               <div className="form-group">
                 <label>Sede Principal (Ubicación)</label>
                 <input type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Ej: Av. Reforma, CDMX" />
               </div>
               <div className="form-group">
                 <label>Sitio Web Oficial</label>
                 {/* type="url" valida que sea una URL válida con https:// */}
                 <input type="url" value={sitioWeb} onChange={(e) => setSitioWeb(e.target.value)} placeholder="https://www.ejemplo.com" />
               </div>
               <div className="form-group">
                 <label>Teléfono de Reclutamiento</label>
                 <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
               </div>
            </div>
          </section>

          {/* ── SECCIÓN 3: Cultura y Beneficios ── */}
          <section className="form-seccion-empresa">
            <h3 style={{color: '#059669', borderBottom: '2px solid #ecfdf5', paddingBottom: '10px', marginBottom: '20px'}}>
              Cultura y Beneficios
            </h3>
            <div className="form-group">
              <label>Descripción de la Empresa (Misión y Visión)</label>
              <textarea 
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)}
                rows="4"
                placeholder="Cuéntales a los alumnos por qué deberían trabajar contigo..."
              ></textarea>
            </div>
            <div className="form-group" style={{marginTop: '20px'}}>
              <label>Beneficios de trabajar aquí (Ej: Seguro, Home Office, Cursos)</label>
              <textarea 
                value={beneficios} 
                onChange={(e) => setBeneficios(e.target.value)}
                rows="4"
                placeholder={"Ej: - Seguro de gastos médicos mayores.\n- Modalidad 100% Remota.\n- Apoyo para certificaciones técnicas..."}
              ></textarea>
            </div>
          </section>

          {/* ── BOTÓN DE GUARDADO ── */}
          {/* disabled durante la operación para prevenir doble envío */}
          <div style={{display: "flex", gap: "12px", marginTop: "40px"}}>
            <button type="submit" className="btn-guardar-cambios" style={{flex: 1, backgroundColor: "#059669"}} disabled={cargando}>
              {cargando ? 'Guardando en Base de Datos...' : 'Actualizar Perfil Profesional Corporativo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPerfilEmpresa;
