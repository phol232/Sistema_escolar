-- =========================================================
-- SISTEMA DE GESTIÓN DE COLEGIO (PERÚ)
-- PostgreSQL - Primaria y Secundaria (Optimizado)
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- TIPOS / ENUMS
-- =========================================================
CREATE TYPE estado_general AS ENUM ('activo', 'inactivo');
CREATE TYPE sexo_tipo AS ENUM ('M', 'F');
CREATE TYPE turno_tipo AS ENUM ('manana', 'tarde');
CREATE TYPE parentesco_tipo AS ENUM ('padre', 'madre', 'abuelo', 'abuela', 'tio', 'tia', 'hermano', 'hermana', 'apoderado_legal', 'otro');
CREATE TYPE asistencia_estado AS ENUM ('presente', 'falta', 'tardanza', 'justificado');
CREATE TYPE matricula_estado AS ENUM ('reservada', 'activa', 'retirada', 'finalizada');
CREATE TYPE pension_estado AS ENUM ('pendiente', 'pagado_parcial', 'pagado', 'vencido', 'anulado');
CREATE TYPE usuario_rol_tipo AS ENUM ('super_admin', 'director', 'subdirector', 'secretaria', 'tesoreria', 'docente', 'tutor', 'apoderado');

-- =========================================================
-- TABLAS BASE Y SEGURIDAD
-- =========================================================
CREATE TABLE personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dni VARCHAR(15) UNIQUE NOT NULL, -- Soporta DNI (8) y CE (9+)
    nombres VARCHAR(120) NOT NULL,
    apellido_paterno VARCHAR(80) NOT NULL,
    apellido_materno VARCHAR(80) NOT NULL,
    fecha_nacimiento DATE,
    sexo sexo_tipo,
    direccion TEXT,
    ubigeo VARCHAR(6), -- Ubigeo peruano es de 6 dígitos
    telefono VARCHAR(20),
    email VARCHAR(150),
    estado estado_general NOT NULL DEFAULT 'activo',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_dni_formato CHECK (dni ~ '^[0-9A-Z]{8,15}$')
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre usuario_rol_tipo NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

INSERT INTO roles (nombre, descripcion)
VALUES
  ('super_admin', 'Control total del sistema'),
  ('director', 'Gestión institucional y supervisión'),
  ('subdirector', 'Apoyo directivo y coordinación académica'),
  ('secretaria', 'Gestión administrativa y documental'),
  ('tesoreria', 'Gestión de pensiones y pagos'),
  ('docente', 'Gestión de cursos, notas y asistencia'),
  ('tutor', 'Seguimiento académico y convivencia'),
  ('apoderado', 'Consulta de información de sus hijos')
ON CONFLICT (nombre) DO UPDATE
SET descripcion = EXCLUDED.descripcion;

CREATE TABLE usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    persona_id UUID NOT NULL UNIQUE REFERENCES personas(id) ON DELETE RESTRICT,
    username VARCHAR(50) NOT NULL UNIQUE,
    rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    estado estado_general NOT NULL DEFAULT 'activo',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- ACTORES EDUCATIVOS
-- =========================================================
CREATE TABLE alumnos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL UNIQUE REFERENCES personas(id) ON DELETE RESTRICT,
    codigo_estudiante VARCHAR(14) NOT NULL UNIQUE, -- Código Modular / SIAGIE
    procedencia_colegio VARCHAR(150),
    estado estado_general NOT NULL DEFAULT 'activo',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE docentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL UNIQUE REFERENCES personas(id) ON DELETE RESTRICT,
    especialidad VARCHAR(120),
    fecha_contratacion DATE,
    estado estado_general NOT NULL DEFAULT 'activo'
);

CREATE TABLE apoderados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL UNIQUE REFERENCES personas(id) ON DELETE RESTRICT,
    ocupacion VARCHAR(120),
    estado estado_general NOT NULL DEFAULT 'activo'
);

