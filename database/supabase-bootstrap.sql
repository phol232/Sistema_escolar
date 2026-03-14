-- =========================================================
-- SUPABASE AUTH, RLS, RPCS, VIEWS Y TRIGGERS
-- =========================================================

-- Relación esperada:
-- auth.users.id = public.usuarios.id

-- =========================================================
-- LIMPIEZA IDEMPOTENTE (RE-EJECUCIÓN SEGURA)
-- =========================================================
DROP TRIGGER IF EXISTS trg_solo_un_anio_activo ON anios_escolares;

DROP POLICY IF EXISTS "staff_all_personas" ON personas;
DROP POLICY IF EXISTS "docente_read_personas" ON personas;
DROP POLICY IF EXISTS "apoderado_read_personas" ON personas;
DROP POLICY IF EXISTS "staff_all_alumnos" ON alumnos;
DROP POLICY IF EXISTS "docente_read_alumnos" ON alumnos;
DROP POLICY IF EXISTS "apoderado_read_alumnos" ON alumnos;
DROP POLICY IF EXISTS "staff_all_matriculas" ON matriculas;
DROP POLICY IF EXISTS "tesoreria_read_matriculas" ON matriculas;
DROP POLICY IF EXISTS "docente_read_matriculas" ON matriculas;
DROP POLICY IF EXISTS "apoderado_read_matriculas" ON matriculas;
DROP POLICY IF EXISTS "staff_read_notas" ON notas;
DROP POLICY IF EXISTS "docente_all_notas" ON notas;
DROP POLICY IF EXISTS "apoderado_read_notas" ON notas;
DROP POLICY IF EXISTS "tesoreria_all_pensiones" ON pensiones;
DROP POLICY IF EXISTS "secretaria_read_pensiones" ON pensiones;
DROP POLICY IF EXISTS "apoderado_read_pensiones" ON pensiones;
DROP POLICY IF EXISTS "tesoreria_all_pagos" ON pagos;
DROP POLICY IF EXISTS "apoderado_read_pagos" ON pagos;
DROP POLICY IF EXISTS "staff_all_asistencias" ON asistencias_alumnos;
DROP POLICY IF EXISTS "docente_all_asistencias" ON asistencias_alumnos;
DROP POLICY IF EXISTS "apoderado_read_asistencias" ON asistencias_alumnos;
DROP POLICY IF EXISTS "authenticated_read_anios_escolares" ON anios_escolares;
DROP POLICY IF EXISTS "authenticated_read_niveles" ON niveles;
DROP POLICY IF EXISTS "authenticated_read_grados" ON grados;
DROP POLICY IF EXISTS "authenticated_read_aulas" ON aulas;
DROP POLICY IF EXISTS "authenticated_read_cursos" ON cursos;
DROP POLICY IF EXISTS "authenticated_read_bimestres" ON bimestres;
DROP POLICY IF EXISTS "admin_write_anios_escolares" ON anios_escolares;
DROP POLICY IF EXISTS "admin_write_niveles" ON niveles;
DROP POLICY IF EXISTS "admin_write_grados" ON grados;
DROP POLICY IF EXISTS "admin_write_aulas" ON aulas;
DROP POLICY IF EXISTS "admin_write_cursos" ON cursos;
DROP POLICY IF EXISTS "staff_read_secciones" ON secciones;
DROP POLICY IF EXISTS "admin_write_secciones" ON secciones;
DROP POLICY IF EXISTS "staff_read_evaluaciones" ON evaluaciones;
DROP POLICY IF EXISTS "admin_write_evaluaciones" ON evaluaciones;
DROP POLICY IF EXISTS "docente_write_evaluaciones" ON evaluaciones;
DROP POLICY IF EXISTS "authenticated_read_docentes" ON docentes;
DROP POLICY IF EXISTS "admin_write_docentes" ON docentes;
DROP POLICY IF EXISTS "staff_read_apoderados" ON apoderados;
DROP POLICY IF EXISTS "admin_write_apoderados" ON apoderados;
DROP POLICY IF EXISTS "apoderado_read_self" ON apoderados;
DROP POLICY IF EXISTS "admin_all_usuarios" ON usuarios;
DROP POLICY IF EXISTS "self_read_usuario" ON usuarios;

DROP VIEW IF EXISTS v_docentes_asignaciones;
DROP VIEW IF EXISTS v_resumen_pensiones;
DROP VIEW IF EXISTS v_alumnos_seccion_actual;

