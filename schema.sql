-- ═══════════════════════════════════════════════════════════════
-- SCHEMA FINAL - Bolsa de Trabajo Universitario
-- Plataforma: Supabase (PostgreSQL)
-- Versión: Limpia — Columnas huérfanas eliminadas, tablas conservadas
--
-- DECISIONES DE DISEÑO:
--   • La tabla CV existe para mantener historial de archivos subidos.
--     El campo cv_url en ALUMNO sirve como acceso directo rápido.
--   • La tabla ALUMNO_CARRERA está reservada para cuando un alumno
--     curse dos carreras simultáneamente (extensión futura).
--   • El campo alumno.carrera (VARCHAR) debe coincidir exactamente
--     con los valores del catálogo CARRERA para que el matching funcione.
-- ═══════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────
-- TABLA: ALUMNO
-- Datos de registro y perfil profesional del estudiante.
-- El perfil debe estar completo para poder postularse a ofertas.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE ALUMNO (
    alumno_id     SERIAL PRIMARY KEY,
    nombre        VARCHAR(100)  NOT NULL,
    apellido      VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  UNIQUE NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    telefono      VARCHAR(20),
    fecha_registro DATE DEFAULT CURRENT_DATE,
    estado        VARCHAR(50)   DEFAULT 'activo',

    -- Perfil Profesional
    descripcion       TEXT,           -- "Sobre mí": presentación personal
    habilidades       TEXT,           -- Separadas por coma: "React, SQL, Excel"
    universidad       VARCHAR(150),
    carrera           VARCHAR(150),   -- Debe coincidir con CARRERA.nombre
    periodo_educacion VARCHAR(100),   -- Ej: "2021 - 2025"
    proyectos         TEXT,           -- Proyectos y experiencia relevante
    cv_url            TEXT            -- URL pública del PDF en Supabase Storage
);


-- ─────────────────────────────────────────────────────────────
-- TABLA: EMPRESA
-- Datos de registro y perfil corporativo de la empresa.
-- El perfil debe estar completo para publicar y gestionar vacantes.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE EMPRESA (
    empresa_id    SERIAL PRIMARY KEY,
    nombre        VARCHAR(150) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- Perfil Corporativo
    sector            VARCHAR(100),
    ubicacion         VARCHAR(150),
    sitio_web         VARCHAR(150),
    contacto_telefono VARCHAR(20),
    descripcion       TEXT,           -- Misión / Visión
    beneficios        TEXT,           -- Lo que ofrece a sus empleados
    tamano_empresa    VARCHAR(50),    -- Ej: "11-50 empleados"
    fundada_en        VARCHAR(20),    -- Año de fundación
    logo_url          TEXT,

    fecha_registro DATE DEFAULT CURRENT_DATE,
    estado         VARCHAR(50) DEFAULT 'activo'
);


-- ─────────────────────────────────────────────────────────────
-- TABLA: CARRERA
-- Catálogo de carreras universitarias disponibles en la plataforma.
-- Vincula ofertas con los perfiles que requieren (OFERTA_CARRERA).
-- Los dropdowns del frontend usan estos mismos valores.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE CARRERA (
    carrera_id SERIAL PRIMARY KEY,
    nombre     VARCHAR(150) NOT NULL,
    facultad   VARCHAR(150)
);


-- ─────────────────────────────────────────────────────────────
-- TABLA: OFERTA_LABORAL
-- Vacantes publicadas por las empresas.
-- Modalidad: 'Presencial' | 'Remoto' | 'Híbrido'
-- Estado:    'abierta' | 'cerrada'
-- ─────────────────────────────────────────────────────────────
CREATE TABLE OFERTA_LABORAL (
    oferta_id   SERIAL PRIMARY KEY,
    empresa_id  INT          NOT NULL,
    titulo      VARCHAR(200) NOT NULL,
    descripcion TEXT,
    ubicacion   VARCHAR(150),
    modalidad   VARCHAR(50),           -- Presencial, Remoto, Híbrido
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre      DATE,
    estado      VARCHAR(50)  DEFAULT 'abierta',

    FOREIGN KEY (empresa_id) REFERENCES EMPRESA(empresa_id) ON DELETE CASCADE
);


-- ─────────────────────────────────────────────────────────────
-- TABLA: OFERTA_CARRERA
-- Relación M:N entre oferta y las carreras que requiere.
-- Permite que una oferta pueda estar dirigida a más de una carrera.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE OFERTA_CARRERA (
    oferta_id  INT NOT NULL,
    carrera_id INT NOT NULL,
    PRIMARY KEY (oferta_id, carrera_id),
    FOREIGN KEY (oferta_id)  REFERENCES OFERTA_LABORAL(oferta_id) ON DELETE CASCADE,
    FOREIGN KEY (carrera_id) REFERENCES CARRERA(carrera_id)       ON DELETE CASCADE
);


