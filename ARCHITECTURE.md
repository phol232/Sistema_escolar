# Sistema de Gestión Escolar — Arquitectura y Documentación

> Documento de referencia para agentes de IA y desarrolladores.
> Última actualización: 2026-03-13

---

## 1. Visión General

Sistema web para gestión integral de colegios en Perú (primaria y secundaria). Cubre: matrículas, asistencia, evaluaciones/notas, tesorería (pensiones y pagos), gestión de docentes y apoderados.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Uso |
|------|-----------|-----|
| **Framework** | Next.js 15+ (App Router) | SSR, RSC, Route Handlers |
| **Lenguaje** | TypeScript (strict) | Todo el proyecto |
| **Estilos** | Tailwind CSS 4 | Utilidades, responsive |
| **Componentes UI** | shadcn/ui | Componentes base accesibles |
| **Formularios** | React Hook Form + Zod | Validación client/server |
| **Tablas** | TanStack Table | Tablas con paginación, filtros, sorting |
| **Cache cliente** | TanStack Query | Solo donde se necesite cache/invalidación en cliente |
| **Backend** | Supabase | Postgres, Auth, Storage, Realtime |
| **Base de datos** | PostgreSQL | Con RLS, funciones, triggers, views |

---

## 3. Arquitectura del Frontend

### 3.1 Estructura de Carpetas

```
src/
├── app/                          # App Router de Next.js
│   ├── (auth)/                   # Grupo: páginas públicas (login, recovery)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── recuperar/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Layout sin sidebar
│   │
│   ├── (dashboard)/              # Grupo: páginas protegidas
│   │   ├── layout.tsx            # Layout con sidebar + topbar
│   │   ├── inicio/
│   │   │   └── page.tsx          # Dashboard principal
│   │   ├── alumnos/
│   │   │   ├── page.tsx          # Listado
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx      # Formulario crear
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Detalle / editar
│   │   │       └── asistencia/
│   │   │           └── page.tsx
│   │   ├── docentes/
│   │   │   ├── page.tsx
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── apoderados/
│   │   │   ├── page.tsx
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── matriculas/
│   │   │   ├── page.tsx
│   │   │   └── nueva/
│   │   │       └── page.tsx
│   │   ├── academico/
│   │   │   ├── secciones/
│   │   │   │   └── page.tsx
│   │   │   ├── cursos/
│   │   │   │   └── page.tsx
│   │   │   └── asignaciones/
│   │   │       └── page.tsx
│   │   ├── evaluaciones/
│   │   │   ├── page.tsx          # Gestión de evaluaciones
│   │   │   └── notas/
│   │   │       └── page.tsx      # Ingreso de notas por sección/curso
│   │   ├── asistencia/
│   │   │   └── page.tsx          # Registro diario de asistencia
│   │   ├── tesoreria/
│   │   │   ├── pensiones/
│   │   │   │   └── page.tsx
│   │   │   └── pagos/
│   │   │       └── page.tsx
│   │   └── configuracion/
│   │       ├── anio-escolar/
│   │       │   └── page.tsx
│   │       ├── niveles-grados/
│   │       │   └── page.tsx
│   │       ├── aulas/
│   │       │   └── page.tsx
│   │       └── usuarios/
│   │           └── page.tsx
│   │
│   ├── api/                      # Route Handlers
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   ├── matriculas/
│   │   │   └── route.ts          # Proceso crítico server-side
│   │   ├── pagos/
│   │   │   └── route.ts          # Proceso crítico server-side
│   │   └── reportes/
│   │       └── route.ts
│   │
│   ├── layout.tsx                # Root layout
│   ├── not-found.tsx
│   └── error.tsx
│
├── components/
│   ├── ui/                       # shadcn/ui (generados)
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   ├── nav-links.tsx
│   │   └── user-menu.tsx
│   ├── forms/
│   │   ├── alumno-form.tsx
│   │   ├── docente-form.tsx
│   │   ├── apoderado-form.tsx
│   │   ├── matricula-form.tsx
│   │   ├── evaluacion-form.tsx
│   │   └── pago-form.tsx
│   ├── tables/
│   │   ├── alumnos-table.tsx
│   │   ├── docentes-table.tsx
│   │   ├── matriculas-table.tsx
│   │   ├── pensiones-table.tsx
│   │   ├── notas-table.tsx
│   │   └── data-table.tsx        # Componente genérico TanStack Table
│   └── shared/
│       ├── page-header.tsx
│       ├── loading-skeleton.tsx
│       ├── empty-state.tsx
│       ├── confirm-dialog.tsx
│       ├── search-input.tsx
│       └── status-badge.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # createBrowserClient
│   │   ├── server.ts             # createServerClient (cookies)
│   │   ├── admin.ts              # createClient con service_role (solo Route Handlers)
│   │   └── middleware.ts         # Refresh de sesión
│   ├── validations/
│   │   ├── alumno.schema.ts
│   │   ├── docente.schema.ts
│   │   ├── matricula.schema.ts
│   │   ├── evaluacion.schema.ts
│   │   ├── pago.schema.ts
│   │   └── shared.schema.ts      # Schemas reutilizables (DNI, email, etc.)
│   ├── utils.ts                  # cn(), formatDate(), etc.
│   ├── constants.ts              # Roles, estados, turnos
│   └── types/
│       ├── database.ts           # Tipos generados de Supabase
│       └── index.ts              # Tipos de dominio adicionales
│
├── hooks/
│   ├── use-user.ts               # Hook para obtener usuario + rol
│   ├── use-anio-escolar.ts       # Año escolar activo
│   └── use-debounce.ts
│
├── middleware.ts                  # Protección de rutas + refresh de sesión
│
└── styles/
    └── globals.css               # Tailwind directives + custom tokens
```

