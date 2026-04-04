import React, { useState } from "react";
import "./css/MenuPrincipal.css";
import {
  IconoMapa,
  IconoDolar,
} from "../../componentes/Iconos";
import LayoutEstudiante from "./LayoutEstudiante";
import DetalleOferta from "./DetalleOferta";
import PerfilEstudiante from "./PerfilEstudiante";
import EditarPerfilEstudiante from "./EditarPerfilEstudiante";
import NotificacionesEstudiante from "./NotificacionesEstudiante";

const MenuPrincipalEstudiante = ({ onLogout }) => {
  const [vistaActual, setVistaActual] = useState("inicio");
  const [filtroActivo, setFiltroActivo] = useState("todo");
  const [paginaActual, setPaginaActual] = useState(1);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);
  const ofertasPorPagina = 12; // Para grid de 3x4

  // Generamos 200 ofertas de mock variadas
  const ofertasData = Array.from({ length: 200 }, (_, i) => ({
    id: i + 1,
    titulo: [
      "Desarrollador Frontend Junior",
      "Analista de Datos",
      "Practicante UI/UX",
      "Backend Dev Node.js",
      "QA Engineer",
      "Project Manager Jr",
      "Soporte Técnico",
      "Marketing Digital",
      "DevOps Trainee",
      "Ciberseguridad Junior",
    ][i % 10],
    empresa: [
      "Tech Innovators",
      "Data Solutions",
      "Creative Studio",
      "Global Tech",
      "Fast Code",
    ][i % 5],
    ubicacion: ["CDMX", "Monterrey", "Guadalajara", "Queretaro", "Remoto"][
      i % 5
    ],
    modalidad: ["Tiempo Completo", "Híbrido", "Medio Tiempo"][i % 3],
    salario: `${(i + 10) * 1000} - ${(i + 15) * 1000} MXN`,
    match: 0,
    estaSeleccionado: i === 0 || i === 7, // Matches reales
    estaPostulado: i === 3 || i === 10, // Postulaciones enviadas (en espera)
    esRemoto: i % 5 === 4,
  }));

  // Lógica de filtrado
  const ofertasFiltradas = ofertasData.filter((oferta) => {
    if (filtroActivo === "todo") return true;
    if (filtroActivo === "remoto") return oferta.esRemoto;
    if (filtroActivo === "matches") return oferta.estaSeleccionado;
    return true;
  });

  // Lógica de paginación
  const totalPaginas = Math.ceil(ofertasFiltradas.length / ofertasPorPagina);
  const indiceUltimoItem = paginaActual * ofertasPorPagina;
  const indicePrimerItem = indiceUltimoItem - ofertasPorPagina;
  const ofertasPaginadas = ofertasFiltradas.slice(
    indicePrimerItem,
    indiceUltimoItem,
  );

  const cambiarPagina = (num) => {
    setPaginaActual(num);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const obtenerPaginasAMostrar = () => {
    const paginas = [];
    const r = 1; // Rango de páginas antes y después

    // Siempre incluimos la primera
    paginas.push(1);

    // Calculamos el inicio y fin del rango alrededor de la actual
    let inicio = Math.max(2, paginaActual - r);
    let fin = Math.min(totalPaginas - 1, paginaActual + r);

    // Si hay salto entre la primera y el inicio del rango, añadimos puntos
    if (inicio > 2) paginas.push("...");

    // Añadimos el rango intermedio
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    // Si hay salto entre el fin del rango y la última página, añadimos puntos
    if (fin < totalPaginas - 1) paginas.push("...");

    // Siempre añadimos la última página si hay más de una
    if (totalPaginas > 1) {
      paginas.push(totalPaginas);
    }

    return paginas;
  };

  if (ofertaSeleccionada) {
    return (
      <DetalleOferta 
        oferta={ofertaSeleccionada} 
        onBack={() => setOfertaSeleccionada(null)} 
        onLogout={onLogout} 
      />
    );
  }

  return (
    <LayoutEstudiante 
      onLogout={onLogout} 
      vistaActual={vistaActual === 'editar_perfil' ? 'perfil' : vistaActual} 
      onCambiarVista={setVistaActual}
    >
      {vistaActual === 'editar_perfil' ? (
        <EditarPerfilEstudiante 
          onCancel={() => setVistaActual('perfil')} 
          onSave={() => setVistaActual('perfil')} 
        />
      ) : vistaActual === 'notificaciones' ? (
        <NotificacionesEstudiante />
      ) : vistaActual === 'perfil' ? (
        <PerfilEstudiante onEditClick={() => setVistaActual('editar_perfil')} />
      ) : (
        <>
          <div className="feed-header">
            <h2>Ofertas para ti ({ofertasFiltradas.length})</h2>
            <div className="feed-filters">
              <button
                className={`filter-chip ${filtroActivo === "todo" ? "active" : ""}`}
                onClick={() => {
                  setFiltroActivo("todo");
                  setPaginaActual(1);
                }}
              >
                Todo
              </button>
              <button
                className={`filter-chip ${filtroActivo === "remoto" ? "active" : ""}`}
                onClick={() => {
                  setFiltroActivo("remoto");
                  setPaginaActual(1);
                }}
              >
                Remoto
              </button>
              <button
                className={`filter-chip ${filtroActivo === "matches" ? "active" : ""}`}
                onClick={() => {
                  setFiltroActivo("matches");
                  setPaginaActual(1);
                }}
              >
                Matches
              </button>
            </div>
          </div>

          <div className="jobs-grid">
        {ofertasPaginadas.map((oferta) => (
          <div key={oferta.id} className="job-card" onClick={() => setOfertaSeleccionada(oferta)}>
            <div className="job-card-header">
              <div className="company-logo-placeholder">
                {oferta.empresa[0]}
              </div>
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
              <div className="detail-item">
                <IconoDolar />
                <span>{oferta.salario}</span>
              </div>
            </div>
            <div className="job-card-footer">
              {oferta.estaSeleccionado ? (
                <div className="match-status-mini">
                  <span className="match-badge-success">
                    Match Confirmado
                  </span>
                </div>
              ) : oferta.estaPostulado ? (
                <div className="postulacion-status">
                  <span className="postulacion-badge">Enviada</span>
                </div>
              ) : (
                <button className="apply-btn-small">Postularme</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPaginas > 1 && (
        <div className="pagination">
          <button
            disabled={paginaActual === 1}
            onClick={() => cambiarPagina(paginaActual - 1)}
            className="pagination-arrow"
          >
            <span className="pagination-text">Anterior</span>
            <span className="pagination-icon">←</span>
          </button>

          {obtenerPaginasAMostrar().map((p, index) =>
            p === "..." ? (
              <span key={`dots-${index}`} className="pagination-dots">
                ...
              </span>
            ) : (
              <button
                key={p}
                className={paginaActual === p ? "active" : ""}
                onClick={() => cambiarPagina(p)}
              >
                {p}
              </button>
            ),
          )}

          <button
            disabled={paginaActual === totalPaginas}
            onClick={() => cambiarPagina(paginaActual + 1)}
            className="pagination-arrow"
          >
            <span className="pagination-text">Siguiente</span>
            <span className="pagination-icon">→</span>
          </button>
        </div>
      )}
        </>
      )}
    </LayoutEstudiante>
  );
};

export default MenuPrincipalEstudiante;
