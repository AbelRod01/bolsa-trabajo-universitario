/**
 * PERFIL EMPRESA (PerfilEmpresa.js)
 * ─────────────────────────────────────────────────────
 * Vista de solo lectura del perfil corporativo de la empresa.
 * Muestra toda la información pública que los estudiantes y el sistema usan:
 *   - Nombre, sector e información básica
 *   - Descripción corporativa (Misión/Visión)
 *   - Beneficios para los trabajadores
 *   - Datos de contacto (email, teléfono, sitio web)
 *
 * Nota: Para modificar datos se usa EditarPerfilEmpresa.js
 */
import React from 'react';
import './css/VistasEmpresa.css';

const PerfilEmpresa = ({ usuario, onEditClick }) => {
  // Valores por defecto para evitar errores si el perfil está incompleto
  const nombreEmpresa = usuario?.nombre || "Empresa Registrada";
  const sectorEmpresa = usuario?.sector || "Sector no especificado";

  return (
    <div className="mis-ofertas-container">
      
      {/* ── TARJETA DE CABECERA ── */}
      {/* Muestra el logo-inicial, nombre, sector, tamaño, año de fundación y botón de edición */}
      <div className="empresa-header-card">
        {/* Avatar de empresa: la primera letra del nombre */}
        <div className="empresa-logo-grande">
          {nombreEmpresa[0].toUpperCase()}
        </div>
        <div className="empresa-info-principal">
          <h1>{nombreEmpresa}</h1>
          <div className="empresa-badges">
            <span className="oferta-empresa-badge activa">{sectorEmpresa}</span>
            <span className="empresa-ubicacion" style={{marginLeft: '15px'}}>📍 {usuario?.ubicacion || "Ubicación no especificada"}</span>
          </div>
          {/* Metadatos de la empresa: tamaño y año de fundación */}
          <div style={{marginTop: '10px', fontSize: '0.85rem', color: '#64748b'}}>
            🏢 {usuario?.tamano_empresa || "Tamaño no especificado"} • 📅 Fundada en {usuario?.fundada_en || "---"}
          </div>
        </div>
        <button className="btn-crear-oferta" onClick={onEditClick} style={{marginLeft: 'auto', background: '#1e293b'}}>
          Editar Perfil
        </button>
      </div>

      {/* ── CUADRÍCULA DE INFORMACIÓN DETALLADA ── */}
      <div className="panels-grid" style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px'}}>
        
        {/* Columna izquierda: Descripción corporativa y Beneficios */}
        <div className="columna-izquierda" style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            {/* Panel "Sobre Nosotros": la misión y visión de la empresa */}
            <div className="dashboard-panel">
                <div className="panel-header">
                    <h3>Sobre Nosotros</h3>
                </div>
                {/* pre-wrap respeta los saltos de línea que el usuario escribió en la edición */}
                <p style={{whiteSpace: 'pre-wrap', color: '#475569', lineHeight: '1.6', padding: '24px'}}>
                    {usuario?.descripcion || "Aún no has agregado una descripción corporativa. Completa tu perfil para que los estudiantes conozcan tu empresa."}
                </p>
            </div>

            {/* Panel de Beneficios: qué ofrece la empresa a sus empleados */}
            <div className="dashboard-panel">
                <div className="panel-header">
                    <h3>🎁 Beneficios de trabajar con nosotros</h3>
                </div>
                <p style={{whiteSpace: 'pre-wrap', color: '#065f46', lineHeight: '1.6', padding: '24px', background: '#f0fdf4', borderRadius: '0 0 20px 20px'}}>
                    {usuario?.beneficios || "Describe aquí los beneficios (Seguro, Sueldo, Home office, etc.) que ofreces a los estudiantes."}
                </p>
            </div>
        </div>

        {/* Columna derecha: Datos de Contacto Oficiales */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Contacto Oficial</h3>
          </div>
          <div className="panel-list" style={{padding: '24px'}}>
            {/* Email corporativo */}
            <div className="info-item" style={{marginBottom: '20px', display: 'flex', flexDirection: 'column'}}>
              <span style={{color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Email Corporativo</span>
              <span style={{fontWeight: '600', color: '#1e293b'}}>{usuario?.email}</span>
            </div>
            {/* Teléfono de reclutamiento */}
            <div className="info-item" style={{marginBottom: '20px', display: 'flex', flexDirection: 'column'}}>
              <span style={{color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Teléfono Reclutamiento</span>
              <span style={{fontWeight: '600', color: '#1e293b'}}>{usuario?.contacto_telefono || "No especificado"}</span>
            </div>
            {/* Sitio web: se muestra como enlace clickable si existe */}
            <div className="info-item" style={{display: 'flex', flexDirection: 'column'}}>
              <span style={{color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Sitio Web</span>
              {usuario?.sitio_web ? (
                 <a href={usuario.sitio_web} target="_blank" rel="noopener noreferrer" style={{color: '#2563eb', fontWeight: 'bold', textDecoration: 'none'}}>
                   {usuario.sitio_web}
                 </a>
              ) : (
                 <span style={{fontWeight: '600', color: '#1e293b'}}>No especificado</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilEmpresa;
