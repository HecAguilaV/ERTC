# ERTC — Estructura Relacional del Trabajo Colectivo

> [!NOTE]
> **Aclaración sobre Autoría y Desarrollo:**
> Este repositorio es un ecosistema vivo que integra contenidos, matrices y lógica conceptual diseñados originalmente por [**Roberto Salas**](https://github.com/RSLNOCTILUCA/BOMBEROS_IA). La implementación técnica, arquitectura y el desarrollo del módulo "Marketplace Editable" son ejecutados por [**Héctor Águila**](https://github.com/HecAguilaV), manteniendo la integridad y visión antropológica original del sistema.

Este repositorio integra un conjunto de matrices, mapas y modelos en el contexto del trabajo de la Comisión de Digitalización de Bomberos de Chile en la Cámara Chilena de la IA ([**CCHIA**](https://www.cchia.cl)).

---

## 🚀 Marketplace Editable (Capa 2)

Este módulo transforma las matrices estáticas en una herramienta de coordinación dinámica. Permite a los integrantes del equipo conectar su expertise con las necesidades reales del proyecto de forma fluida.

### ✨ Características Principales (UX Polish)
- **Deep Linking Bidireccional:** Navegación fluida entre la **Matriz de Problemas** y el **Marketplace**. Al hacer clic en un usuario en la matriz, el sistema abre automáticamente su perfil expandido en el marketplace.
- **Quick-Attach Modal:** Permite a usuarios existentes sumarse a un problema en segundos mediante un modal emergente, sin necesidad de llenar formularios extensos.
- **Badges de Actividad:** Visualización dinámica de medallas **ACTIVO** para destacar a los miembros que ya están operando sobre problemas críticos.
- **Animaciones Orgánicas:** Implementación de transiciones suaves (fade-up/blur) para una experiencia premium y profesional ("Feeling" iOS/Premium).

### 🛠️ Arquitectura Técnica
- **Frontend:** Vanilla HTML5, CSS3 (Custom Variables) y JavaScript ES6.
- **Backend (Bridge):** Vercel Serverless Functions (`api/`) para interactuar con la API de GitHub de forma segura.
- **Persistencia:** Archivos JSON desacoplados en `src/data/` que actúan como base de datos distribuida.
- **Workflow de Aprobación:** 
  - Ediciones de Perfil: Generan un **Pull Request** para revisión del Curador.
  - Conexión Rápida (Matriz): Genera un **Commit directo** a `main` para agilidad absoluta.

### 🌐 Despliegue: ¿Por qué Vercel y no GitHub Pages?
Debido a que el proyecto utiliza **Funciones Serverless** para procesar las ediciones y proteger el `GITHUB_TOKEN`, es **obligatorio** utilizar **Vercel** para el despliegue de testing y producción. GitHub Pages solo admite contenido estático y no puede ejecutar el código de la carpeta `api/`.

### 🔐 Configuración
1. Clonar el repositorio.
2. Crear un archivo `.env` local con:
   - `GITHUB_TOKEN`: Token con permisos de repo.
   - `ADMIN_SECRET`: Contraseña para el dashboard de curaduría.
   - `WHATSAPP_ADMIN_NUMBER`: Número del curador para notificaciones.
3. Desplegar en Vercel y configurar estas mismas variables en el panel de control.

---

**Licencia:** Todos los materiales se distribuyen bajo licencia **CC BY 4.0**.

---

**Roberto Salas**  
*Mente Pensante & Curador*

**Héctor Aguila**  
*Arquitecto Técnico & Desarrollador*  
> Un soñador con poca RAM 👨🏻‍💻
