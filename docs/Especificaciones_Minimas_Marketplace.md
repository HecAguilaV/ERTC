# ERTC — Marketplace Editable (Capa 2) — Flujo PR‑first con Curaduría en TinyWeb (v2)

> Objetivo: permitir que **cada integrante edite su perfil sin fricción** (móvil primero) y que el **curador (Roberto)** apruebe/rechace **sin “codear” ni navegar GitHub manualmente**, manteniendo trazabilidad y autoría mediante PRs.

---

## 1) Principios del flujo (lo que NO se negocia)

1. **PR-first (trazabilidad nativa):** cada cambio de perfil se materializa como un **Pull Request** (PR) contra la rama de trabajo definida por Roberto.
2. **Curaduría fuera de GitHub UI:** el curador revisa y decide desde una **TinyWeb** (aprobación/rechazo).
3. **Sin WhatsApp Business / sin automatismos de envío:** WhatsApp se usa como **canal humano**, no como API.  
   - La TinyWeb entrega **Copy button** para copiar un mensaje prellenado (aprobado/rechazado) y pegarlo en WhatsApp.
4. **Fricción mínima para usuarios “del Olimpo”:** el usuario solo **edita → envía**. No requiere cuenta GitHub.
5. **Control de longitud:** el formulario limita contenido (anti “CV de 50 páginas”).

---

## 2) Roles

- **Usuario (miembro del equipo):**
  - Edita/actualiza su perfil (y eventualmente tags/skills).
  - Envía cambios para revisión.
- **Curador/Admin (Roberto):**
  - Revisa diff en TinyWeb.
  - Decide aprobar o rechazar.
  - Comunica resultado vía WhatsApp (pegando texto prellenado).
- **Sistema (Backend/servicio):**
  - Valida esquema.
  - Genera branch + commit + PR.
  - Expone la TinyWeb de revisión.
  - Ejecuta merge/cierre por API de GitHub (autorizado por GitHub App o token).

---

## 3) Flujo end-to-end (versión operativa)

### 3.1 Usuario: “Editar y Enviar”
1. Usuario entra a **URL pública ERTC** (móvil).
2. Selecciona su nombre/perfil → **Editar**.
3. Modifica campos permitidos (bio, expertise, tags, enlaces, etc.).
4. Presiona **Enviar**.

**Resultado del “Enviar”:**
- El backend valida el payload.
- Crea una rama: `profiles/<userId>/<yyyymmdd-hhmm>`
- Crea commit con el cambio.
- Crea PR hacia la rama destino (`marketplace-editable` o la que defina Roberto).
- Devuelve:
  - “Tu actualización quedó enviada a revisión”
  - Link de revisión para curador: `.../review/<prNumber>`
  - Botón **“Notificar al curador”** (abre WhatsApp con mensaje prellenado) *(opcional recomendado)*

> Nota: Si se omite “abrir WhatsApp”, igual se puede notificar por otro canal (mención en PR / issue).

### 3.2 Curador: “Revisar en TinyWeb”
1. Curador abre el link `.../review/<prNumber>` desde WhatsApp (se abre como webview).
2. TinyWeb muestra:
   - Identidad del usuario + timestamp
   - **Diff** (cambios propuestos)
   - Validaciones (si excede límites, flag)
3. Curador elige:
   - ✅ **Aprobar**
   - ❌ **Rechazar** (con motivo corto obligatorio)

### 3.3 Acciones automáticas tras la decisión
- Si ✅ **Aprobar**:
  - Backend ejecuta **merge del PR** por GitHub API.
  - Deja comentario en PR: “Aprobado por Curador” (opcional).
  - TinyWeb muestra estado final: **APROBADO + MERGEADO**.
  - TinyWeb presenta **Copy button**: mensaje prellenado “Aprobado” para pegar en WhatsApp al usuario.

