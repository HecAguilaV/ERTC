const nav = document.getElementById("nav");
const viewer = document.getElementById("viewer");
const viewName = document.getElementById("viewName");

const reloadBtn = document.getElementById("reload");
const menuToggle = document.getElementById("menuToggle");
const closeSidebar = document.getElementById("closeSidebar");
const sidebar = document.getElementById("sidebar");
const goBackBtn = document.getElementById("goBack");

const homeSection = document.getElementById("home-ertc");
const mainHeader = document.querySelector(".main-header");

let matrices = [];

// Cargar datos del manifiesto
// Cargar datos del manifiesto
fetch('manifest.json')
    .then(response => response.json())
    .then(data => {
        matrices = data.matrices.sort((a, b) => a.order - b.order);
        renderMenu();
        // Restaurar estado si existe hash
        const fullHash = window.location.hash.substring(1);
        if (fullHash) {
            const [key, ...queryParts] = fullHash.split('?');
            showView(key, queryParts.join('?'));
        }
    })
    .catch(error => console.error('Error cargando el manifiesto:', error));

window.addEventListener('hashchange', () => {
    const fullHash = window.location.hash.substring(1);
    const [key, ...queryParts] = fullHash.split('?');
    if (key) {
        showView(key, queryParts.join('?'));
    } else {
        showHome();
    }
});

function renderMenu() {
    nav.innerHTML = '';
    matrices.forEach((m, i) => {
        const el = document.createElement("div");
        el.className = "nav-item";
        el.dataset.key = m.id;
        el.innerHTML = `
    <div class="nav-icon">${m.icon}</div>
    <div>
      <h3>${m.title}</h3>
      <p>${m.subtitle}</p>
    </div>`;
        // Navegación vía Hash activa el evento hashchange
        el.onclick = () => {
            window.location.hash = m.id;
            // En móvil, cerrar sidebar al seleccionar
            if (window.innerWidth <= 900) {
                sidebar.classList.remove("active");
            }
        };
        nav.appendChild(el);
    });
}

function explore() {
    if (window.innerWidth <= 900) {
        sidebar.classList.add("active");
    }
}

function showView(key, queryString) {
    // Hide Home, Show Viewer
    homeSection.style.display = "none";
    mainHeader.style.display = "flex";
    viewer.style.display = "block";

    // Mostrar botón Volver
    goBackBtn.style.display = "inline-flex";

    document.querySelectorAll(".nav-item")
        .forEach(i => i.classList.toggle("active", i.dataset.key === key));

    const matrix = matrices.find(m => m.id === key);

    if (!matrix) return; // Hash inválido

    let targetUrl = matrix.url;
    if (queryString) {
        targetUrl += '?' + queryString;
    }

    // Force update if different to process query string inside Iframe properly
    const absoluteTargetUrl = new URL(targetUrl, window.location.href).href;
    if (viewer.src !== absoluteTargetUrl) {
        viewer.src = targetUrl;
    }

    viewName.textContent = matrix.title;
    // Sidebar se cierra en el onclick del menú o aquí por seguridad
    sidebar.classList.remove("active");
}

function showHome() {
    // Volver al Home
    viewer.style.display = "none";
    mainHeader.style.display = "none";
    homeSection.style.display = "flex";

    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));

    // Descargar iframe
    viewer.src = "";
    goBackBtn.style.display = "none";

    // Limpiar hash sin recargar si llegamos aquí programáticamente
    if (window.location.hash) {
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }
}

function closeViewer() {
    // Wrapper para el botón Volver
    showHome();
}

reloadBtn.onclick = () => {
    // Forzamos recarga del iframe
    if (viewer.contentWindow && viewer.contentWindow.location) {
        try {
            viewer.contentWindow.location.reload();
        } catch (e) {
            viewer.src = viewer.src;
        }
    } else {
        viewer.src = viewer.src;
    }
};

menuToggle.onclick = () => {
    if (window.innerWidth <= 900) {
        sidebar.classList.add("active");
    } else {
        document.querySelector(".app").classList.toggle("sidebar-collapsed");
    }
};

closeSidebar.onclick = () => sidebar.classList.remove("active");
