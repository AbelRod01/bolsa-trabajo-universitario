/**
 * COMPONENTE PRINCIPAL: App.js
 * Centraliza la autenticación, el estado del usuario y la navegación principal.
 */

import React, { useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import "./App.css";
// Importación de iconos y vistas
import {
  IconoCheck,
  IconoUsuario,
  IconoMaleta,
  IconoRayo,
} from "./componentes/Iconos";
import MenuPrincipalEstudiante from "./vistas/estudiantes/MenuPrincipal";
import MenuPrincipalEmpresa from "./vistas/empresas/MenuPrincipalEmpresa";
import { supabase } from "./supabaseClient";

function App() {
  // --- ESTADOS DE LA APLICACIÓN ---
  const [esLogin, setEsLogin] = useState(true); // Alterna entre Vista Login o Registro
  const [rol, setRol] = useState("estudiante"); // 'estudiante' o 'empresa'
  const [estaLogueado, setEstaLogueado] = useState(false); // ¿Hay alguien dentro?
  const [usuarioLogueado, setUsuarioLogueado] = useState(null); // Perfil completo del usuario activo
  const navigate = useNavigate();

  // --- ESTADOS DEL FORMULARIO ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [cargando, setCargando] = useState(false); // Estado visual de espera
  const [inicializando, setInicializando] = useState(true); // Para la restauración de sesión

  // 🔄 EFECTO: RESTAURAR SESIÓN AL REFRESCAR
  // Busca en localStorage si ya había alguien logueado para no pedir login de nuevo
  React.useEffect(() => {
    const restaurarSesion = async () => {
      const storedUserId = localStorage.getItem("bolsa_userId");
      const storedRol = localStorage.getItem("bolsa_rol");

      if (storedUserId && storedRol) {
        const tabla = storedRol === "estudiante" ? "alumno" : "empresa";
        const idCol = storedRol === "estudiante" ? "alumno_id" : "empresa_id";

        // Consultamos a Supabase para traer los datos frescos del perfil
        const { data, error } = await supabase
          .from(tabla)
          .select("*")
          .eq(idCol, parseInt(storedUserId))
          .single();

        if (data && !error) {
          setRol(storedRol);
          setUsuarioLogueado(data);
          setEstaLogueado(true);
        } else {
          // Si hubo error o no existe, limpiamos basura del storage
          localStorage.removeItem("bolsa_userId");
          localStorage.removeItem("bolsa_rol");
        }
      }
      setInicializando(false);
    };

    restaurarSesion();
  }, []);

  // --- MANEJADORES DE INTERFAZ ---
  const cambiarModo = () => {
    setEsLogin(!esLogin);
    setErrorMsg("");
  };
  const cambiarRol = (nuevoRol) => {
    setRol(nuevoRol);
    setErrorMsg("");
  };

  // 🛡️ LÓGICA PRINCIPAL: LOGIN / REGISTRO
  const manejarSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setCargando(true);

    const tabla = rol === "estudiante" ? "alumno" : "empresa";

    if (esLogin) {
      // PROCESO DE INICIO DE SESIÓN
      const { data, error } = await supabase
        .from(tabla)
        .select("*")
        .eq("email", email)
        .eq("password_hash", password)
        .single();

      if (error || !data) {
        setErrorMsg("Correo o contraseña incorrectos, o rol equivocado.");
      } else {
        // Marcamos la sesión como activa y guardamos en storage
        localStorage.setItem(
          "bolsa_userId",
          rol === "estudiante" ? data.alumno_id : data.empresa_id,
        );
        localStorage.setItem("bolsa_rol", rol);

        setUsuarioLogueado(data);
        setEstaLogueado(true);
        navigate(rol === "estudiante" ? "/estudiante" : "/empresa");
      }
    } else {
      // PROCESO DE REGISTRO DE NUEVA CUENTA
      if (password !== confirmPassword) {
        setErrorMsg("Las contraseñas no coinciden.");
        setCargando(false);
        return;
      }

      let datosInsertar = {};
      if (rol === "estudiante") {
        datosInsertar = { email, password_hash: password, nombre, apellido };
      } else {
        datosInsertar = { email, password_hash: password, nombre };
      }

      const { data, error } = await supabase
        .from(tabla)
        .insert([datosInsertar]);

      if (error) {
        if (error.code === "23505")
          setErrorMsg("Este correo ya está registrado.");
        else setErrorMsg("Error al registrar: " + error.message);
      } else {
        alert("¡Registro exitoso! Por favor inicia sesión.");
        setEsLogin(true);
      }
    }
    setCargando(false);
  };

  // 🚪 CERRAR SESIÓN
  const manejarLogout = () => {
    localStorage.removeItem("bolsa_userId");
    localStorage.removeItem("bolsa_rol");
    setEstaLogueado(false);
    setUsuarioLogueado(null);
    setEmail("");
    setPassword("");
    setNombre("");
    setApellido("");
    navigate("/");
  };

  const renderAuthView = (
    <div className="pantalla-principal">
      {/* Columna Izquierda: Información */}
      <div className="seccion-informacion">
        <div className="distintivo">
          <IconoRayo />
          <span>Conectando talento con oportunidades</span>
        </div>

        <div className="bloque-texto">
          <h1 className="titulo-principal">
            Bolsa de Trabajo <br />
            Universitaria
          </h1>
          <p className="subtitulo-principal">
            La plataforma que conecta a estudiantes universitarios con las
            mejores oportunidades laborales.
          </p>
        </div>

        <div className="lista-caracteristicas">
          <div className="item-caracteristica">
            <div className="icono-contenedor">
              <IconoCheck />
            </div>
            <div className="texto-caracteristica">
              <h3>Matching con empresas</h3>
              <p>
                Una forma de visualizar en un solo lugar todas las posibles
                ofertas de trabajo.
              </p>
            </div>
          </div>

          <div className="item-caracteristica">
            <div className="icono-contenedor">
              <IconoUsuario />
            </div>
            <div className="texto-caracteristica">
              <h3>Perfiles Completos</h3>
              <p>
                Muestra tu CV, habilidades, proyectos y enlaces profesionales en
                un solo lugar.
              </p>
            </div>
          </div>

          <div className="item-caracteristica">
            <div className="icono-contenedor">
              <IconoMaleta />
            </div>
            <div className="texto-caracteristica">
              <h3>Para Empresas y Estudiantes</h3>
              <p>
                Herramientas especializadas para ambos tipos de usuarios con
                paneles dedicados.
              </p>
            </div>
          </div>
        </div>

        <div className="barra-estadisticas">
          <div className="dato-estadistico">
            <h4>500+</h4>
            <span>Estudiantes Registrados</span>
          </div>
          <div className="dato-estadistico">
            <h4>150+</h4>
            <span>Empresas Activas</span>
          </div>
          <div className="dato-estadistico">
            <h4>92%</h4>
            <span>Tasa de Match</span>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Autenticación */}
      <div className="seccion-derecha">
        <div className="tarjeta-auth">
          <div className="tabs-rol">
            <button
              className={`tab-boton ${rol === "estudiante" ? "activo" : ""}`}
              onClick={() => cambiarRol("estudiante")}
            >
              <IconoUsuario />
              Alumno
            </button>
            <button
              className={`tab-boton ${rol === "empresa" ? "activo" : ""}`}
              onClick={() => cambiarRol("empresa")}
            >
              <IconoMaleta />
              Empresa
            </button>
          </div>

          <div className="encabezado-formulario">
            <h2>
              {esLogin ? "Inicio de Sesión" : "Registro"} -{" "}
              {rol === "estudiante" ? "Alumno" : "Empresa"}
            </h2>
            <p>
              {esLogin
                ? "Accede a tu perfil y encuentra oportunidades laborales"
                : "Crea tu cuenta para comenzar tu camino profesional"}
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                color: "red",
                marginBottom: "15px",
                backgroundColor: "#ffe6e6",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              {errorMsg}
            </div>
          )}

          <form className="formulario-auth" onSubmit={manejarSubmit}>
            {!esLogin && (
              <>
                <div className="campo-grupo">
                  <label htmlFor="nombre">
                    {rol === "estudiante"
                      ? "Nombre(s)"
                      : "Nombre de la Empresa"}
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    className="input-estilizado"
                    placeholder="Ej. Juan / Google"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>
                {rol === "estudiante" && (
                  <div className="campo-grupo">
                    <label htmlFor="apellido">Apellidos</label>
                    <input
                      type="text"
                      id="apellido"
                      className="input-estilizado"
                      placeholder="Ej. Pérez"
                      required
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}

            <div className="campo-grupo">
              <label htmlFor="correo">Correo Institucional / Profesional</label>
              <input
                type="email"
                id="correo"
                className="input-estilizado"
                placeholder={
                  rol === "estudiante"
                    ? "alumno@universidad.edu.mx"
                    : "contacto@empresa.com"
                }
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="campo-grupo">
              <label htmlFor="contrasena">Contraseña</label>
              <input
                type="password"
                id="contrasena"
                className="input-estilizado"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {!esLogin && (
              <div className="campo-grupo">
                <label htmlFor="confirmarContrasena">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  id="confirmarContrasena"
                  className="input-estilizado"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              className="boton-ingresar"
              disabled={cargando}
            >
              {cargando
                ? "Cargando..."
                : esLogin
                  ? `Ingresar como ${rol === "estudiante" ? "Alumno" : "Empresa"}`
                  : "Registrarse ahora"}
            </button>
          </form>

          <div className="link-registro">
            <p>
              {esLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  cambiarModo();
                }}
              >
                {esLogin ? "Regístrate aquí" : "Inicia sesión"}
              </a>
            </p>
          </div>
        </div>

        <p className="footer-legal">
          Al iniciar sesión, aceptas nuestros términos de servicio y política de
          privacidad
        </p>
      </div>
    </div>
  );

  if (inicializando) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          color: "#1e293b",
          fontWeight: "700",
        }}
      >
        🔄 Restaurando sesión...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          !estaLogueado ? (
            renderAuthView
          ) : (
            <Navigate to={rol === "estudiante" ? "/estudiante" : "/empresa"} />
          )
        }
      />
      <Route
        path="/estudiante/*"
        element={
          estaLogueado && rol === "estudiante" ? (
            <MenuPrincipalEstudiante
              onLogout={manejarLogout}
              usuario={usuarioLogueado}
              setUsuario={setUsuarioLogueado}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/empresa/*"
        element={
          estaLogueado && rol === "empresa" ? (
            <MenuPrincipalEmpresa
              onLogout={manejarLogout}
              usuario={usuarioLogueado}
              setUsuario={setUsuarioLogueado}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
