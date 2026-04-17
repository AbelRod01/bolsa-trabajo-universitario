import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./css/VistasEmpresa.css";
import { supabase } from "../../supabaseClient";

const MisOfertas = ({ usuario, perfilCompleto }) => {
  const location = useLocation();
  const [ofertasData, setOfertasData] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados de Navegación Interna
  const [vistaInterna, setVistaInterna] = useState("lista"); // 'lista', 'gestion', 'crear', 'detalle_alumno'
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [postulacionSeleccionada, setPostulacionSeleccionada] = useState(null);
  const [candidatos, setCandidatos] = useState([]);
  const [tabGestion, setTabGestion] = useState("candidatos"); // 'candidatos' o 'editar'

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

  // Estados de Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const ofertasPorPagina = 12;

  // Estados Formulario (Crear/Editar)
  const [form, setForm] = useState({
    titulo: "",
    ubicacion: "",
    modalidad: "Remoto",
    carrera: "",
    descripcion: "",
  });

  useEffect(() => {
    if (usuario) {
        cargarOfertas();
    }
  }, [usuario]);

  // EFECTO PARA ABRIR AUTOMÁTICAMENTE DESDE NOTIFICACIÓN O DASHBOARD
  useEffect(() => {
    console.log("Estado de navegación recibido:", location.state);
    if (location.state?.openOfertaId && ofertasData.length > 0) {
      console.log("Buscando oferta ID:", location.state.openOfertaId, "en", ofertasData.length, "ofertas");
      
      const oferta = ofertasData.find(o => String(o.oferta_id) === String(location.state.openOfertaId));
      
      if (oferta) {
          console.log("¡Oferta encontrada! Abriendo gestión de:", oferta.titulo);
          setOfertaSeleccionada(oferta);
          // Pre-cargar el formulario de edición con los datos actuales de la oferta
          setForm({
            titulo:      oferta.titulo      || "",
            ubicacion:   oferta.ubicacion   || "",
            modalidad:   oferta.modalidad   || "Remoto",
            carrera:     oferta.carrera     || "",
            descripcion: oferta.descripcion || "",
          });
          setVistaInterna("gestion");
          cargarCandidatos(oferta.oferta_id);
          
          // Limpiamos el estado para que no se repita al navegar internamente
          window.history.replaceState({}, document.title);
      } else {
          console.log("No se encontró la oferta en la lista de la empresa.");
      }
    }
  }, [location.state, ofertasData]);

  const cargarOfertas = async () => {
    setCargando(true);
    // JOIN con oferta_carrera para el nombre de carrera y con postulacion para el conteo de candidatos
    const { data, error } = await supabase
      .from("oferta_laboral")
      .select(`
        *,
        oferta_carrera (
          carrera (nombre)
        ),
        postulacion (postulacion_id, estado)
      `)
      .eq("empresa_id", usuario.empresa_id)
      .order("fecha_publicacion", { ascending: false });

    if (!error) {
      const formateadas = (data || []).map(o => ({
        ...o,
        carrera: o.oferta_carrera?.[0]?.carrera?.nombre || "",
        // Candidatos pendientes = postulaciones que NO son rechazadas ni ya tienen match
        candidatosPendientes: (o.postulacion || []).filter(p => p.estado === 'pendiente').length,
        // Total de candidatos (cualquier estado activo)
        totalCandidatos: (o.postulacion || []).filter(p => p.estado !== 'rechazado').length,
      }));
      setOfertasData(formateadas);
    }
    setCargando(false);
  };

  const cargarCandidatos = async (idOferta) => {
    const { data, error } = await supabase
      .from("postulacion")
      .select(
        `
        postulacion_id,
        estado,
        fecha_postulacion,
        alumno (
          alumno_id,
          nombre,
          apellido,
          email,
          carrera,
          universidad,
          cv_url,
          descripcion,
          telefono,
          habilidades
        )
      `,
      )
      .eq("oferta_id", idOferta)
      .neq("estado", "rechazado"); // No traer a los que ya descartamos

    if (!error) setCandidatos(data || []);
  };

  const handleEntrarGestion = (oferta) => {
    setOfertaSeleccionada(oferta);
    // Pre-cargar el formulario con los datos actuales de la oferta (con fallbacks para evitar campos null)
    setForm({
      titulo:      oferta.titulo      || "",
      ubicacion:   oferta.ubicacion   || "",
      modalidad:   oferta.modalidad   || "Remoto",
      carrera:     oferta.carrera     || "",
      descripcion: oferta.descripcion || "",
    });
    cargarCandidatos(oferta.oferta_id);
    setTabGestion("candidatos"); // Siempre abre en la pestaña de candidatos primero
    setVistaInterna("gestion");
  };

  // --- ACCIONES DE OFERTA ---
  const handleGuardarOferta = async (id = null) => {
    if (cargando) return; // Evitar disparos múltiples
    if (!form.titulo || !form.descripcion || !form.carrera) {
      alert("⚠️ Error: El título, la carrera y la descripción son obligatorios.");
      return;
    }

    setCargando(true);
    // Extraemos carrera del objeto para que no de error al insertar en oferta_laboral
    const { carrera, ...datosOferta } = form;
    
    const payload = {
      ...datosOferta,
      empresa_id: usuario.empresa_id,
      fecha_publicacion: new Date().toISOString()
    };

    // 1. Guardar o actualizar la oferta base (sin el campo carrera)
    const { data: ofertaData, error: errorOferta } = id
      ? await supabase.from("oferta_laboral").update(payload).eq("oferta_id", id).select().single()
      : await supabase.from("oferta_laboral").insert([payload]).select().single();

    if (errorOferta) {
        alert("Error en oferta: " + errorOferta.message);
        setCargando(false);
        return;
    }

    // 2. Vincular con la tabla relacional 'oferta_carrera'
    const idOfertaFinal = id || ofertaData.oferta_id;
    
    // Buscamos el ID de la carrera seleccionada
    const { data: catCarrera } = await supabase.from('carrera').select('carrera_id').eq('nombre', form.carrera).single();
    
    if (catCarrera) {
        // Limpiamos relaciones previas si es edición
        if (id) await supabase.from('oferta_carrera').delete().eq('oferta_id', id);
        
        // Insertamos la nueva relación
        await supabase.from('oferta_carrera').insert([{
            oferta_id: idOfertaFinal,
            carrera_id: catCarrera.carrera_id
        }]);
    }

    alert(id ? "¡Oferta actualizada!" : "¡Oferta publicada exitosamente!");
    setVistaInterna("lista");
    cargarOfertas();
    setCargando(false);
  };

  const handleEliminarOferta = async (id) => {
    const confirmar = window.confirm(
      "⚠️ ¿Estás seguro de eliminar esta vacante de forma permanente? Se perderán todos los datos de candidatos aplicados.",
    );
    if (!confirmar) return;

    setCargando(true);
    const { error } = await supabase
      .from("oferta_laboral")
      .delete()
      .eq("oferta_id", id);

    if (!error) {
      alert("Oferta eliminada exitosamente.");
      setVistaInterna("lista");
      cargarOfertas();
    } else {
      alert("Error al eliminar: " + error.message);
    }
    setCargando(false);
  };

  const handleCambiarEstadoOferta = async (nuevoEstado) => {
    const { error } = await supabase
      .from("oferta_laboral")
      .update({ estado: nuevoEstado })
      .eq("oferta_id", ofertaSeleccionada.oferta_id);

    if (!error) {
      alert(
        `Oferta ${nuevoEstado === "cerrada" ? "Cerrada" : "Abierta"} con éxito`,
      );
      setOfertaSeleccionada({ ...ofertaSeleccionada, estado: nuevoEstado });
      cargarOfertas();
    }
  };

  // --- ACCIONES DE CANDIDATOS ---
  const handleAccionCandidato = async (postulacion, accion) => {
    const nuevoEstado = accion === "match" ? "visto" : "rechazado";
    const { error } = await supabase
      .from("postulacion")
      .update({ estado: nuevoEstado })
      .eq("postulacion_id", postulacion.postulacion_id);

    if (error) return alert("Error al procesar: " + error.message);

    if (accion === "match") {
      // 1. Crear el registro oficial en la tabla de matches
      const { data: matchData } = await supabase.from("match_tabla").insert([
        {
          oferta_id: ofertaSeleccionada.oferta_id,
          alumno_id: postulacion.alumno.alumno_id,
          estado: 'activo'
        }
      ]).select().single();

      // 2. Notificar al alumno vinculando el match y la postulación
      await supabase.from("notificacion").insert([
        {
          destinatario_tipo: "alumno",
          destinatario_id: postulacion.alumno.alumno_id,
          canal: 'app',
          tipo: 'match',
          match_id: matchData?.match_id || null,
          postulacion_id: postulacion.postulacion_id,
          contenido: `🎉 ¡Buenas noticias! La empresa ${usuario.nombre} ha marcado tu perfil como MATCH para la vacante: ${ofertaSeleccionada.titulo}. Pronto se pondrán en contacto contigo.`,
        },
      ]);
      alert("¡MATCH realizado! Se ha notificado al estudiante y se ha creado el registro oficial.");
    } else if (accion === "rechazar") {
      await supabase.from("notificacion").insert([
        {
          destinatario_tipo: "alumno",
          destinatario_id: postulacion.alumno.alumno_id,
          canal: 'app',
          tipo: 'rechazo',   // Tipo diferenciado para poder ocultar "Ver Vacante" en el frontend
          postulacion_id: postulacion.postulacion_id,
          contenido: `Lo sentimos, la empresa ${usuario.nombre} ha decidido no avanzar con tu postulación para la vacante: ${ofertaSeleccionada.titulo}. ¡Sigue intentándolo!`,
        },
      ]);
      alert("Candidato descartado. Se ha notificado al estudiante.");
    }

    if (vistaInterna === "detalle_alumno") setVistaInterna("gestion");
    cargarCandidatos(ofertaSeleccionada.oferta_id);
    cargarOfertas(); // Actualizar el badge de "candidatos por revisar" en las tarjetas
  };

  // --- RENDERS ---
  const renderLista = () => {
    // Lógica de Paginación
    const totalPaginas = Math.ceil(ofertasData.length / ofertasPorPagina);
    const indiceUltima = paginaActual * ofertasPorPagina;
    const indicePrimera = indiceUltima - ofertasPorPagina;
    const ofertasPaginadas = ofertasData.slice(indicePrimera, indiceUltima);

    const obtenerRangoPaginas = () => {
      const paginas = [];
      if (totalPaginas <= 7) {
        for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
      } else {
        paginas.push(1);
        if (paginaActual > 3) paginas.push("...");

        const inicio = Math.max(2, paginaActual - 1);
        const fin = Math.min(totalPaginas - 1, paginaActual + 1);
        for (let i = inicio; i <= fin; i++) paginas.push(i);

        if (paginaActual < totalPaginas - 2) paginas.push("...");
        paginas.push(totalPaginas);
      }
      return paginas;
    };

    return (
      <div
        className="mis-ofertas-container"
        style={{ animation: "fadeIn 0.5s ease-out" }}
      >
        <div className="mis-ofertas-header">
          <h2 style={{ color: "#1e293b", fontSize: "1.8rem" }}>
            Mis Vacantes ({ofertasData.length})
          </h2>
          <button
            className="btn-crear-oferta"
            onClick={() => {
              setForm({
                titulo: "",
                ubicacion: "",
                modalidad: "Remoto",
                carrera: "",
                descripcion: "",
              });
              setVistaInterna("crear");
            }}
            disabled={!perfilCompleto}
            style={
              !perfilCompleto ? { opacity: 0.5, cursor: "not-allowed" } : {}
            }
          >
            {perfilCompleto ? "+ Publicar Nueva" : "🔒 Perfil Incompleto"}
          </button>
        </div>

        <div
          className="ofertas-empresa-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "25px",
            marginTop: "30px",
          }}
        >
          {ofertasPaginadas.map((o) => (
            <div
              key={o.oferta_id}
              className="oferta-empresa-card"
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "20px",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  className="card-header-status"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <span
                    className={`badge-status ${o.estado}`}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      background:
                        o.estado === "abierta" ? "#ecfdf5" : "#f1f5f9",
                      color: o.estado === "abierta" ? "#10b981" : "#64748b",
                    }}
                  >
                    {o.estado.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#94a3b8",
                      fontWeight: "600",
                    }}
                  >
                    {o.modalidad}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    color: "#0f172a",
                    fontWeight: "700",
                    marginBottom: "10px",
                  }}
                >
                  {o.titulo}
                </h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#64748b",
                    lineHeight: "1.5",
                    display: "-webkit-box",
                    WebkitLineClamp: "3",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    minHeight: "60px",
                  }}
                >
                  {o.descripcion}
                </p>
                {/* Badge de candidatos pendientes de revisión */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '14px',
                  padding: '10px 14px',
                  background: o.candidatosPendientes > 0 ? '#eff6ff' : '#f8fafc',
                  borderRadius: '10px',
                  border: `1px solid ${o.candidatosPendientes > 0 ? '#bfdbfe' : '#e2e8f0'}`
                }}>
                  <span style={{ fontSize: '1rem' }}>👥</span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: o.candidatosPendientes > 0 ? '#2563eb' : '#94a3b8'
                  }}>
                    {o.candidatosPendientes > 0
                      ? `${o.candidatosPendientes} candidato${o.candidatosPendientes !== 1 ? 's' : ''} por revisar`
                      : 'Sin candidatos nuevos'
                    }
                  </span>
                  {o.totalCandidatos > 0 && o.candidatosPendientes === 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 'auto' }}>
                      {o.totalCandidatos} procesado{o.totalCandidatos !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleEntrarGestion(o)}
                style={{
                  width: "100%",
                  marginTop: "20px",
                  padding: "12px",
                  background: "#f8fafc",
                  color: "#1e293b",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                ⚙️ Gestionar Oferta
              </button>
            </div>
          ))}
        </div>

        {totalPaginas > 1 && (
          <div
            className="pagination-bar"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginTop: "50px",
              paddingBottom: "30px",
            }}
          >
            <button
              disabled={paginaActual === 1}
              onClick={() => {
                setPaginaActual((p) => p - 1);
                window.scrollTo(0, 0);
              }}
              style={{
                padding: "10px 15px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                background: "white",
                cursor: paginaActual === 1 ? "not-allowed" : "pointer",
                fontWeight: "700",
                color: "#64748b",
              }}
            >
              ←
            </button>

            {obtenerRangoPaginas().map((p, idx) =>
              p === "..." ? (
                <span key={idx} style={{ padding: "0 10px", color: "#cbd5e1" }}>
                  ...
                </span>
              ) : (
                <button
                  key={idx}
                  onClick={() => {
                    setPaginaActual(p);
                    window.scrollTo(0, 0);
                  }}
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    border: "none",
                    fontWeight: "800",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    background: paginaActual === p ? "#2563eb" : "white",
                    color: paginaActual === p ? "white" : "#1e293b",
                    boxShadow:
                      paginaActual === p
                        ? "0 4px 12px rgba(37, 99, 235, 0.25)"
                        : "none",
                    border: paginaActual === p ? "none" : "1px solid #e2e8f0",
                  }}
                >
                  {p}
                </button>
              ),
            )}

            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => {
                setPaginaActual((p) => p + 1);
                window.scrollTo(0, 0);
              }}
              style={{
                padding: "10px 15px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                background: "white",
                cursor:
                  paginaActual === totalPaginas ? "not-allowed" : "pointer",
                fontWeight: "700",
                color: "#64748b",
              }}
            >
              →
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderGestion = () => (
    <div
      className="gestion-oferta-container"
      style={{
        animation: "fadeIn 0.3s ease-out",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "30px",
        }}
      >
        <button
          className="btn-volver"
          onClick={() => setVistaInterna("lista")}
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.95rem",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>←</span> Volver al listado
        </button>
        <span
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: "800",
            background:
              ofertaSeleccionada.estado === "abierta" ? "#ecfdf5" : "#fef2f2",
            color:
              ofertaSeleccionada.estado === "abierta" ? "#059669" : "#dc2626",
          }}
        >
          ● {ofertaSeleccionada.estado.toUpperCase()}
        </span>
      </div>

      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "24px",
          border: "1px solid #e2e8f0",
          marginBottom: "32px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
        }}
      >
        <h1
          style={{
            color: "#0f172a",
            fontSize: "2.2rem",
            fontWeight: "800",
            marginBottom: "12px",
          }}
        >
          {ofertaSeleccionada.titulo}
        </h1>
        <div
          style={{
            display: "flex",
            gap: "20px",
            color: "#64748b",
            fontSize: "0.95rem",
            fontWeight: "500",
          }}
        >
          <span>📍 {ofertaSeleccionada.ubicacion || "Sin ubicación"}</span>
          <span>•</span>
          <span>💼 {ofertaSeleccionada.modalidad}</span>
        </div>
      </div>

      <div
        className="oferta-tabs"
        style={{
          display: "flex",
          gap: "32px",
          borderBottom: "1px solid #e2e8f0",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={() => setTabGestion("candidatos")}
          style={{
            padding: "12px 4px",
            border: "none",
            borderBottom:
              tabGestion === "candidatos"
                ? "3px solid #2563eb"
                : "3px solid transparent",
            fontWeight: "700",
            cursor: "pointer",
            background: "transparent",
            color: tabGestion === "candidatos" ? "#2563eb" : "#64748b",
            fontSize: "1rem",
          }}
        >
          Candidatos ({candidatos.length})
        </button>
        <button
          onClick={() => setTabGestion("editar")}
          style={{
            padding: "12px 4px",
            border: "none",
            borderBottom:
              tabGestion === "editar"
                ? "3px solid #2563eb"
                : "3px solid transparent",
            fontWeight: "700",
            cursor: "pointer",
            background: "transparent",
            color: tabGestion === "editar" ? "#2563eb" : "#64748b",
            fontSize: "1rem",
          }}
        >
          Configuración
        </button>
      </div>

      {tabGestion === "candidatos" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "20px",
          }}
        >
          {candidatos.filter((c) => c.estado !== "rechazado").length > 0 ? (
            candidatos
              .filter((c) => c.estado !== "rechazado")
              .map((item) => (
                <div
                  key={item.postulacion_id}
                  style={{
                    background: "white",
                    padding: "24px",
                    borderRadius: "20px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        background: "#eff6ff",
                        color: "#2563eb",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "800",
                        fontSize: "1.3rem",
                      }}
                    >
                      {item.alumno.nombre[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          margin: 0,
                          color: "#0f172a",
                          fontSize: "1.15rem",
                        }}
                      >
                        {item.alumno.nombre} {item.alumno.apellido}
                      </h4>
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#475569",
                          fontSize: "0.9rem",
                        }}
                      >
                        {item.alumno.carrera}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "800",
                        color:
                          item.estado === "pendiente"
                            ? "#b45309"
                            : item.estado === "visto"
                              ? "#059669"
                              : "#dc2626",
                      }}
                    >
                      {item.estado === "visto"
                        ? "MATCH"
                        : item.estado.toUpperCase()}
                    </span>
                    <button
                      onClick={() => {
                        setAlumnoSeleccionado(item.alumno);
                        setPostulacionSeleccionada(item);
                        setVistaInterna("detalle_alumno");
                      }}
                      style={{
                        padding: '8px 16px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
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
                      <span>👁️</span> 
                      <span>Ver Perfil</span>
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <p
              style={{
                color: "#64748b",
                textAlign: "center",
                gridColumn: "1/-1",
                padding: "40px",
              }}
            >
              Sin postulantes todavía o todos han sido descartados.
            </p>
          )}
        </div>
      ) : (
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
              borderBottom: "1px solid #f1f5f9",
              paddingBottom: "20px",
            }}
          >
            <h3 style={{ margin: 0, color: "#0f172a" }}>
              Editar Información de la Vacante
            </h3>
            <button
              onClick={() =>
                handleCambiarEstadoOferta(
                  ofertaSeleccionada.estado === "abierta"
                    ? "cerrada"
                    : "abierta",
                )
              }
              style={{
                padding: "10px 20px",
                background:
                  ofertaSeleccionada.estado === "abierta"
                    ? "#fef2f2"
                    : "#ecfdf5",
                color:
                  ofertaSeleccionada.estado === "abierta"
                    ? "#dc2626"
                    : "#059669",
                border: `1px solid ${ofertaSeleccionada.estado === "abierta" ? "#dc262622" : "#05966922"}`,
                borderRadius: "12px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              {ofertaSeleccionada.estado === "abierta"
                ? "⛔ Cerrar Vacante"
                : "✅ Abrir Vacante"}
            </button>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "25px" }}
          >
            <div className="form-group">
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                  color: "#1e293b",
                }}
              >
                Título del Puesto
              </label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div className="form-group">
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "700",
                    color: "#1e293b",
                  }}
                >
                  Ubicación
                </label>
                <input
                  type="text"
                  value={form.ubicacion}
                  onChange={(e) =>
                    setForm({ ...form, ubicacion: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                />
              </div>
              <div className="form-group">
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "700",
                    color: "#1e293b",
                  }}
                >
                  Modalidad
                </label>
                <select
                  value={form.modalidad}
                  onChange={(e) =>
                    setForm({ ...form, modalidad: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    background: "white",
                  }}
                >
                  <option>Remoto</option>
                  <option>Presencial</option>
                  <option>Híbrido</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{display:'block', marginBottom:'8px', fontWeight:'700', color:'#1e293b'}}>Carrera Solicitada</label>
              <select 
                  value={form.carrera} 
                  onChange={e => setForm({...form, carrera: e.target.value})} 
                  style={{width:'100%', padding:'12px', borderRadius:'12px', border:'1px solid #e2e8f0', background:'white'}}
              >
              <option value="">Selecciona la carrera...</option>
              {CARRERAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            </div>

            <div className="form-group">
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                  color: "#1e293b",
                }}
              >
                Descripción Detallada
              </label>
              <textarea
                rows="8"
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.95rem",
                  resize: "none",
                  lineHeight: "1.6",
                }}
              ></textarea>
            </div>

            <div
              style={{
                display: "flex",
                gap: "15px",
                marginTop: "10px",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                disabled={cargando}
                onClick={() =>
                  handleGuardarOferta(ofertaSeleccionada.oferta_id)
                }
                style={{
                  padding: "16px 32px",
                  background: cargando ? "#94a3b8" : "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  fontWeight: "800",
                  cursor: cargando ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  boxShadow: cargando ? "none" : "0 4px 12px rgba(37, 99, 235, 0.2)",
                }}
              >
                {cargando ? "💾 Guardando..." : "💾 Guardar Cambios"}
              </button>

              <button
                onClick={() =>
                  handleEliminarOferta(ofertaSeleccionada.oferta_id)
                }
                style={{
                  padding: "12px 20px",
                  background: "none",
                  color: "#ef4444",
                  border: "1px solid #ef444422",
                  borderRadius: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                🗑️ Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCrear = () => (
    <div
      className="crear-oferta-container"
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        background: "white",
        padding: "40px",
        borderRadius: "24px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <h2 style={{ color: "#0f172a", marginBottom: "30px", fontSize: "2rem" }}>
        Publicar Nueva Oferta
      </h2>
      <div className="form-grid">
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "700",
              color: "#1e293b",
            }}
          >
            Título del Puesto
          </label>
          <input
            type="text"
            placeholder="Ej: Desarrollador Backend Node.js"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              fontSize: "1rem",
            }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div className="form-group">
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "700",
                color: "#1e293b",
              }}
            >
              Ubicación
            </label>
            <input
              type="text"
              placeholder="Ej: Madrid, Remoto..."
              value={form.ubicacion}
              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            />
          </div>
          <div className="form-group">
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "700",
                color: "#1e293b",
              }}
            >
              Modalidad
            </label>
            <select
              value={form.modalidad}
              onChange={(e) => setForm({ ...form, modalidad: e.target.value })}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                background: "white",
              }}
            >
              <option>Remoto</option>
              <option>Presencial</option>
              <option>Híbrido</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#1e293b" }}>
            Carrera Solicitada (Matching)
          </label>
          <select
            value={form.carrera}
            onChange={(e) => setForm({ ...form, carrera: e.target.value })}
            style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "white" }}
            required
          >
            <option value="">Selecciona la carrera...</option>
            {CARRERAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: "30px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "700",
              color: "#1e293b",
            }}
          >
            Descripción de la Oferta
          </label>
          <textarea
            rows="6"
            placeholder="Cuéntales a los alumnos de qué se trata el puesto y qué esperas de ellos..."
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              fontSize: "0.95rem",
              resize: "none",
            }}
          ></textarea>
        </div>
      </div>

      <div style={{ display: "flex", gap: "15px" }}>
        <button
          disabled={cargando}
          onClick={() => handleGuardarOferta()}
          style={{
            flex: 2,
            padding: "15px",
            background: cargando ? "#94a3b8" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontWeight: "800",
            cursor: cargando ? "not-allowed" : "pointer",
            fontSize: "1rem",
          }}
        >
          {cargando ? "🚀 Publicando..." : "🚀 Publicar Vacante ahora"}
        </button>
        <button
          onClick={() => setVistaInterna("lista")}
          style={{
            flex: 1,
            padding: "15px",
            background: "#f1f5f9",
            color: "#64748b",
            border: "none",
            borderRadius: "12px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );

  const renderDetalleAlumno = () => {
    if (!alumnoSeleccionado) return null;
    return (
      <div
        style={{
          animation: "fadeIn 0.3s ease-out",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <button
          onClick={() => setVistaInterna("gestion")}
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ← Volver a la gestión
        </button>
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "30px",
              alignItems: "center",
              marginBottom: "30px",
              borderBottom: "1px solid #f1f5f9",
              paddingBottom: "30px",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "100px",
                background: "#eff6ff",
                color: "#2563eb",
                borderRadius: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                fontWeight: "800",
              }}
            >
              {alumnoSeleccionado.nombre[0]}
            </div>
            <div>
              <h2 style={{ margin: 0, color: "#0f172a", fontSize: "2rem" }}>
                {alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}
              </h2>
              <p
                style={{
                  margin: "5px 0",
                  color: "#2563eb",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                }}
              >
                {alumnoSeleccionado.carrera}
              </p>
              <span style={{ color: "#64748b" }}>
                {alumnoSeleccionado.universidad}
              </span>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
            }}
          >
            <div>
              <h4 style={{ color: "#0f172a", marginBottom: "15px" }}>Perfil</h4>
              <p style={{ color: "#475569", lineHeight: "1.6" }}>
                {alumnoSeleccionado.descripcion || "Sin biografía."}
              </p>
              <h4 style={{ color: "#0f172a", marginTop: "30px" }}>
                Habilidades
              </h4>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "10px",
                }}
              >
                {(alumnoSeleccionado.habilidades || "")
                  .split(",")
                  .map((h, i) => (
                    <span
                      key={i}
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        padding: "6px 14px",
                        borderRadius: "10px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}
                    >
                      {h.trim()}
                    </span>
                  ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: "#0f172a", marginBottom: "15px" }}>
                Contacto rápido
              </h4>
              <p style={{ color: "#475569" }}>📧 {alumnoSeleccionado.email}</p>
              <p style={{ color: "#475569" }}>
                📱 {alumnoSeleccionado.telefono || "No registrado"}
              </p>
              {alumnoSeleccionado.cv_url && (
                <a
                  href={alumnoSeleccionado.cv_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    marginTop: "20px",
                    textAlign: "center",
                    padding: "15px",
                    background: "#2563eb",
                    color: "white",
                    borderRadius: "15px",
                    textDecoration: "none",
                    fontWeight: "700",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                  }}
                >
                  Descargar CV 📄
                </a>
              )}
            </div>
          </div>

          {postulacionSeleccionada?.estado === 'visto' ? (
            /* Ya se hizo Match — mostrar badge de confirmación en lugar de los botones */
            <div style={{
              marginTop: '40px',
              paddingTop: '30px',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
              padding: '30px',
              background: '#f0fdf4',
              borderRadius: '16px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🤝</div>
              <h3 style={{ color: '#059669', margin: '0 0 8px', fontWeight: '800' }}>¡Match Realizado!</h3>
              <p style={{ color: '#065f46', margin: 0, fontSize: '0.95rem' }}>
                Ya notificaste a este candidato. El proceso continúa fuera de la plataforma.
              </p>
            </div>
          ) : (
            /* Candidato pendiente — mostrar botones de acción */
            <div style={{
              display: 'flex',
              gap: '15px',
              marginTop: '40px',
              paddingTop: '30px',
              borderTop: '1px solid #f1f5f9'
            }}>
              <button
                onClick={() => handleAccionCandidato(postulacionSeleccionada, "match")}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
                }}
              >
                🤝 Hacer Match
              </button>
              <button
                onClick={() => handleAccionCandidato(postulacionSeleccionada, "rechazar")}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fee2e2',
                  borderRadius: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                ❌ Descartar Candidato
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (cargando && vistaInterna === "lista")
    return (
      <div style={{ padding: "100px", textAlign: "center", color: "#64748b" }}>
        Cargando vacantes...
      </div>
    );

  return (
    <div className="mis-ofertas-container">
      {vistaInterna === "lista" && renderLista()}
      {vistaInterna === "gestion" && renderGestion()}
      {vistaInterna === "crear" && renderCrear()}
      {vistaInterna === "detalle_alumno" && renderDetalleAlumno()}
    </div>
  );
};

export default MisOfertas;