DROP FUNCTION IF EXISTS public.obtener_promedios_bimestre(UUID, UUID, UUID);
DROP FUNCTION IF EXISTS public.registrar_pago(UUID, NUMERIC, VARCHAR);
DROP FUNCTION IF EXISTS public.crear_matricula(UUID, UUID, UUID, JSONB);
DROP FUNCTION IF EXISTS public.fn_marcar_pensiones_vencidas();
DROP FUNCTION IF EXISTS public.fn_solo_un_anio_activo();
DROP FUNCTION IF EXISTS public.get_user_profile();
DROP FUNCTION IF EXISTS public.get_user_persona_id();
DROP FUNCTION IF EXISTS public.get_user_role();

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS usuario_rol_tipo
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.nombre
  FROM usuarios u
  JOIN roles r ON r.id = u.rol_id
  WHERE u.id = auth.uid()
    AND u.estado = 'activo'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_user_persona_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.persona_id
  FROM usuarios u
  WHERE u.id = auth.uid()
    AND u.estado = 'activo'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS TABLE(role usuario_rol_tipo, persona_id UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.nombre AS role, u.persona_id
  FROM usuarios u
  JOIN roles r ON r.id = u.rol_id
  WHERE u.id = auth.uid()
    AND u.estado = 'activo'
  LIMIT 1
$$;

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

ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pensiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias_alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE anios_escolares ENABLE ROW LEVEL SECURITY;
ALTER TABLE niveles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grados ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bimestres ENABLE ROW LEVEL SECURITY;
ALTER TABLE secciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE docentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE apoderados ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_all_personas" ON personas
  FOR ALL
  USING ((select get_user_role()) IN ('super_admin', 'director', 'subdirector', 'secretaria'))
  WITH CHECK ((select get_user_role()) IN ('super_admin', 'director', 'subdirector', 'secretaria'));

CREATE POLICY "docente_read_personas" ON personas
  FOR SELECT
  USING (
    (select get_user_role()) IN ('docente', 'tutor')
    AND (
      id = (select get_user_persona_id())
      OR id IN (
        SELECT a.persona_id FROM alumnos a
        JOIN matriculas m ON m.alumno_id = a.id
        JOIN secciones s ON s.id = m.seccion_id
        JOIN docente_curso_seccion dcs ON dcs.seccion_id = s.id
        JOIN docentes d ON d.id = dcs.docente_id
        WHERE d.persona_id = (select get_user_persona_id())
          AND m.estado = 'activa'
      )
    )
  );

CREATE POLICY "apoderado_read_personas" ON personas
  FOR SELECT
  USING (
    (select get_user_role()) = 'apoderado'
    AND (
      id = (select get_user_persona_id())
      OR id IN (
        SELECT al.persona_id FROM alumnos al
        JOIN alumno_apoderado aa ON aa.alumno_id = al.id
        JOIN apoderados ap ON ap.id = aa.apoderado_id
        WHERE ap.persona_id = (select get_user_persona_id())
      )
    )
  );

CREATE POLICY "staff_all_alumnos" ON alumnos
  FOR ALL
  USING ((select get_user_role()) IN ('super_admin', 'director', 'subdirector', 'secretaria'))
  WITH CHECK ((select get_user_role()) IN ('super_admin', 'director', 'subdirector', 'secretaria'));

CREATE POLICY "docente_read_alumnos" ON alumnos
  FOR SELECT
  USING (
    (select get_user_role()) IN ('docente', 'tutor')
    AND id IN (
      SELECT m.alumno_id FROM matriculas m
      JOIN docente_curso_seccion dcs ON dcs.seccion_id = m.seccion_id
      JOIN docentes d ON d.id = dcs.docente_id
      WHERE d.persona_id = (select get_user_persona_id())
        AND m.estado = 'activa'
    )
  );

CREATE POLICY "apoderado_read_alumnos" ON alumnos
  FOR SELECT
  USING (
    (select get_user_role()) = 'apoderado'
    AND id IN (
      SELECT aa.alumno_id FROM alumno_apoderado aa
      JOIN apoderados ap ON ap.id = aa.apoderado_id
      WHERE ap.persona_id = (select get_user_persona_id())
    )
  );

CREATE POLICY "staff_all_matriculas" ON matriculas
  FOR ALL
  USING ((select get_user_role()) IN ('super_admin', 'director', 'subdirector', 'secretaria'))
  WITH CHECK ((select get_user_role()) IN ('super_admin', 'director', 'subdirector', 'secretaria'));

CREATE POLICY "tesoreria_read_matriculas" ON matriculas
  FOR SELECT
  USING ((select get_user_role()) = 'tesoreria');

CREATE POLICY "docente_read_matriculas" ON matriculas
  FOR SELECT
  USING (
    (select get_user_role()) IN ('docente', 'tutor')
    AND seccion_id IN (
      SELECT dcs.seccion_id FROM docente_curso_seccion dcs
      JOIN docentes d ON d.id = dcs.docente_id
      WHERE d.persona_id = (select get_user_persona_id())
    )
  );

CREATE POLICY "apoderado_read_matriculas" ON matriculas
  FOR SELECT
  USING (
    (select get_user_role()) = 'apoderado'
    AND alumno_id IN (
      SELECT aa.alumno_id FROM alumno_apoderado aa
      JOIN apoderados ap ON ap.id = aa.apoderado_id
      WHERE ap.persona_id = (select get_user_persona_id())
    )
  );

CREATE POLICY "staff_read_notas" ON notas
  FOR SELECT
  USING ((select get_user_role()) IN ('super_admin', 'director', 'subdirector'));

CREATE POLICY "docente_all_notas" ON notas
  FOR ALL
  USING (
    (select get_user_role()) IN ('docente', 'tutor')
    AND evaluacion_id IN (
      SELECT e.id FROM evaluaciones e
      JOIN docente_curso_seccion dcs ON dcs.seccion_id = e.seccion_id AND dcs.curso_id = e.curso_id
      JOIN docentes d ON d.id = dcs.docente_id
      WHERE d.persona_id = (select get_user_persona_id())
    )
  )
  WITH CHECK (
    (select get_user_role()) IN ('docente', 'tutor')
    AND evaluacion_id IN (
      SELECT e.id FROM evaluaciones e
      JOIN docente_curso_seccion dcs ON dcs.seccion_id = e.seccion_id AND dcs.curso_id = e.curso_id
      JOIN docentes d ON d.id = dcs.docente_id
      WHERE d.persona_id = (select get_user_persona_id())
    )
  );

CREATE POLICY "apoderado_read_notas" ON notas
  FOR SELECT
  USING (
    (select get_user_role()) = 'apoderado'
    AND alumno_id IN (
      SELECT aa.alumno_id FROM alumno_apoderado aa
      JOIN apoderados ap ON ap.id = aa.apoderado_id
      WHERE ap.persona_id = (select get_user_persona_id())
    )
  );

CREATE POLICY "tesoreria_all_pensiones" ON pensiones
  FOR ALL
  USING ((select get_user_role()) IN ('super_admin', 'director', 'tesoreria'))
  WITH CHECK ((select get_user_role()) IN ('super_admin', 'director', 'tesoreria'));

CREATE POLICY "secretaria_read_pensiones" ON pensiones
  FOR SELECT
  USING ((select get_user_role()) = 'secretaria');

CREATE POLICY "apoderado_read_pensiones" ON pensiones
  FOR SELECT
  USING (
    (select get_user_role()) = 'apoderado'
    AND matricula_id IN (
      SELECT m.id FROM matriculas m
      JOIN alumnos a ON a.id = m.alumno_id
      JOIN alumno_apoderado aa ON aa.alumno_id = a.id
      JOIN apoderados ap ON ap.id = aa.apoderado_id
      WHERE ap.persona_id = (select get_user_persona_id())
    )
  );

CREATE POLICY "tesoreria_all_pagos" ON pagos
  FOR ALL
  USING ((select get_user_role()) IN ('super_admin', 'director', 'tesoreria'))
  WITH CHECK ((select get_user_role()) IN ('super_admin', 'director', 'tesoreria'));

CREATE POLICY "apoderado_read_pagos" ON pagos
  FOR SELECT
  USING (
    (select get_user_role()) = 'apoderado'
    AND pension_id IN (
      SELECT p.id FROM pensiones p
      JOIN matriculas m ON m.id = p.matricula_id
      JOIN alumnos a ON a.id = m.alumno_id
      JOIN alumno_apoderado aa ON aa.alumno_id = a.id
      JOIN apoderados ap ON ap.id = aa.apoderado_id
      WHERE ap.persona_id = (select get_user_persona_id())
    )
  );

CREATE POLICY "staff_all_asistencias" ON asistencias_alumnos
  FOR ALL
  USING ((select get_user_role()) IN ('super_admin', 'director', 'subdirector'))
  WITH CHECK ((select get_user_role()) IN ('super_admin', 'director', 'subdirector'));

CREATE POLICY "docente_all_asistencias" ON asistencias_alumnos
  FOR ALL
  USING (
    (select get_user_role()) IN ('docente', 'tutor')
    AND seccion_id IN (
      SELECT dcs.seccion_id FROM docente_curso_seccion dcs
      JOIN docentes d ON d.id = dcs.docente_id
      WHERE d.persona_id = (select get_user_persona_id())
    )
  )
  WITH CHECK (
    (select get_user_role()) IN ('docente', 'tutor')
    AND seccion_id IN (
      SELECT dcs.seccion_id FROM docente_curso_seccion dcs
      JOIN docentes d ON d.id = dcs.docente_id
      WHERE d.persona_id = (select get_user_persona_id())
    )
  );

CREATE POLICY "apoderado_read_asistencias" ON asistencias_alumnos
  FOR SELECT
  USING (
    (select get_user_role()) = 'apoderado'
    AND alumno_id IN (
      SELECT aa.alumno_id FROM alumno_apoderado aa
      JOIN apoderados ap ON ap.id = aa.apoderado_id
      WHERE ap.persona_id = (select get_user_persona_id())
    )
  );

CREATE POLICY "authenticated_read_anios_escolares" ON anios_escolares FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_read_niveles" ON niveles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_read_grados" ON grados FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_read_aulas" ON aulas FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_read_cursos" ON cursos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_read_bimestres" ON bimestres FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_write_anios_escolares" ON anios_escolares
  FOR ALL
  USING ((select get_user_role()) IN ('super_admin', 'director'))
  WITH CHECK ((select get_user_role()) IN ('super_admin', 'director'));

CREATE POLICY "admin_write_niveles" ON niveles
  FOR ALL
  USING ((select get_user_role()) IN ('super_admin', 'director'))
  WITH CHECK ((select get_user_role()) IN ('super_admin', 'director'));

CREATE POLICY "admin_write_grados" ON grados
  FOR ALL
  USING ((select get_user_role()) IN ('super_admin', 'director'))
  WITH CHECK ((select get_user_role()) IN ('super_admin', 'director'));

CREATE POLICY "admin_write_aulas" ON aulas
  FOR ALL
  USING ((select get_user_role()) IN ('super_admin', 'director'))
  WITH CHECK ((select get_user_role()) IN ('super_admin', 'director'));

CREATE POLICY "admin_write_cursos" ON cursos
  FOR ALL
  USING ((select get_user_role()) IN ('super_admin', 'director'))
  WITH CHECK ((select get_user_role()) IN ('super_admin', 'director'));

CREATE POLICY "staff_read_secciones" ON secciones FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_write_secciones" ON secciones
  FOR ALL
  USING ((select get_user_role()) IN ('super_admin', 'director', 'subdirector'))
  WITH CHECK ((select get_user_role()) IN ('super_admin', 'director', 'subdirector'));

CREATE POLICY "staff_read_evaluaciones" ON evaluaciones FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_write_evaluaciones" ON evaluaciones
  FOR ALL
  USING ((select get_user_role()) IN ('super_admin', 'director', 'subdirector'))
  WITH CHECK ((select get_user_role()) IN ('super_admin', 'director', 'subdirector'));

CREATE POLICY "docente_write_evaluaciones" ON evaluaciones
  FOR INSERT
  WITH CHECK (
    (select get_user_role()) IN ('docente', 'tutor')
    AND EXISTS (
      SELECT 1 FROM docente_curso_seccion dcs
      JOIN docentes d ON d.id = dcs.docente_id
      WHERE dcs.seccion_id = evaluaciones.seccion_id
        AND dcs.curso_id = evaluaciones.curso_id
        AND d.persona_id = (select get_user_persona_id())
    )
  );

CREATE POLICY "authenticated_read_docentes" ON docentes FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_write_docentes" ON docentes
  FOR ALL
  USING ((select get_user_role()) IN ('super_admin', 'director', 'subdirector'))
  WITH CHECK ((select get_user_role()) IN ('super_admin', 'director', 'subdirector'));

CREATE POLICY "staff_read_apoderados" ON apoderados
  FOR SELECT
  USING ((select get_user_role()) IN ('super_admin', 'director', 'subdirector', 'secretaria', 'tutor'));

CREATE POLICY "admin_write_apoderados" ON apoderados
  FOR ALL
  USING ((select get_user_role()) IN ('super_admin', 'director', 'secretaria'))
  WITH CHECK ((select get_user_role()) IN ('super_admin', 'director', 'secretaria'));

CREATE POLICY "apoderado_read_self" ON apoderados
  FOR SELECT
  USING (
    (select get_user_role()) = 'apoderado'
    AND persona_id = (select get_user_persona_id())
  );

CREATE POLICY "admin_all_usuarios" ON usuarios
  FOR ALL
  USING ((select get_user_role()) = 'super_admin')
  WITH CHECK ((select get_user_role()) = 'super_admin');

CREATE POLICY "self_read_usuario" ON usuarios
  FOR SELECT
  USING (id = auth.uid());

CREATE OR REPLACE FUNCTION public.crear_matricula(
  p_alumno_id UUID,
  p_anio_escolar_id UUID,
  p_seccion_id UUID,
  p_conceptos JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_matricula_id UUID;
  v_concepto JSONB;
  v_capacidad INTEGER;
  v_matriculados INTEGER;
BEGIN
  SELECT a.capacidad INTO v_capacidad
  FROM secciones s
  JOIN aulas a ON a.id = s.aula_id
  WHERE s.id = p_seccion_id;

  SELECT COUNT(*) INTO v_matriculados
  FROM matriculas
  WHERE seccion_id = p_seccion_id
    AND anio_escolar_id = p_anio_escolar_id
    AND estado IN ('activa', 'reservada');

  IF v_matriculados >= v_capacidad THEN
    RAISE EXCEPTION 'La sección ha alcanzado su capacidad máxima (% de %)', v_matriculados, v_capacidad;
  END IF;

  INSERT INTO matriculas (alumno_id, anio_escolar_id, seccion_id)
  VALUES (p_alumno_id, p_anio_escolar_id, p_seccion_id)
  RETURNING id INTO v_matricula_id;

  FOR v_concepto IN SELECT * FROM jsonb_array_elements(p_conceptos)
  LOOP
    INSERT INTO pensiones (matricula_id, concepto, monto, fecha_vencimiento)
    VALUES (
      v_matricula_id,
      v_concepto->>'concepto',
      (v_concepto->>'monto')::NUMERIC,
      (v_concepto->>'fecha_vencimiento')::DATE
    );
  END LOOP;

  RETURN v_matricula_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.registrar_pago(
  p_pension_id UUID,
  p_monto NUMERIC,
  p_metodo_pago VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pago_id UUID;
  v_pension_monto NUMERIC;
  v_total_pagado NUMERIC;
BEGIN
  SELECT monto INTO v_pension_monto
  FROM pensiones WHERE id = p_pension_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pensión no encontrada';
  END IF;

  INSERT INTO pagos (pension_id, monto, metodo_pago)
  VALUES (p_pension_id, p_monto, p_metodo_pago)
  RETURNING id INTO v_pago_id;

  SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado
  FROM pagos WHERE pension_id = p_pension_id;

  UPDATE pensiones
  SET estado = CASE
    WHEN v_total_pagado >= v_pension_monto THEN 'pagado'::pension_estado
    WHEN v_total_pagado > 0 THEN 'pagado_parcial'::pension_estado
    ELSE estado
  END
  WHERE id = p_pension_id;

  RETURN v_pago_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.obtener_promedios_bimestre(
  p_seccion_id UUID,
  p_curso_id UUID,
  p_bimestre_id UUID
)
RETURNS TABLE (
  alumno_id UUID,
  nombres TEXT,
  apellidos TEXT,
  promedio NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.id AS alumno_id,
    p.nombres,
    p.apellido_paterno || ' ' || p.apellido_materno AS apellidos,
    ROUND(SUM(n.nota * e.peso) / NULLIF(SUM(e.peso), 0), 2) AS promedio
  FROM notas n
  JOIN evaluaciones e ON e.id = n.evaluacion_id
  JOIN alumnos a ON a.id = n.alumno_id
  JOIN personas p ON p.id = a.persona_id
  WHERE e.seccion_id = p_seccion_id
    AND e.curso_id = p_curso_id
    AND e.bimestre_id = p_bimestre_id
  GROUP BY a.id, p.nombres, p.apellido_paterno, p.apellido_materno
  ORDER BY p.apellido_paterno, p.apellido_materno;
$$;

CREATE OR REPLACE VIEW v_alumnos_seccion_actual AS
SELECT
  a.id AS alumno_id,
  a.codigo_estudiante,
  p.dni,
  p.nombres,
  p.apellido_paterno,
  p.apellido_materno,
  g.nombre AS grado,
  s.letra AS seccion,
  n.nombre AS nivel,
  s.turno,
  m.estado AS estado_matricula,
  ae.anio
FROM alumnos a
JOIN personas p ON p.id = a.persona_id
JOIN matriculas m ON m.alumno_id = a.id
JOIN secciones s ON s.id = m.seccion_id
JOIN grados g ON g.id = s.grado_id
JOIN niveles n ON n.id = g.nivel_id
JOIN anios_escolares ae ON ae.id = m.anio_escolar_id
WHERE ae.activo = TRUE
  AND m.estado = 'activa';

CREATE OR REPLACE VIEW v_resumen_pensiones AS
SELECT
  a.id AS alumno_id,
  p.nombres || ' ' || p.apellido_paterno AS alumno_nombre,
  ae.anio,
  COUNT(pen.id) AS total_pensiones,
  COUNT(pen.id) FILTER (WHERE pen.estado = 'pagado') AS pensiones_pagadas,
  COUNT(pen.id) FILTER (WHERE pen.estado IN ('pendiente', 'vencido')) AS pensiones_pendientes,
  COALESCE(SUM(pen.monto), 0) AS monto_total,
  COALESCE(SUM(pen.monto) FILTER (WHERE pen.estado = 'pagado'), 0) AS monto_pagado,
  COALESCE(SUM(pen.monto) FILTER (WHERE pen.estado IN ('pendiente', 'vencido')), 0) AS monto_pendiente
FROM alumnos a
JOIN personas p ON p.id = a.persona_id
JOIN matriculas m ON m.alumno_id = a.id
JOIN anios_escolares ae ON ae.id = m.anio_escolar_id
LEFT JOIN pensiones pen ON pen.matricula_id = m.id
GROUP BY a.id, p.nombres, p.apellido_paterno, ae.anio;

CREATE OR REPLACE VIEW v_docentes_asignaciones AS
SELECT
  d.id AS docente_id,
  p.nombres,
  p.apellido_paterno,
  p.apellido_materno,
  d.especialidad,
  c.nombre AS curso,
  g.nombre AS grado,
  s.letra AS seccion,
  s.turno,
  ae.anio
FROM docentes d
JOIN personas p ON p.id = d.persona_id
JOIN docente_curso_seccion dcs ON dcs.docente_id = d.id
JOIN cursos c ON c.id = dcs.curso_id
JOIN secciones s ON s.id = dcs.seccion_id
JOIN grados g ON g.id = s.grado_id
JOIN anios_escolares ae ON ae.id = s.anio_escolar_id
WHERE ae.activo = TRUE
  AND d.estado = 'activo';

CREATE OR REPLACE FUNCTION fn_marcar_pensiones_vencidas()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE pensiones
  SET estado = 'vencido'
  WHERE estado = 'pendiente'
    AND fecha_vencimiento < CURRENT_DATE;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION fn_solo_un_anio_activo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.activo = TRUE THEN
    UPDATE anios_escolares SET activo = FALSE WHERE id != NEW.id AND activo = TRUE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_solo_un_anio_activo ON anios_escolares;

CREATE TRIGGER trg_solo_un_anio_activo
  BEFORE INSERT OR UPDATE OF activo ON anios_escolares
  FOR EACH ROW
  WHEN (NEW.activo = TRUE)
  EXECUTE FUNCTION fn_solo_un_anio_activo();

-- =========================================================
-- HOTFIX DE RENDIMIENTO (NAVEGACIÓN DASHBOARD)
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_personas_apellidos_nombres
  ON personas(apellido_paterno, apellido_materno, nombres);

CREATE INDEX IF NOT EXISTS idx_alumnos_created_at
  ON alumnos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_grados_orden
  ON grados(orden);

-- Índices de soporte para paths críticos de RLS y joins de asignaciones
CREATE INDEX IF NOT EXISTS idx_docente_curso_seccion_docente_id
  ON docente_curso_seccion(docente_id);

CREATE INDEX IF NOT EXISTS idx_matriculas_seccion_estado
  ON matriculas(seccion_id, estado);

CREATE INDEX IF NOT EXISTS idx_alumno_apoderado_apoderado_id
  ON alumno_apoderado(apoderado_id);
