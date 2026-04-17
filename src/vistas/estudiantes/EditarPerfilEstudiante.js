/**
 * EDITAR PERFIL ESTUDIANTE (EditarPerfilEstudiante.js)
 * ─────────────────────────────────────────────────────
 * Formulario de edición del perfil profesional del alumno.
 * Permite actualizar todos los campos del perfil y subir un nuevo CV en PDF.
 *
 * FLUJO DE GUARDADO:
 *   1. Si el usuario seleccionó un nuevo archivo PDF → se sube a Supabase Storage (bucket 'curriculums')
 *   2. Se obtiene la URL pública del archivo subido
 *   3. Se actualiza el registro en la tabla 'alumno' con todos los datos nuevos
 *   4. Se actualiza el estado global del usuario en React para reflejar el cambio inmediatamente
 */
import React, { useState } from 'react';
import './css/EditarPerfilEstudiante.css';
import { supabase } from '../../supabaseClient';

const EditarPerfilEstudiante = ({ usuario, setUsuario, onCancel, onSave }) => {
  // --- ESTADOS DEL FORMULARIO ---
  // Cada campo del formulario tiene su propio estado inicializado con los datos actuales del usuario
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [apellido, setApellido] = useState(usuario?.apellido || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [descripcion, setDescripcion] = useState(usuario?.descripcion || '');
  const [habilidades, setHabilidades] = useState(usuario?.habilidades || '');
  const [universidad, setUniversidad] = useState(usuario?.universidad || '');
  const [carrera, setCarrera] = useState(usuario?.carrera || '');
  const [periodoEducacion, setPeriodoEducacion] = useState(usuario?.periodo_educacion || '');
  const [proyectos, setProyectos] = useState(usuario?.proyectos || '');
  
  const [archivoCV, setArchivoCV] = useState(null);  // El archivo PDF seleccionado por el usuario
  const [cargando, setCargando] = useState(false);    // Bloquea el botón durante el guardado

  // Lista de carreras disponibles en la plataforma (debe coincidir con la tabla 'carrera' en la BD)
  const CARRERAS = [
    "Ingeniería Industrial",
    "Ingeniería Mecánica",
    "Ingeniería Electrónica",
    "Ingeniería en Informática",
    "Ingeniería Civil",
    "Ingeniería Agronómica",
    "Ingeniería en Producción Animal",
    "Ingeniería Ambiental",
    "Ingeniería Agroindustrial"
  ];

  // --- FUNCIÓN: SUBIR CV A SUPABASE STORAGE ---
  // Sube un archivo PDF al bucket 'curriculums' y retorna la URL pública resultante.
  // El registro del alumno se actualiza con esa URL en cv_url.
  const subirCV = async (alumnoId) => {
    if (!archivoCV) return usuario?.cv_url; // Si no cambió, devuelve la URL existente

    // Nombre de archivo único para evitar colisiones en el bucket
    const fileExt = archivoCV.name.split('.').pop();
    const fileName = `cv_${alumnoId}_${Date.now()}.${fileExt}`;

    console.log("Subiendo CV a Storage:", fileName);

    // Subir el PDF al bucket 'curriculums' de Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('curriculums')
      .upload(fileName, archivoCV, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Error al subir CV:", uploadError);
      if (uploadError.message.includes("policy")) {
         throw new Error("Permiso denegado en Supabase Storage. Revisa las Policies del bucket 'curriculums'.");
      }
      throw uploadError;
    }

    // Obtener la URL pública del archivo para guardarla en alumno.cv_url
    const { data } = supabase.storage
      .from('curriculums')
      .getPublicUrl(fileName);

    console.log("URL pública generada:", data.publicUrl);
    return data.publicUrl;
  };

  // --- FUNCIÓN PRINCIPAL: GUARDAR TODO EL PERFIL ---
  const guardarTodo = async () => {
    setCargando(true);
    console.log("Iniciando proceso de guardado...");
    
    try {
      let urlFinalCV = usuario?.cv_url;

      // Paso 1: Subir el CV si el usuario seleccionó un archivo nuevo
      if (archivoCV) {
        urlFinalCV = await subirCV(usuario.alumno_id);
      }

      // Paso 2: Actualizar todos los campos del perfil en la tabla 'alumno'
      const { data, error } = await supabase
        .from('alumno')
        .update({ 
          nombre, 
          apellido, 
          telefono,
          descripcion,
          habilidades,
          universidad,
          carrera,
          periodo_educacion: periodoEducacion,
          proyectos,
          cv_url: urlFinalCV
        })
        .eq('alumno_id', usuario.alumno_id)
        .select()   // Devolvemos el registro actualizado para sincronizar el estado
        .single();

      if (error) throw error;

      if (data) {
        setUsuario(data);  // Paso 3: Actualizamos el estado global del usuario en React
        alert("¡Perfil profesional actualizado exitosamente!");
        onSave(); // Navegamos de vuelta a la vista de perfil
      }
    } catch (error) {
      console.error("ERROR AL GUARDAR:", error);
      alert("⚠️ Error: " + (error.message || "No se pudo conectar con Supabase. Verifica tu conexión o el Storage."));
    } finally {
      setCargando(false); // Siempre desbloqueamos el botón al terminar
    }
  };

  return (
    <div className="editar-perfil-container">
      {/* ── CABECERA: TÍTULO Y BOTONES DE ACCIÓN (duplicados arriba y abajo) ── */}
      <div className="editar-perfil-header">
        <h2>Completar Perfil Profesional</h2>
        <div className="editar-acciones-header">
          <button className="btn-cancelar" onClick={onCancel} disabled={cargando}>Cancelar</button>
          <button className="btn-guardar" onClick={guardarTodo} disabled={cargando}>
            {cargando ? 'Guardando...' : 'Guardar Perfil'}
          </button>
        </div>
      </div>

      <div className="editar-perfil-form">
        
        {/* ── SECCIÓN 1: Datos personales y CV ── */}
        <section className="form-seccion">
          <h3>Información de Contacto e Identidad</h3>
          <div className="form-grid">
            <div className="form-grupo">
              <label>Nombre(s)</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="input-estilizado" />
            </div>
            <div className="form-grupo">
              <label>Apellidos</label>
              <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} className="input-estilizado" />
            </div>
            <div className="form-grupo">
              <label>Teléfono Celular (Para contacto de empresas)</label>
              <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="input-estilizado" placeholder="Ej. 5512345678" />
            </div>
            <div className="form-grupo">
              <label>Curriculum Vitae (Solo PDF)</label>
              {/* El input de archivo solo acepta PDFs */}
              <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => setArchivoCV(e.target.files[0])} 
                className="input-estilizado" 
              />
              {/* Confirmación visual del archivo seleccionado */}
              {archivoCV && (
                <p style={{fontSize: '0.85rem', color: '#2563eb', marginTop: '5px', fontWeight: 'bold'}}>
                  ✓ Seleccionado: {archivoCV.name}
                </p>
              )}
              {/* Aviso de que el CV anterior se mantiene si no se sube uno nuevo */}
              {usuario?.cv_url && !archivoCV && (
                <p style={{fontSize: '0.8rem', color: 'green', marginTop: '5px'}}>
                  ✓ Tienes un archivo guardado (Se mantendrá si no eliges otro)
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 2: Perfil profesional y habilidades ── */}
        <section className="form-seccion">
          <h3>Perfil y Habilidades</h3>
          <div className="form-grupo">
            <label>Descripción Personal (¿Quién eres y qué buscas?)</label>
            <textarea 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)}
              className="input-estilizado textarea-estilizado" 
              rows="3"
            ></textarea>
          </div>
          <div className="form-grupo" style={{marginTop: '15px'}}>
            {/* Las habilidades se guardan separadas por comas */}
            <label>Habilidades (Ej: React, SQL, Excel Avanzado)</label>
            <input 
              type="text" 
              value={habilidades} 
              onChange={(e) => setHabilidades(e.target.value)}
              className="input-estilizado" 
            />
          </div>
        </section>

        {/* ── SECCIÓN 3: Formación académica ── */}
        <section className="form-seccion">
          <h3>Formación Académica</h3>
          <div className="form-grid">
            <div className="form-grupo">
              <label>Universidad</label>
              <input type="text" value={universidad} onChange={(e) => setUniversidad(e.target.value)} className="input-estilizado" />
            </div>
            <div className="form-grupo">
              <label>Carrera / Especialidad</label>
              {/* Dropdown de selección: el valor seleccionado es el VARCHAR que se guarda en alumno.carrera */}
              <select 
                value={carrera} 
                onChange={(e) => setCarrera(e.target.value)} 
                className="input-estilizado"
                style={{background: 'white'}}
              >
                <option value="">Selecciona tu carrera...</option>
                {CARRERAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-grupo">
              <label>Periodo (Ej. 2021 - 2025)</label>
              <input type="text" value={periodoEducacion} onChange={(e) => setPeriodoEducacion(e.target.value)} className="input-estilizado" />
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 4: Proyectos y experiencia ── */}
        <section className="form-seccion">
          <h3>Proyectos Relevantes</h3>
          <div className="form-grupo">
            <label>Menciona tus logros o proyectos destacados</label>
            <textarea 
              value={proyectos} 
              onChange={(e) => setProyectos(e.target.value)}
              className="input-estilizado textarea-estilizado" 
              rows="4"
            ></textarea>
          </div>
        </section>

        {/* ── PIE: Botones de acción duplicados para mayor comodidad ── */}
        <div className="editar-acciones-footer">
          <button className="btn-cancelar" onClick={onCancel} disabled={cargando}>Cancelar</button>
          <button className="btn-guardar" onClick={guardarTodo} disabled={cargando}>
            {cargando ? 'Actualizando base de datos...' : 'Guardar y Finalizar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfilEstudiante;