### 3.2 Patrones Clave del Frontend

#### Server Components por defecto
Todas las páginas son Server Components. Solo se usa `"use client"` en:
- Formularios interactivos (React Hook Form)
- Tablas con sorting/filtros client-side (TanStack Table)
- Componentes que necesitan `useState`, `useEffect`, event handlers

#### Data Fetching
```
Página (Server Component)
  → Llama a Supabase con createServerClient
  → Pasa data como props al componente client (si es interactivo)
```

**NO usar TanStack Query** salvo que se necesite:
- Polling / cache con invalidación (ej: dashboard con datos en tiempo real)
- Mutaciones optimistas

**SÍ usar Server Actions** o **Route Handlers** para mutaciones.

#### Formularios
```
1. Definir schema Zod en lib/validations/
2. Componente client con React Hook Form + zodResolver
3. onSubmit → Server Action o fetch a Route Handler
4. Validar con el MISMO schema Zod en el server
```

#### Tablas
```
1. Componente genérico data-table.tsx con TanStack Table
2. Cada tabla específica define sus columnas (columnDefs)
3. Paginación server-side para tablas grandes (alumnos, pensiones)
4. Search/filter delegado al server vía searchParams
```

### 3.3 Navegación por Rol

| Rol | Secciones visibles |
|-----|-------------------|
| `super_admin` | Todo |
| `director` | Todo excepto config de usuarios |
| `subdirector` | Académico, alumnos, docentes, asistencia, evaluaciones |
| `secretaria` | Matrículas, alumnos, apoderados |
| `tesoreria` | Tesorería, matrículas (solo lectura) |
| `docente` | Sus secciones, evaluaciones/notas de sus cursos, asistencia |
| `tutor` | Su sección, asistencia, notas (lectura), apoderados |
| `apoderado` | Solo datos de sus hijos: notas, asistencia, pensiones |

---

## 4. Supabase Auth — Integración

### 4.1 Flujo de Autenticación

```
1. Login con email/password → supabase.auth.signInWithPassword()
2. Supabase genera JWT con user.id (= auth.uid())
3. middleware.ts intercepta cada request:
   a. Refresca sesión si es necesario
   b. Redirige a /login si no hay sesión
   c. Permite acceso a rutas según rol (leído de tabla usuarios)
4. En pages/layouts: createServerClient lee cookies automáticamente
```

### 4.2 Vinculación Auth ↔ Base de Datos

```sql
-- Relación: auth.users.id → usuarios.id
-- El id del usuario en Supabase Auth ES el mismo UUID que usuarios.id
-- Esto permite que auth.uid() en RLS apunte directamente a usuarios
```

