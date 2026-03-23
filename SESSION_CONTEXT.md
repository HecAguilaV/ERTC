# ERTC - Session Context Sync
*Este archivo ha sido generado automáticamente para portabilidad de memoria.*

Si estás abriendo el proyecto en un nuevo dispositivo, lee este documento para recuperar todo el contexto arquitectónico y evitar volver a empezar de cero.

## Estado Actual de la Arquitectura (Marzo 2026)
Hemos transicionado de una arquitectura plana (todo a `main`) a una arquitectura segura de **3 Capas**:

- **Capa 1 (Estable):** Rama `main`. Solo para producción hiperestable. (Commit actual: `21b941b`).
- **Capa 2 (Marketplace):** Rama `Marketplace_Editable`. Esta rama es **100% autónoma** ahora. Los perfiles pueden ser editados aquí, y la API `submit-profile.js` ha sido ajustada para generar los commits y Pull Requests directamente hacia esta misma rama, sin tocar `main`.
- **Capa 3 (Inteligencia & Admin):** Rama `Sistema_Operativo_ERTC`. Contiene el "Sistema Operativo" completo, el cual posee un **Dashboard de Curaduría Pro** protegido por un `ADMIN_SECRET` y que permite la inyección directa de perfiles (Auto-merge via Matriz).

## Últimos Problemas Resueltos en la Sesión
1. **Error 500 en Vercel (Marketplace_Editable):** Se causaba por dos cosas:
   - La API seguía buscando la rama `main` en lugar de crear ramas a partir de `Marketplace_Editable`. Esto fue reescrito en la Capa 2.
   - Faltaban las variables de entorno (`GITHUB_TOKEN` y `ADMIN_SECRET`) en el panel de Vercel. Fueron ingresadas y el sistema opera con normalidad.
2. **Desincronización de Nombres en UI:** Cuando un usuario modificaba su nombre (ej. "Roberto Salas" -> "Roberto Salas Letelier") el cambio se veía en su perfil pero la "Matriz de Problemas" seguía mostrando el nombre antiguo estático del archivo `need`.
   - **Solución implementada:** Se modificó `matriz-problemas.html` y el `Marketplace` original para realizar una **resolución dinámica**. Ahora el UI busca al usuario por un "slug ID" y siempre extrae el `name` y el `icon` del perfil actualizado (`src/data/profiles/*.json`), acabando con la duplicidad de datos.
3. **Validación de Schemas:** Se actualizó a Node 20 en GitHub Actions `.github/workflows/validate-schemas.yml`.

## Siguiente Tarea Pendiente
- Probar intensivamente la interfaz del Dashboard desde el lado de administración (curaduría de PRs en Capa 3).
- Validar el despliegue del Sistema Operativo si se decide hacer de `Sistema_Operativo_ERTC` la rama por defecto en Vercel en el futuro (actualmente Vercel corre en `Marketplace_Editable`).

---
> **Prompt rápido para nuevo agente en el otro dispositivo:**
> *"Hola, acabo de clonar este repo. Lee el archivo `SESSION_CONTEXT.md` en la raíz para adquirir todo el contexto reciente, y luego dime qué debemos hacer."*
