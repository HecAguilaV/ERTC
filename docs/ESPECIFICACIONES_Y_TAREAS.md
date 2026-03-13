# ESPECIFICACIÓN TÉCNICA DEL DESARROLLO (SDD-Spec & SDD-Tasks)

**Módulo:** Marketplace Editable (Capa 2)
**Objetivo:** Definir contratos de datos, comportamiento de la API Serverless, diseño de interfaces adicionales necesarias, y el plan de tareas de desarrollo granular.

---

## 1. Mapeo de Arquitectura de Datos (JSON Schemas)

Actualmente, los datos están acoplados en el `<script>` del archivo HTML (`needs` y `memberOffers`). El primer paso del sistema es separarlos.

### 1.1 Esquema Fuerte: `perfil_usuario.json`
Este será el documento base por cada usuario en `src/data/profiles/`.
```json
{
  "id": "hans-edelsberg",
  "name": "Hans Edelsberg",
  "role": "Coord. Técnica · Data engineering",
  "icon": "📊",
  "status_action": true,
  "capabilities": [
    {
      "text": "Expertise en data engineering y arquitectura de datos",
      "needsIds": [3]
    }
  ],
  "unique": "Plantea la pregunta más incómoda...",
  "needsCount": 3
}
```
> **Regla de Validación:** La API rechazará cualquier `capabilities` que tenga más de 6 arreglos, y cualquier `text` o `unique` superior a 250 caracteres.

---

## 2. Contratos de la API (Serverless Backend)

La API Serverless funcionará como *Backend-For-Frontend* (BFF), consumiendo el Content API REST de GitHub.

### 2.1 Endpoint: `POST /api/submit-profile`
Invocado por el Usuario desde el frontend (Marketplace Editable) web para **modificar** su perfil o por el Administrador en la (TinyWeb) para **agregar** uno nuevo.

* **Caso 1: Modo Usuario (Edición y PR-First)**
  * **Payload Recibido:** Objeto alineado a `perfil_usuario.json`. Opcional: `author_id`.
  * **Acción Backend:**
    1. Crea rama dinámica: `update/profile/{id}-{timestamp}`.
    2. Modifica el estado del archivo `src/data/profiles/{id}.json` en el repositorio vía API de GitHub.
    3. Crea el Pull Request apuntando a la rama `main` de Roberto.
  * **Retorno (200 OK):** `{"pr_url": "https://...", "tinyweb_review_url": "/admin/review?pr=123"}`.

* **Caso 2: Modo Admin/Curador (Creación Directa)**
  * **Payload Recibido:** Objeto completo del perfil + `admin_token` por Headers.
  * **Acción Backend:** El middleware usa la API de GitHub para empujar directamente a `main` sin hacer PR.
  * **Retorno (200 OK):** `{"message": "Perfil inyectado exitosamente"}`.

### 2.2 Endpoint: `POST /api/resolve-pr`
Invocado exclusivamente por el Admin (Roberto) desde la TinyWeb al revisar.
* **Payload Recibido:** `{ pr_number: 123, action: "approve" | "reject", reason: "..." (opcional) }` + `admin_token`.
* **Retornos Posibles:** Merge a `main` automático, o en caso contrario, Close PR + comment con `reason`.

---

## 3. Interfaces de Usuario Adicionales (Frontend)

Para complementar la Capa 2, además del Marketplace existente, deben crearse:

1. **`editar-perfil.html` (Móvil-First):**
   * Contendrá el formulario atado al esquema estricto (Textareas controlados, límite de palabras).
   * Al hacer Submit llama a `/api/submit-profile`.
   * En su pantalla de éxito, muestra Botón *"Notificar a Roberto por WhatsApp"*.

2. **`agregar-perfil.html` (TinyWeb / Modo Roberto):**
   * Formulario oculto exclusivo bajo validación ligera.
   * Identifica y graba perfiles nuevos directo a la rama.

3. **`matriz-problemas.html`:**
   * La vista de 7 fichas como identificamos en los documentos complementarios. Debe verse con la misma estética Navy Blue/Gold que las matrices base.

---

## 4. Plan de Ejecución (Checklist Extremo: SDD-Tasks)

Para pasar a Modo Ejecución de Orquestador, completaremos linealmente:

1. [ ] **Restructuración Base (Sin romper):** 
   - Crear estructura `src/pages`, `src/assets`, `src/data/profiles`.
   - Extraer arreglos de JS actuales de Roberto y convertirlos en archivos `.json` individuales en la carpeta `data`.
   - Modificar `Marketplace_Expertise.html` para que al cargar lea asíncronamente (con `fetch`) los `.json` de la carpeta `data` en lugar de cargarlos estáticos en el script. *(Verificar localmente visualización intacta)*.

2. [ ] **Desarrollo del Frontend (UIs Nuevas):**
   - Construir `src/pages/editar-perfil.html`.
   - Construir `src/pages/matriz-problemas.html`.
   - Construir `src/pages/admin-dashboard.html` (Aquí vivirá *Agregar Perfil* y la validación de la *TinyWeb*).

3. [ ] **Backend Serverless (API):**
   - Crear el subdirectorio `api/`.
   - Instalar dependencias para interactuar con Github (por ejemplo `octokit`).
   - Construir handler de `submit-profile.ts/js`.
   - Construir handler de `resolve-pr.ts/js`.

4. [ ] **CI/CD Básico:**
   - Escribir `action.yml` que valide los `.json` usando `ajv`.
