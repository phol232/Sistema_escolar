-- =========================================================
-- PERF DIAGNOSTICS (Phase 2)
-- Ejecutar en Supabase SQL Editor con rol autenticado/admin
-- =========================================================

-- 1) Personas paginadas (consulta crítica de /personas)
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, dni, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, direccion, ubigeo, telefono, email, estado
FROM personas
ORDER BY apellido_paterno ASC, apellido_materno ASC, nombres ASC
LIMIT 50 OFFSET 0;

-- 2) Docentes con join a personas (consulta crítica de /docentes)
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT
  d.id,
  d.persona_id,
  d.especialidad,
  d.fecha_contratacion,
  d.estado,
  p.id AS persona_pk,
  p.dni,
  p.nombres,
  p.apellido_paterno,
  p.apellido_materno
FROM docentes d
JOIN personas p ON p.id = d.persona_id
ORDER BY d.id DESC
LIMIT 50 OFFSET 0;

-- 3) Alumnos con join a personas
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT
  a.id,
  a.persona_id,
  a.codigo_estudiante,
  a.procedencia_colegio,
  a.estado,
  p.id AS persona_pk,
  p.dni,
  p.nombres,
  p.apellido_paterno,
  p.apellido_materno
FROM alumnos a
JOIN personas p ON p.id = a.persona_id
ORDER BY a.id DESC
LIMIT 50 OFFSET 0;

-- 4) Apoderados con join a personas
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT
  ap.id,
  ap.persona_id,
  ap.ocupacion,
  ap.estado,
  p.id AS persona_pk,
  p.dni,
  p.nombres,
  p.apellido_paterno,
  p.apellido_materno
FROM apoderados ap
JOIN personas p ON p.id = ap.persona_id
ORDER BY ap.id DESC
LIMIT 50 OFFSET 0;

-- 5) Vinculaciones alumno-apoderado
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, alumno_id, apoderado_id, parentesco, es_principal
FROM alumno_apoderado;

-- 6) RPC de perfil de usuario (camino de auth rápido en layout)
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT *
FROM public.get_user_profile();

-- 7) Top queries por tiempo total (si pg_stat_statements está habilitado)
-- Si falla, habilitar extensión en el proyecto y volver a correr.
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  rows
FROM pg_stat_statements
WHERE query ILIKE '%personas%'
   OR query ILIKE '%docentes%'
   OR query ILIKE '%alumnos%'
   OR query ILIKE '%apoderados%'
   OR query ILIKE '%alumno_apoderado%'
   OR query ILIKE '%get_user_profile%'
   OR query ILIKE '%get_user_role%'
   OR query ILIKE '%get_user_persona_id%'
ORDER BY total_exec_time DESC
LIMIT 30;

-- 8) Verificar si el usuario autenticado tiene perfil activo en public.usuarios
-- Si auth_uid es NULL, ejecutaste como servicio/admin sin JWT de usuario final.
SELECT
  auth.uid() AS auth_uid,
  (
    SELECT count(*)
    FROM usuarios u
    WHERE u.id = auth.uid()
      AND u.estado = 'activo'
  ) AS active_profile_rows;

-- 9) Detectar FKs sin índice de apoyo (debería devolver 0 filas idealmente)
SELECT
  c.conrelid::regclass AS table_name,
  c.conname AS fk_name,
  pg_get_constraintdef(c.oid) AS fk_definition
FROM pg_constraint c
WHERE c.contype = 'f'
  AND NOT EXISTS (
    SELECT 1
    FROM pg_index i
    WHERE i.indrelid = c.conrelid
      AND i.indisvalid
      AND i.indkey::smallint[] @> c.conkey
  )
ORDER BY 1, 2;

-- 10) Configuración: años escolares
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, anio, fecha_inicio, fecha_fin, activo
FROM anios_escolares
ORDER BY anio DESC;

-- 11) Configuración: niveles
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, codigo, nombre, estado
FROM niveles
ORDER BY nombre ASC;

-- 12) Configuración: grados
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, nivel_id, nombre, orden, estado
FROM grados
ORDER BY orden ASC;

-- 13) Configuración: aulas
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, nombre, capacidad
FROM aulas
ORDER BY nombre ASC;
