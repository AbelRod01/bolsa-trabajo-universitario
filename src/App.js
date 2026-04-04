import React, { useState } from "react";
import "./App.css";
import { IconoCheck, IconoUsuario, IconoMaleta, IconoRayo } from "./componentes/Iconos";
import MenuPrincipalEstudiante from "./vistas/estudiantes/MenuPrincipal";
import MenuPrincipalEmpresa from "./vistas/empresas/MenuPrincipalEmpresa";

function App() {
  const [esLogin, setEsLogin] = useState(true);
  const [rol, setRol] = useState("estudiante"); // 'estudiante' o 'empresa'
  const [estaLogueado, setEstaLogueado] = useState(false);

  const cambiarModo = () => setEsLogin(!esLogin);
  const cambiarRol = (nuevoRol) => setRol(nuevoRol);

  const manejarLogin = (e) => {
    e.preventDefault();
    setEstaLogueado(true);
  };

  const manejarLogout = () => {
    setEstaLogueado(false);
  };

  if (estaLogueado) {
    if (rol === "estudiante") {
      return <MenuPrincipalEstudiante onLogout={manejarLogout} />;
    } else if (rol === "empresa") {
      return <MenuPrincipalEmpresa onLogout={manejarLogout} />;
    }
  }

  return (
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
            La plataforma que conecta a estudiantes universitarios con las mejores
            oportunidades laborales.
          </p>
        </div>

        <div className="lista-caracteristicas">
          <div className="item-caracteristica">
            <div className="icono-contenedor">
              <IconoCheck />
            </div>
            <div className="texto-caracteristica">
              <h3>Matching Inteligente</h3>
              <p>Algoritmo avanzado que conecta candidatos con ofertas basándose en habilidades y experiencia.</p>
            </div>
          </div>

          <div className="item-caracteristica">
            <div className="icono-contenedor">
              <IconoUsuario />
            </div>
            <div className="texto-caracteristica">
              <h3>Perfiles Completos</h3>
              <p>Muestra tu CV, habilidades, proyectos y enlaces profesionales en un solo lugar.</p>
            </div>
          </div>

          <div className="item-caracteristica">
            <div className="icono-contenedor">
              <IconoMaleta />
            </div>
            <div className="texto-caracteristica">
              <h3>Para Empresas y Estudiantes</h3>
              <p>Herramientas especializadas para ambos tipos de usuarios con paneles dedicados.</p>
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
            <h2>{esLogin ? "Inicio de Sesión" : "Registro"} - {rol === "estudiante" ? "Alumno" : "Empresa"}</h2>
            <p>
              {esLogin
                ? "Accede a tu perfil y encuentra oportunidades laborales"
                : "Crea tu cuenta para comenzar tu camino profesional"}
            </p>
          </div>

          <form className="formulario-auth" onSubmit={manejarLogin}>
            <div className="campo-grupo">
              <label htmlFor="correo">Correo Institucional</label>
              <input
                type="email"
                id="correo"
                className="input-estilizado"
                placeholder={rol === "estudiante" ? "alumno@universidad.edu.mx" : "contacto@empresa.com"}
                required
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
              />
            </div>

            {!esLogin && (
              <div className="campo-grupo">
                <label htmlFor="confirmarContrasena">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmarContrasena"
                  className="input-estilizado"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            <button type="submit" className="boton-ingresar">
              {esLogin ? `Ingresar como ${rol === "estudiante" ? "Alumno" : "Empresa"}` : "Registrarse ahora"}
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
          Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad
        </p>
      </div>
    </div>
  );
}

export default App;