**Importante**: Al crear un usuario:
1. Se crea en `auth.users` (Supabase Auth)
2. Se crea el registro en `personas`
3. Se crea el registro en `usuarios` con `id = auth.users.id`
4. Esto se hace en un Route Handler con `supabase.auth.admin.createUser()` + inserts con service_role

### 4.3 Función Helper para RLS

```sql
-- Función que obtiene el rol del usuario autenticado
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
$$;

-- Función que obtiene el persona_id del usuario autenticado
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
$$;
```

---

## 5. Row Level Security (RLS) — Políticas

### 5.1 Principios

1. **RLS habilitado en TODAS las tablas** (excepto `roles` que es solo lectura)
2. **Deny by default**: sin política = sin acceso
3. **Roles administrativos** (`super_admin`, `director`, `subdirector`, `secretaria`, `tesoreria`) tienen acceso amplio
4. **Docentes** solo ven datos de sus secciones/cursos asignados
5. **Apoderados** solo ven datos de sus hijos
6. **Validación doble**: RLS en DB + verificación de rol en middleware/Route Handlers

### 5.2 Políticas por Tabla

#### personas
```sql
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- Staff administrativo: acceso total
CREATE POLICY "staff_all_personas" ON personas
  FOR ALL
  USING (get_user_role() IN ('super_admin', 'director', 'subdirector', 'secretaria'))
  WITH CHECK (get_user_role() IN ('super_admin', 'director', 'subdirector', 'secretaria'));

-- Docentes: lectura de personas vinculadas a sus secciones
CREATE POLICY "docente_read_personas" ON personas
  FOR SELECT
  USING (
    get_user_role() IN ('docente', 'tutor')
    AND (
      -- Su propia persona
      id = get_user_persona_id()
      -- Alumnos de sus secciones
      OR id IN (
        SELECT a.persona_id FROM alumnos a
        JOIN matriculas m ON m.alumno_id = a.id
        JOIN secciones s ON s.id = m.seccion_id
        JOIN docente_curso_seccion dcs ON dcs.seccion_id = s.id
        JOIN docentes d ON d.id = dcs.docente_id
        WHERE d.persona_id = get_user_persona_id()
          AND m.estado = 'activa'
      )
    )
  );

-- Apoderados: solo sus datos y los de sus hijos
CREATE POLICY "apoderado_read_personas" ON personas
  FOR SELECT
  USING (
    get_user_role() = 'apoderado'
    AND (
      id = get_user_persona_id()
      OR id IN (
        SELECT al.persona_id FROM alumnos al
        JOIN alumno_apoderado aa ON aa.alumno_id = al.id
        JOIN apoderados ap ON ap.id = aa.apoderado_id
        WHERE ap.persona_id = get_user_persona_id()
      )
    )
  );
```

#### alumnos
```sql
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_all_alumnos" ON alumnos
  FOR ALL
  USING (get_user_role() IN ('super_admin', 'director', 'subdirector', 'secretaria'))
  WITH CHECK (get_user_role() IN ('super_admin', 'director', 'subdirector', 'secretaria'));

CREATE POLICY "docente_read_alumnos" ON alumnos
  FOR SELECT
  USING (
    get_user_role() IN ('docente', 'tutor')
    AND id IN (
      SELECT m.alumno_id FROM matriculas m
      JOIN docente_curso_seccion dcs ON dcs.seccion_id = m.seccion_id
      JOIN docentes d ON d.id = dcs.docente_id
      WHERE d.persona_id = get_user_persona_id()
        AND m.estado = 'activa'
    )
  );

CREATE POLICY "apoderado_read_alumnos" ON alumnos
  FOR SELECT
  USING (
    get_user_role() = 'apoderado'
    AND id IN (
      SELECT aa.alumno_id FROM alumno_apoderado aa
      JOIN apoderados ap ON ap.id = aa.apoderado_id
      WHERE ap.persona_id = get_user_persona_id()
    )
  );
```