-- ─────────────────────────────────────────────────────────────
-- TABLA: CV
-- Historial de CVs subidos por cada alumno a Supabase Storage.
-- Cada vez que el alumno sube un nuevo PDF desde "Editar Perfil",
-- queda registrado aquí. El acceso rápido se hace vía alumno.cv_url.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE CV (
    cv_id       SERIAL PRIMARY KEY,
    alumno_id   INT NOT NULL,
    titulo      VARCHAR(150),            -- Ej: "CV de Juan Pérez"
    resumen     TEXT,
    archivo_url VARCHAR(255),            -- URL pública en Supabase Storage
    fecha_subida        DATE DEFAULT CURRENT_DATE,
    fecha_actualizacion DATE DEFAULT CURRENT_DATE,
    visibilidad VARCHAR(50) DEFAULT 'publico',

    FOREIGN KEY (alumno_id) REFERENCES ALUMNO(alumno_id) ON DELETE CASCADE
);


-- ─────────────────────────────────────────────────────────────
-- TABLA: POSTULACION
-- Registra cuándo un alumno aplica a una oferta laboral.
-- La restricción UNIQUE evita postulaciones duplicadas a nivel de BD.
-- Estado: 'pendiente' → 'visto' (al hacer Match) | 'rechazado'
-- ─────────────────────────────────────────────────────────────
CREATE TABLE POSTULACION (
    postulacion_id    SERIAL PRIMARY KEY,
    oferta_id         INT NOT NULL,
    alumno_id         INT NOT NULL,
    fecha_postulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado            VARCHAR(50) DEFAULT 'pendiente',

    UNIQUE (oferta_id, alumno_id),   -- Un alumno solo puede postularse una vez por oferta
    FOREIGN KEY (oferta_id) REFERENCES OFERTA_LABORAL(oferta_id) ON DELETE CASCADE,
    FOREIGN KEY (alumno_id) REFERENCES ALUMNO(alumno_id)         ON DELETE CASCADE
);


-- ─────────────────────────────────────────────────────────────
-- TABLA: MATCH_TABLA
-- Registro oficial cuando una empresa hace "Match" con un candidato.
-- Se crea manualmente desde el panel de gestión de postulantes.
-- Al hacer Match también se actualiza postulacion.estado = 'visto'
-- y se envía una notificación al alumno.
-- Estado: 'activo' | 'inactivo'
-- ─────────────────────────────────────────────────────────────
CREATE TABLE MATCH_TABLA (
    match_id       SERIAL PRIMARY KEY,
    oferta_id      INT NOT NULL,
    alumno_id      INT NOT NULL,
    fecha_creacion DATE DEFAULT CURRENT_DATE,
    estado         VARCHAR(50) DEFAULT 'activo',

    FOREIGN KEY (oferta_id) REFERENCES OFERTA_LABORAL(oferta_id) ON DELETE CASCADE,
    FOREIGN KEY (alumno_id) REFERENCES ALUMNO(alumno_id)         ON DELETE CASCADE
);


-- ─────────────────────────────────────────────────────────────
-- TABLA: ALUMNO_CARRERA
-- Reservada para una extensión futura donde un alumno pueda
-- tener registradas múltiples carreras simultáneas.
-- En la versión actual, la carrera del alumno se gestiona como
-- un campo VARCHAR directamente en la tabla ALUMNO.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE ALUMNO_CARRERA (
    alumno_id   INT NOT NULL,
    carrera_id  INT NOT NULL,
    fecha_inicio DATE,
    fecha_fin    DATE,
    estado       VARCHAR(50) DEFAULT 'activo',
    PRIMARY KEY (alumno_id, carrera_id),
    FOREIGN KEY (alumno_id)  REFERENCES ALUMNO(alumno_id)   ON DELETE CASCADE,
    FOREIGN KEY (carrera_id) REFERENCES CARRERA(carrera_id) ON DELETE CASCADE
);


-- ─────────────────────────────────────────────────────────────
-- TABLA: NOTIFICACION
-- Mensajería interna entre la plataforma y sus usuarios.
-- Los campos match_id y postulacion_id actúan como "deep links":
-- el frontend los usa para navegar directamente a la oferta
-- relacionada cuando el usuario hace clic en la notificación.
-- Estado: 'no_leido' | 'leido'
-- Tipo:   'match' | 'postulacion' | 'sistema'
-- ─────────────────────────────────────────────────────────────
CREATE TABLE NOTIFICACION (
    notificacion_id   SERIAL PRIMARY KEY,
    destinatario_tipo VARCHAR(50) NOT NULL,  -- 'alumno' | 'empresa'
    destinatario_id   INT         NOT NULL,  -- alumno_id o empresa_id
    canal             VARCHAR(50) DEFAULT 'app',
    tipo              VARCHAR(50),
    estado_envio      VARCHAR(50) DEFAULT 'no_leido',
    fecha_envio       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contenido         TEXT NOT NULL,

    -- FKs opcionales para deep linking hacia la oferta vinculada
    match_id       INT NULL,
    postulacion_id INT NULL,

    FOREIGN KEY (match_id)       REFERENCES MATCH_TABLA(match_id)      ON DELETE SET NULL,
    FOREIGN KEY (postulacion_id) REFERENCES POSTULACION(postulacion_id) ON DELETE SET NULL
);