CREATE TABLE alumno_apoderado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    apoderado_id UUID NOT NULL REFERENCES apoderados(id) ON DELETE CASCADE,
    parentesco parentesco_tipo NOT NULL,
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_alumno_apoderado UNIQUE (alumno_id, apoderado_id)
);

-- =========================================================
-- ESTRUCTURA ACADÉMICA
-- =========================================================
CREATE TABLE anios_escolares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anio INTEGER NOT NULL UNIQUE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_anio_rango CHECK (anio >= 2020 AND anio <= 2100),
    CONSTRAINT chk_fechas_anio CHECK (fecha_fin > fecha_inicio)
);

CREATE TABLE niveles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(3) NOT NULL UNIQUE, -- 'PRI' o 'SEC'
    nombre VARCHAR(50) NOT NULL UNIQUE,
    estado estado_general NOT NULL DEFAULT 'activo'
);

CREATE TABLE grados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nivel_id UUID NOT NULL REFERENCES niveles(id) ON DELETE RESTRICT,
    nombre VARCHAR(50) NOT NULL, -- Ej: '1ro Primaria'
    orden SMALLINT NOT NULL,
    estado estado_general NOT NULL DEFAULT 'activo',
    CONSTRAINT uq_grado_nivel_orden UNIQUE (nivel_id, orden)
);

CREATE TABLE aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(80) NOT NULL UNIQUE,
    capacidad INTEGER NOT NULL,
    CONSTRAINT chk_aulas_capacidad CHECK (capacidad > 0)
);

CREATE TABLE secciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grado_id UUID NOT NULL REFERENCES grados(id) ON DELETE RESTRICT,
    anio_escolar_id UUID NOT NULL REFERENCES anios_escolares(id) ON DELETE RESTRICT,
    aula_id UUID REFERENCES aulas(id) ON DELETE SET NULL,
    letra VARCHAR(5) NOT NULL, -- Ej: 'A', 'B'
    turno turno_tipo NOT NULL DEFAULT 'manana',
    tutor_id UUID NOT NULL REFERENCES docentes(id) ON DELETE RESTRICT, -- EL TUTOR PRINCIPAL DEL AULA
    estado estado_general NOT NULL DEFAULT 'activo',
    CONSTRAINT uq_seccion_grado_anio_letra UNIQUE (grado_id, anio_escolar_id, letra)
);

-- =========================================================
-- CURSOS Y ASIGNACIONES
-- =========================================================
CREATE TABLE cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) NOT NULL UNIQUE,
    es_especialidad BOOLEAN NOT NULL DEFAULT FALSE, -- Clave para diferenciar Ed. Física/Inglés vs Matemática
    estado estado_general NOT NULL DEFAULT 'activo'
);

CREATE TABLE docente_curso_seccion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seccion_id UUID NOT NULL REFERENCES secciones(id) ON DELETE RESTRICT,
    curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE RESTRICT,
    docente_id UUID NOT NULL REFERENCES docentes(id) ON DELETE RESTRICT,
    CONSTRAINT uq_curso_unico_por_seccion UNIQUE (seccion_id, curso_id) -- Un curso por salón solo lo dicta un profe
);

-- =========================================================
-- MATRÍCULAS Y ASISTENCIAS
-- =========================================================
CREATE TABLE matriculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE RESTRICT,
    anio_escolar_id UUID NOT NULL REFERENCES anios_escolares(id) ON DELETE RESTRICT,
    seccion_id UUID NOT NULL REFERENCES secciones(id) ON DELETE RESTRICT,
    fecha_matricula DATE NOT NULL DEFAULT CURRENT_DATE,
    estado matricula_estado NOT NULL DEFAULT 'activa',
    CONSTRAINT uq_matricula_alumno_anio UNIQUE (alumno_id, anio_escolar_id)
);