#### matriculas
```sql
ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_all_matriculas" ON matriculas
  FOR ALL
  USING (get_user_role() IN ('super_admin', 'director', 'subdirector', 'secretaria'))
  WITH CHECK (get_user_role() IN ('super_admin', 'director', 'subdirector', 'secretaria'));

-- Tesorería: lectura para verificar estado de matrícula
CREATE POLICY "tesoreria_read_matriculas" ON matriculas
  FOR SELECT
  USING (get_user_role() = 'tesoreria');

CREATE POLICY "docente_read_matriculas" ON matriculas
  FOR SELECT
  USING (
    get_user_role() IN ('docente', 'tutor')
    AND seccion_id IN (
      SELECT dcs.seccion_id FROM docente_curso_seccion dcs
      JOIN docentes d ON d.id = dcs.docente_id
      WHERE d.persona_id = get_user_persona_id()
    )
  );

CREATE POLICY "apoderado_read_matriculas" ON matriculas
  FOR SELECT
  USING (
    get_user_role() = 'apoderado'
    AND alumno_id IN (
      SELECT aa.alumno_id FROM alumno_apoderado aa
      JOIN apoderados ap ON ap.id = aa.apoderado_id
      WHERE ap.persona_id = get_user_persona_id()
    )
  );
```

#### notas
```sql
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_read_notas" ON notas
  FOR SELECT
  USING (get_user_role() IN ('super_admin', 'director', 'subdirector'));

-- Docente: CRUD en notas de sus cursos/secciones
CREATE POLICY "docente_all_notas" ON notas
  FOR ALL
  USING (
    get_user_role() IN ('docente', 'tutor')
    AND evaluacion_id IN (
      SELECT e.id FROM evaluaciones e
      JOIN docente_curso_seccion dcs ON dcs.seccion_id = e.seccion_id AND dcs.curso_id = e.curso_id
      JOIN docentes d ON d.id = dcs.docente_id
      WHERE d.persona_id = get_user_persona_id()
    )
  )
  WITH CHECK (
    get_user_role() IN ('docente', 'tutor')
    AND evaluacion_id IN (
      SELECT e.id FROM evaluaciones e
      JOIN docente_curso_seccion dcs ON dcs.seccion_id = e.seccion_id AND dcs.curso_id = e.curso_id
      JOIN docentes d ON d.id = dcs.docente_id
      WHERE d.persona_id = get_user_persona_id()
    )
  );

-- Apoderado: solo lectura de notas de sus hijos
CREATE POLICY "apoderado_read_notas" ON notas
  FOR SELECT
  USING (
    get_user_role() = 'apoderado'
    AND alumno_id IN (
      SELECT aa.alumno_id FROM alumno_apoderado aa
      JOIN apoderados ap ON ap.id = aa.apoderado_id
      WHERE ap.persona_id = get_user_persona_id()
    )
  );
```

#### pensiones
```sql
ALTER TABLE pensiones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tesoreria_all_pensiones" ON pensiones
  FOR ALL
  USING (get_user_role() IN ('super_admin', 'director', 'tesoreria'))
  WITH CHECK (get_user_role() IN ('super_admin', 'director', 'tesoreria'));

CREATE POLICY "secretaria_read_pensiones" ON pensiones
  FOR SELECT
  USING (get_user_role() = 'secretaria');

CREATE POLICY "apoderado_read_pensiones" ON pensiones
  FOR SELECT
  USING (
    get_user_role() = 'apoderado'
    AND matricula_id IN (
      SELECT m.id FROM matriculas m
      JOIN alumnos a ON a.id = m.alumno_id
      JOIN alumno_apoderado aa ON aa.alumno_id = a.id
      JOIN apoderados ap ON ap.id = aa.apoderado_id
      WHERE ap.persona_id = get_user_persona_id()
    )
  );
```

#### pagos
```sql
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tesoreria_all_pagos" ON pagos
  FOR ALL
  USING (get_user_role() IN ('super_admin', 'director', 'tesoreria'))
  WITH CHECK (get_user_role() IN ('super_admin', 'director', 'tesoreria'));

CREATE POLICY "apoderado_read_pagos" ON pagos
  FOR SELECT
  USING (
    get_user_role() = 'apoderado'
    AND pension_id IN (
      SELECT p.id FROM pensiones p
      JOIN matriculas m ON m.id = p.matricula_id
      JOIN alumnos a ON a.id = m.alumno_id
      JOIN alumno_apoderado aa ON aa.alumno_id = a.id
      JOIN apoderados ap ON ap.id = aa.apoderado_id
      WHERE ap.persona_id = get_user_persona_id()
    )
  );
```