- Si ❌ **Rechazar**:
  - Backend comenta el PR con el motivo.
  - Backend **cierra** el PR (no merge).
  - TinyWeb muestra estado final: **RECHAZADO + CERRADO**.
  - TinyWeb presenta **Copy button**: mensaje prellenado “Rechazado + motivo” para pegar en WhatsApp.

---

## 4) WhatsApp: “Dentro del flujo, pero humano”

### 4.1 Mensajes prellenados (sin API)
- **Copy button** copia al portapapeles un texto estándar.
- El curador vuelve a WhatsApp, pega y envía (1 acción humana).

Ejemplos:

**Aprobación**
- “✅ Perfil actualizado y aprobado. Cambios aplicados en ERTC. Gracias.”
- (Opcional) “PR: #123”

**Rechazo**
- “❌ Cambio rechazado. Motivo: <motivo corto>. Ajusta y reenvía.”
- (Opcional) “PR: #123”

### 4.2 Variante recomendada (opcional)
- En el “Enviar” del usuario, mostrar botón **“Notificar al curador”** que abre WhatsApp con texto prellenado:
  - “Hola, envié actualización de perfil. Link revisión: <url>”

---

## 5) GitHub: estructura y trazabilidad (sin pedirles GitHub a los usuarios)

### 5.1 Branching
- **Una actualización = una rama** (sí, una rama nueva por cambio).
- Esto permite:
  - diff claro
  - PR claro
  - historial auditable
  - rollback simple

### 5.2 PR como unidad de control
- El PR es “la solicitud formal”.
- El merge es “la aprobación formal”.
- El cierre con comentario es “el rechazo formal”.

### 5.3 Autoría
- El commit/PR debe registrar al autor lógico:
  - `userId`, `displayName`, `timestamp`
- A nivel Git, el autor técnico puede ser una “cuenta bot” (del sistema), pero el **metadata** deja claro el autor humano.

---

## 6) Requerimientos mínimos (MVP real)

### Funcionales
1. Formulario de edición por usuario (móvil primero).
2. Validación de límites (chars, campos, links).
3. Backend que:
   - crea branch
   - commitea cambios
   - crea PR
4. TinyWeb de revisión (diff + approve/reject).
5. Acciones API:
   - merge PR
   - cerrar PR
6. Copy button para WhatsApp (aprobado/rechazado).

### No funcionales
- Tiempo de carga bajo en móvil.
- UI sobria consistente con el ERTC existente.
- Seguridad “suficiente MVP”:
  - no exponer datos sensibles
  - evitar edición de perfiles ajenos (token link o verificación mínima)
- Registro auditable (GitHub como ledger).

---

## 7) Lo que NO entra en esta versión (explícito para evitar derivas)

- WhatsApp Business API / bots.
- Ranking, puntos, gamificación.
- Login GitHub para usuarios.
- Base de datos obligatoria (se puede operar sin DB si GitHub es el ledger).
- IA/grafos automáticos (eso es Capa 3+).

---

## 8) Notas de implementación (libertad técnica de Héctor)

- Puedes montar el backend donde prefieras (Vercel/Netlify/Cloudflare/etc.).
- Persistencia mínima: GitHub PRs + comentarios sirven como bitácora.
- La TinyWeb puede ser parte del mismo deploy que el frontend o separado.
- “Diff” puede venir del endpoint `.diff` del PR o comparando payload vs estado actual.

---

## 9) Checklist para alinear con Roberto (antes de codear de más)

1. Rama destino oficial (¿`marketplace-editable` o similar?).
2. ¿Roberto quiere notificación por grupo o privado? (WhatsApp humano).
3. Campos y límites definitivos del formulario.
4. Política de rechazo (motivo obligatorio, longitud).
5. Mensajes estándar (aprobado/rechazado) para Copy button.

---

**Estado:** Documento consolidado para implementación de Capa 2 (Marketplace Editable) con curaduría eficiente y trazabilidad PR-first.