CREATE TABLE asistencias_alumnos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    seccion_id UUID NOT NULL REFERENCES secciones(id) ON DELETE RESTRICT,
    fecha DATE NOT NULL,
    estado asistencia_estado NOT NULL,
    CONSTRAINT uq_asistencia_diaria UNIQUE (alumno_id, fecha)
);

-- =========================================================
-- EVALUACIONES Y NOTAS (0 a 20)
-- =========================================================
CREATE TABLE bimestres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anio_escolar_id UUID NOT NULL REFERENCES anios_escolares(id) ON DELETE CASCADE,
    numero SMALLINT NOT NULL,
    CONSTRAINT uq_bimestre_anio_numero UNIQUE (anio_escolar_id, numero),
    CONSTRAINT chk_bimestre_numero CHECK (numero BETWEEN 1 AND 4)
);

CREATE TABLE evaluaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bimestre_id UUID NOT NULL REFERENCES bimestres(id) ON DELETE CASCADE,
    curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE RESTRICT,
    seccion_id UUID NOT NULL REFERENCES secciones(id) ON DELETE RESTRICT,
    nombre VARCHAR(120) NOT NULL,
    peso NUMERIC(5,2) NOT NULL DEFAULT 1,
    fecha_evaluacion DATE NOT NULL
);

CREATE TABLE notas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluacion_id UUID NOT NULL REFERENCES evaluaciones(id) ON DELETE CASCADE,
    alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    nota NUMERIC(4,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_nota_evaluacion_alumno UNIQUE (evaluacion_id, alumno_id),
    CONSTRAINT chk_nota_vigesimal CHECK (nota >= 0 AND nota <= 20) -- REGLA ESTRICTA PERUANA
);

-- =========================================================
-- TESORERÍA
-- =========================================================
CREATE TABLE pensiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matricula_id UUID NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    concepto VARCHAR(120) NOT NULL,
    monto NUMERIC(10,2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado pension_estado NOT NULL DEFAULT 'pendiente',
    CONSTRAINT chk_pension_monto CHECK (monto >= 0)
);

CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pension_id UUID NOT NULL REFERENCES pensiones(id) ON DELETE CASCADE,
    monto NUMERIC(10,2) NOT NULL,
    fecha_pago TIMESTAMP NOT NULL DEFAULT NOW(),
    metodo_pago VARCHAR(50) NOT NULL,
    CONSTRAINT chk_pago_monto CHECK (monto > 0)
);

-- =========================================================
-- ÍNDICES
-- =========================================================
CREATE INDEX idx_personas_dni ON personas(dni);
CREATE INDEX idx_personas_apellidos_nombres ON personas(apellido_paterno, apellido_materno, nombres);
CREATE INDEX idx_alumnos_codigo ON alumnos(codigo_estudiante);
CREATE INDEX idx_alumnos_created_at ON alumnos(created_at DESC);
CREATE INDEX idx_matriculas_seccion ON matriculas(seccion_id);
CREATE INDEX idx_matriculas_anio_estado ON matriculas(anio_escolar_id, estado);
CREATE INDEX idx_grados_orden ON grados(orden);
CREATE INDEX idx_docente_curso_seccion_seccion ON docente_curso_seccion(seccion_id);
CREATE INDEX idx_docente_curso_seccion_docente ON docente_curso_seccion(docente_id);
CREATE INDEX idx_evaluaciones_bimestre_curso ON evaluaciones(bimestre_id, curso_id);
CREATE INDEX idx_notas_alumno ON notas(alumno_id);
CREATE INDEX idx_pensiones_matricula ON pensiones(matricula_id);
CREATE INDEX idx_pensiones_estado_vencimiento ON pensiones(estado, fecha_vencimiento);
CREATE INDEX idx_pagos_pension ON pagos(pension_id);
CREATE INDEX idx_asistencias_seccion_fecha ON asistencias_alumnos(seccion_id, fecha);
CREATE INDEX idx_alumno_apoderado_apoderado ON alumno_apoderado(apoderado_id);