#### asistencias_alumnos
```sql
ALTER TABLE asistencias_alumnos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_all_asistencias" ON asistencias_alumnos
  FOR ALL
  USING (get_user_role() IN ('super_admin', 'director', 'subdirector'))
  WITH CHECK (get_user_role() IN ('super_admin', 'director', 'subdirector'));

-- Docente/tutor: CRUD en asistencias de sus secciones
CREATE POLICY "docente_all_asistencias" ON asistencias_alumnos
  FOR ALL
  USING (
    get_user_role() IN ('docente', 'tutor')
    AND seccion_id IN (
      SELECT dcs.seccion_id FROM docente_curso_seccion dcs
      JOIN docentes d ON d.id = dcs.docente_id
      WHERE d.persona_id = get_user_persona_id()
    )
  )
  WITH CHECK (
    get_user_role() IN ('docente', 'tutor')
    AND seccion_id IN (
      SELECT dcs.seccion_id FROM docente_curso_seccion dcs
      JOIN docentes d ON d.id = dcs.docente_id
      WHERE d.persona_id = get_user_persona_id()
    )
  );

CREATE POLICY "apoderado_read_asistencias" ON asistencias_alumnos
  FOR SELECT
  USING (
    get_user_role() = 'apoderado'
    AND alumno_id IN (
      SELECT aa.alumno_id FROM alumno_apoderado aa
      JOIN apoderados ap ON ap.id = aa.apoderado_id
      WHERE ap.persona_id = get_user_persona_id()
    )
  );
```

#### Tablas de configuración (solo admin)
```sql
-- anios_escolares, niveles, grados, aulas, cursos, bimestres, roles
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

-- Lectura general para usuarios autenticados (datos de referencia)
CREATE POLICY "authenticated_read" ON anios_escolares FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_read" ON niveles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_read" ON grados FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_read" ON aulas FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_read" ON cursos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_read" ON bimestres FOR SELECT USING (auth.uid() IS NOT NULL);

-- Escritura solo para admins
CREATE POLICY "admin_write" ON anios_escolares FOR ALL
  USING (get_user_role() IN ('super_admin', 'director'))
  WITH CHECK (get_user_role() IN ('super_admin', 'director'));

CREATE POLICY "admin_write" ON niveles FOR ALL
  USING (get_user_role() IN ('super_admin', 'director'))
  WITH CHECK (get_user_role() IN ('super_admin', 'director'));

CREATE POLICY "admin_write" ON grados FOR ALL
  USING (get_user_role() IN ('super_admin', 'director'))
  WITH CHECK (get_user_role() IN ('super_admin', 'director'));

CREATE POLICY "admin_write" ON aulas FOR ALL
  USING (get_user_role() IN ('super_admin', 'director'))
  WITH CHECK (get_user_role() IN ('super_admin', 'director'));

CREATE POLICY "admin_write" ON cursos FOR ALL
  USING (get_user_role() IN ('super_admin', 'director'))
  WITH CHECK (get_user_role() IN ('super_admin', 'director'));

-- secciones: lectura según rol
CREATE POLICY "staff_read_secciones" ON secciones
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_write_secciones" ON secciones
  FOR ALL
  USING (get_user_role() IN ('super_admin', 'director', 'subdirector'))
  WITH CHECK (get_user_role() IN ('super_admin', 'director', 'subdirector'));

-- evaluaciones: docentes pueden crear/editar las de sus cursos
CREATE POLICY "staff_read_evaluaciones" ON evaluaciones
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_write_evaluaciones" ON evaluaciones
  FOR ALL
  USING (get_user_role() IN ('super_admin', 'director', 'subdirector'))
  WITH CHECK (get_user_role() IN ('super_admin', 'director', 'subdirector'));

CREATE POLICY "docente_write_evaluaciones" ON evaluaciones
  FOR INSERT
  WITH CHECK (
    get_user_role() IN ('docente', 'tutor')
    AND EXISTS (
      SELECT 1 FROM docente_curso_seccion dcs
      JOIN docentes d ON d.id = dcs.docente_id
      WHERE dcs.seccion_id = evaluaciones.seccion_id
        AND dcs.curso_id = evaluaciones.curso_id
        AND d.persona_id = get_user_persona_id()
    )
  );

-- docentes: lectura general, escritura admin
CREATE POLICY "authenticated_read_docentes" ON docentes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_write_docentes" ON docentes
  FOR ALL
  USING (get_user_role() IN ('super_admin', 'director', 'subdirector'))
  WITH CHECK (get_user_role() IN ('super_admin', 'director', 'subdirector'));

-- apoderados
CREATE POLICY "staff_read_apoderados" ON apoderados
  FOR SELECT
  USING (get_user_role() IN ('super_admin', 'director', 'subdirector', 'secretaria', 'tutor'));

CREATE POLICY "admin_write_apoderados" ON apoderados
  FOR ALL
  USING (get_user_role() IN ('super_admin', 'director', 'secretaria'))
  WITH CHECK (get_user_role() IN ('super_admin', 'director', 'secretaria'));

CREATE POLICY "apoderado_read_self" ON apoderados
  FOR SELECT
  USING (
    get_user_role() = 'apoderado'
    AND persona_id = get_user_persona_id()
  );

-- usuarios: solo super_admin
CREATE POLICY "admin_all_usuarios" ON usuarios
  FOR ALL
  USING (get_user_role() = 'super_admin')
  WITH CHECK (get_user_role() = 'super_admin');

CREATE POLICY "self_read_usuario" ON usuarios
  FOR SELECT
  USING (id = auth.uid());
```

