# Scaling Blueprint: Next.js + Supabase (Sistema Escolar)

## 1) Objetivo

Construir una arquitectura estable para crecer en usuarios, datos y concurrencia sin perder tiempos de respuesta.

Metas de latencia recomendadas:
- Dashboard pages (p95): <= 800 ms
- Busquedas de selectores (p95): <= 300 ms
- Escrituras criticas (p95): <= 700 ms

## 2) Estrategia Async Correcta

Regla principal:
- Async en servidor para data/auth/permisos.
- Cliente solo para interaccion y estado de UI.

Patrones:
1. Server Components para lecturas.
2. Server Actions y `route.ts` para escrituras.
3. Evitar waterfalls: iniciar IO en paralelo con `Promise.all` cuando no hay dependencia.
4. Mantener payloads pequenos: seleccionar solo columnas necesarias.

Antipatrones a evitar:
- Consultas grandes en cliente para luego filtrar.
- Cadenas secuenciales de awaits independientes.
- Enviar objetos grandes del servidor al cliente si solo se usan 2-3 campos.

## 3) Modelo de Datos y Supabase

### 3.1 Indices base

Toda columna usada en `WHERE`, `JOIN`, `ORDER BY` debe tener indice compatible.

Para busquedas por texto con `ILIKE '%texto%'`, usar `pg_trgm`:

```sql
create extension if not exists pg_trgm;

create index if not exists idx_personas_nombres_trgm
  on personas using gin (nombres gin_trgm_ops);

create index if not exists idx_personas_apellido_paterno_trgm
  on personas using gin (apellido_paterno gin_trgm_ops);

create index if not exists idx_personas_apellido_materno_trgm
  on personas using gin (apellido_materno gin_trgm_ops);

create index if not exists idx_personas_dni_trgm
  on personas using gin (dni gin_trgm_ops);
```

### 3.2 Paginacion

1. Offset/limit para tablas pequenas o medianas.
2. Keyset pagination para tablas que creceran mucho (cursor por `created_at`, `id`).

### 3.3 RLS

1. Policias simples y predictivas.
2. Indexar campos usados por politicas (`persona_id`, `alumno_id`, `seccion_id`, etc.).
3. Evitar subconsultas complejas repetidas sin soporte de indice.

## 4) Caching y Revalidacion (Next.js)

### 4.1 Cache de lecturas

Usar `unstable_cache` en lecturas repetidas:
- catalogos (`anios`, `niveles`, `aulas`)
- listados con poco churn

### 4.2 Invalidation por tags

Cada escritura debe invalidar solo lo necesario:
- `revalidateTag("phase2-...")`
- `revalidatePath` solo para rutas impactadas

### 4.3 Cadencias sugeridas

- Catalogos: `revalidate: 60-300`
- Listados administrativos: `revalidate: 30-60`
- Datos altamente dinamicos: cache corta o no cache

## 5) Frontend Escalable

1. Componentes cliente pequenos y enfocados en UX.
2. Prefetch de rutas en hover/focus para percepcion rapida.
3. Modales para flujos de crear/editar donde la tabla principal es el contexto.
4. Formularios con validacion de esquema compartida (Zod).

## 6) Seguridad Operativa

1. `service_role` solo en operaciones admin controladas.
2. Lecturas regulares con cliente de usuario + RLS.
3. No confiar en rol del cliente sin verificacion en servidor.

## 7) Observabilidad y SLO

Minimo requerido:
1. Medir cold/warm/burst por ruta (script de bench existente).
2. Revisar `pg_stat_statements` semanalmente.
3. Ejecutar `EXPLAIN (ANALYZE, BUFFERS)` para consultas p95 altas.

Matriz de decision:
- p95 alto + pocas filas -> revisar red, auth, cache misses.
- p95 alto + muchas filas -> revisar indices, paginacion, select columnas.
- p95 alto en burst -> revisar concurrencia y hotspots de lock.

## 8) Plan de Implementacion por Fases

### Fase 1 (esta semana)

1. Optimizar busquedas de personas para no leer tablas completas.
2. Cachear catalogos de configuracion con tags.
3. Unificar UX de usuarios en modal.
4. Agregar indices trigram para `personas`.

### Fase 2 (proxima)

1. Mover busquedas pesadas a RPCs dedicadas con limite server-side.
2. Implementar keyset en listados mas grandes.
3. Afinar RLS con soporte de indices faltantes.

### Fase 3

1. Reportes agregados por vistas materializadas o cache de agregados.
2. SLO formal por modulo y alertas.

## 9) Checklist de Pull Requests

Antes de merge:
1. No hay waterfalls evitables.
2. Consultas paginadas y con columnas minimas.
3. Hay indice para filtros/joins nuevos.
4. Se definen tags y revalidacion de cache.
5. Se valida p95 en al menos cold + warm.

## 10) Estado aplicado en este repo (turno actual)

1. Busquedas de personas optimizadas para consultar solo IDs candidatos.
2. Catalogos de configuracion migrados a `unstable_cache` real con tags.
3. Pantalla `Usuarios` convertida a flujo modal de alta.
