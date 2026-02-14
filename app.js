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
fetch('manifest.json')
    .then(response => response.json())
    .then(data => {
        matrices = data.matrices.sort((a, b) => a.order - b.order);
        renderMenu();
    })
    .catch(error => console.error('Error cargando el manifiesto:', error));

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
        el.onclick = () => activate(m.id);
        nav.appendChild(el);
    });
}

function explore() {
    if (window.innerWidth <= 900) {
        sidebar.classList.add("active");
    }
}

function activate(key) {
    // Hide Home, Show Viewer
    homeSection.style.display = "none";
    mainHeader.style.display = "flex";
    viewer.style.display = "block";

    // Mostrar botón Volver
    goBackBtn.style.display = "inline-flex";

    document.querySelectorAll(".nav-item")
        .forEach(i => i.classList.toggle("active", i.dataset.key === key));

    const matrix = matrices.find(m => m.id === key);

    // Solo recargar si la URL es diferente
    if (viewer.src !== matrix.url) {
        viewer.src = matrix.url;
    }

    viewName.textContent = matrix.title;
    sidebar.classList.remove("active");
}

function closeViewer() {
    // Volver al Home
    viewer.style.display = "none";
    mainHeader.style.display = "none"; // Ocultar header (y botón volver)
    homeSection.style.display = "flex";

    // Limpiar selección del menú
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));

    // Descargar iframe para ahorrar recursos
    viewer.src = "";
    goBackBtn.style.display = "none";
}

reloadBtn.onclick = () => {
    // Forzamos recarga del iframe
    viewer.src = viewer.src;
};

menuToggle.onclick = () => {
    if (window.innerWidth <= 900) {
        // Mobile behavior: Toggle drawer
        sidebar.classList.add("active");
    } else {
        // Desktop behavior: Toggle collapse
        document.querySelector(".app").classList.toggle("sidebar-collapsed");
    }
};

closeSidebar.onclick = () => sidebar.classList.remove("active");