---

## 6. Funciones SQL y RPCs

### 6.1 Proceso de Matrícula (Transaccional)

```sql
CREATE OR REPLACE FUNCTION public.crear_matricula(
  p_alumno_id UUID,
  p_anio_escolar_id UUID,
  p_seccion_id UUID,
  p_conceptos JSONB -- [{"concepto": "Pensión Marzo", "monto": 350, "fecha_vencimiento": "2026-03-31"}, ...]
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
  -- Verificar capacidad del aula
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

  -- Crear matrícula
  INSERT INTO matriculas (alumno_id, anio_escolar_id, seccion_id)
  VALUES (p_alumno_id, p_anio_escolar_id, p_seccion_id)
  RETURNING id INTO v_matricula_id;

  -- Generar pensiones
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
```

### 6.2 Registrar Pago (con actualización de estado)

```sql
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
  -- Obtener monto de la pensión
  SELECT monto INTO v_pension_monto
  FROM pensiones WHERE id = p_pension_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pensión no encontrada';
  END IF;

  -- Registrar pago
  INSERT INTO pagos (pension_id, monto, metodo_pago)
  VALUES (p_pension_id, p_monto, p_metodo_pago)
  RETURNING id INTO v_pago_id;

  -- Calcular total pagado
  SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado
  FROM pagos WHERE pension_id = p_pension_id;

  -- Actualizar estado de la pensión
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
```

### 6.3 Promedio de Notas por Bimestre

```sql
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
    ROUND(
      SUM(n.nota * e.peso) / NULLIF(SUM(e.peso), 0),
      2
    ) AS promedio
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
```

---

## 7. Views Útiles

```sql
-- Vista: Alumnos con su sección actual
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

-- Vista: Resumen de pensiones por alumno
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

-- Vista: Docentes con sus asignaciones
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
```

---

## 8. Triggers

```sql
-- Trigger: Marcar pensiones vencidas automáticamente
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

-- Se puede ejecutar con pg_cron o con un trigger en otra tabla
-- Alternativa: Supabase Edge Function programada

-- Trigger: Solo un año escolar activo a la vez
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

CREATE TRIGGER trg_solo_un_anio_activo
  BEFORE INSERT OR UPDATE OF activo ON anios_escolares
  FOR EACH ROW
  WHEN (NEW.activo = TRUE)
  EXECUTE FUNCTION fn_solo_un_anio_activo();
```

---

## 9. Supabase Realtime

Usar Realtime **solo** en:

| Canal | Uso |
|-------|-----|
| `asistencias_alumnos` | Dashboard del director: ver asistencia en tiempo real |
| `pagos` | Tesorería: notificación de nuevo pago registrado |

**NO usar Realtime** para listados generales, notas, o configuración.

---

## 10. Route Handlers (Procesos Críticos)

Estos procesos se ejecutan server-side con `service_role` porque requieren:
- Operaciones multi-tabla transaccionales
- Bypasear RLS cuando es necesario
- Validación de negocio compleja

| Endpoint | Método | Descripción |
|----------|--------|------------|
| `/api/auth/callback` | GET | Callback de Supabase Auth |
| `/api/matriculas` | POST | Crear matrícula + generar pensiones (llama a `crear_matricula`) |
| `/api/pagos` | POST | Registrar pago (llama a `registrar_pago`) |
| `/api/reportes` | GET | Generar reportes PDF/Excel (libreta, estado de cuenta) |

---

## 11. Middleware — Protección de Rutas

```typescript
// middleware.ts
// 1. Refresca sesión de Supabase (cookies)
// 2. Redirige a /login si no hay sesión
// 3. Rutas protegidas por rol:
//    - /configuracion/* → solo super_admin, director
//    - /tesoreria/*     → solo super_admin, director, tesoreria
//    - /academico/*     → no apoderado, no tesoreria
//    - /evaluaciones/*  → no secretaria, no tesoreria
```

---

## 12. Schemas de Validación (Zod)

```typescript
// Ejemplo: lib/validations/alumno.schema.ts
import { z } from 'zod';

export const personaBaseSchema = z.object({
  dni: z.string().regex(/^[0-9A-Z]{8,15}$/, 'DNI inválido'),
  nombres: z.string().min(2).max(120),
  apellido_paterno: z.string().min(2).max(80),
  apellido_materno: z.string().min(2).max(80),
  fecha_nacimiento: z.string().date().optional(),
  sexo: z.enum(['M', 'F']).optional(),
  direccion: z.string().optional(),
  telefono: z.string().max(20).optional(),
  email: z.string().email().optional(),
});

export const alumnoSchema = personaBaseSchema.extend({
  codigo_estudiante: z.string().min(1).max(14),
  procedencia_colegio: z.string().max(150).optional(),
});

// Ejemplo: lib/validations/pago.schema.ts
export const pagoSchema = z.object({
  pension_id: z.string().uuid(),
  monto: z.number().positive(),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'yape', 'plin', 'tarjeta']),
});
```

---

## 13. Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...     # SOLO server-side, NUNCA en el cliente
```

---

## 14. Convenciones de Código

| Aspecto | Convención |
|---------|-----------|
| **Nombres de archivo** | kebab-case: `alumno-form.tsx`, `use-user.ts` |
| **Componentes** | PascalCase: `AlumnoForm`, `DataTable` |
| **Variables/funciones** | camelCase |
| **Tipos** | PascalCase con sufijo: `AlumnoRow`, `PagoInsert` |
| **Schemas Zod** | camelCase con sufijo Schema: `alumnoSchema` |
| **SQL** | snake_case para todo |
| **Imports** | Alias `@/` apunta a `src/` |

---

## 15. Orden de Implementación Recomendado

### Fase 1 — Base
1. Inicializar Next.js + TypeScript + Tailwind + shadcn/ui
2. Configurar Supabase (proyecto, tablas, RLS)
3. Auth: login, middleware, protección de rutas
4. Layout del dashboard (sidebar, topbar)
5. Tipos generados de Supabase (`supabase gen types`)

### Fase 2 — CRUD Principal
6. Gestión de personas (base para alumnos, docentes, apoderados)
7. Configuración: años escolares, niveles, grados, aulas
8. Gestión de alumnos
9. Gestión de docentes
10. Gestión de apoderados + vinculación alumno-apoderado

### Fase 3 — Académico
11. Secciones (crear secciones, asignar tutor, asignar aula)
12. Cursos y asignación docente-curso-sección
13. Matrículas (proceso completo con generación de pensiones)

### Fase 4 — Operaciones
14. Asistencia diaria (registro por sección)
15. Evaluaciones y notas (ingreso por docente)
16. Tesorería: pensiones y registro de pagos

### Fase 5 — Reportes y Refinamiento
17. Dashboard con métricas clave
18. Reportes (libreta de notas, estado de cuenta)
19. Realtime donde aplique
20. Optimización y testing
