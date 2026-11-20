/* ==========================================================
   CONECTA · Simulador de planes de telecomunicaciones
   Interfaz dinámica con DOM y eventos
   ========================================================== */

"use strict";

/* ---------- 1. Datos (array de objetos) ---------- */

const servicios = [
  { id: 1, 
    nombre: "Fibra Hogar 300", 
    categoria: "Internet", 
    detalle: "300 Mbps simétricos con router WiFi 6.", 
    precio: 89900, 
    contratado: false 
},
  { id: 2, 
    nombre: "Fibra Gamer 900", 
    categoria: "Internet", 
    detalle: "900 Mbps, baja latencia y IP prioritaria.", 
    precio: 139900, 
    contratado: false
 },
  { id: 3, 
    nombre: "Móvil 20 GB", 
    categoria: "Móvil", 
    detalle: "20 GB de datos, minutos y SMS ilimitados.", 
    precio: 39900, 
    contratado: false 
},
  { id: 4, 
    nombre: "Móvil Ilimitado", 
    categoria: "Móvil", 
    detalle: "Datos ilimitados y 5G donde haya cobertura.", 
    precio: 69900, 
    contratado: false
 },
  { id: 5, 
    nombre: "TV Básica", 
    categoria: "TV", 
    detalle: "80 canales en HD y guía de programación.", 
    precio: 34900, 
    contratado: false 
},
  { id: 6, 
    nombre: "TV Premium", 
    categoria: "TV", 
    detalle: "160 canales, deportes y 2 plataformas de streaming.", 
    precio: 59900, 
    contratado: false 
},
  { id: 7, 
    nombre: "Combo Hogar", 
    categoria: "Combo", 
    detalle: "Internet 300 Mbps + TV Básica.", 
    precio: 109900, 
    contratado: false 
},
  { id: 8, 
    nombre: "Combo Total", 
    categoria: "Combo", 
    detalle: "Internet 900 Mbps + Móvil Ilimitado + TV Premium.", 
    precio: 229900, 
    contratado: false 
},
];

const MIN_SERVICIOS_DESCUENTO = 3;
const PORCENTAJE_DESCUENTO = 0.1;
const DURACION_TOAST_MS = 5000;

const CLASE_CATEGORIA = {
  Internet: "internet",
  "Móvil": "movil",
  TV: "tv",
  Combo: "combo",
};

/* ---------- 2. Estado ---------- */

let siguienteId = Math.max(...servicios.map((s) => s.id)) + 1;
let categoriaActiva = "Todos";
let textoBusqueda = "";
let ultimoEliminado = null;

/* ---------- 3. Selección de elementos del DOM ---------- */

const contenedor = document.getElementById("contenedor-servicios");
const buscador = document.getElementById("buscador");
const filtros = document.getElementById("filtros");
const contador = document.getElementById("contador");

const formulario = document.getElementById("form-servicio");
const inputNombre = document.getElementById("input-nombre");
const inputCategoria = document.getElementById("input-categoria");
const inputPrecio = document.getElementById("input-precio");
const inputDetalle = document.getElementById("input-detalle");
const errorFormulario = document.getElementById("form-error");

const listaPlan = document.getElementById("lista-plan");
const planVacio = document.getElementById("plan-vacio");
const planSubtotal = document.getElementById("plan-subtotal");
const planFilaDescuento = document.getElementById("plan-fila-descuento");
const planDescuento = document.getElementById("plan-descuento");
const planTotal = document.getElementById("plan-total");
const planAyuda = document.getElementById("plan-ayuda");
const botonVaciar = document.getElementById("btn-vaciar");

const statTotal = document.getElementById("stat-total");
const statContratados = document.getElementById("stat-contratados");
const statMensual = document.getElementById("stat-mensual");
const statPromedio = document.getElementById("stat-promedio");

const contenedorToasts = document.getElementById("toasts");

/* ---------- 4. Utilidades ---------- */

const formatearPesos = (valor) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);

// Evita que el texto escrito por el usuario se interprete como HTML.
const escaparHTML = (texto) =>
  String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Minúsculas y sin tildes, para que "movil" encuentre "Móvil".
const normalizar = (texto) =>
  String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* ---------- 5. Cálculos ---------- */

function calcularPlan() {
  const contratados = servicios.filter((s) => s.contratado);
  const subtotal = contratados.reduce((acumulado, s) => acumulado + s.precio, 0);
  const aplicaDescuento = contratados.length >= MIN_SERVICIOS_DESCUENTO;
  const descuento = aplicaDescuento ? Math.round(subtotal * PORCENTAJE_DESCUENTO) : 0;
  return { contratados, subtotal, descuento, total: subtotal - descuento, aplicaDescuento };
}

function obtenerServiciosFiltrados() {
  const busqueda = normalizar(textoBusqueda.trim());
  return servicios.filter((s) => {
    const coincideCategoria = categoriaActiva === "Todos" || s.categoria === categoriaActiva;
    const coincideTexto = normalizar(`${s.nombre} ${s.detalle} ${s.categoria}`).includes(busqueda);
    return coincideCategoria && coincideTexto;
  });
}

/* ---------- 6. Renderizado dinámico ---------- */

function crearTarjeta(servicio, idResaltado) {
  const clases = ["tarjeta"];
  if (servicio.contratado) clases.push("tarjeta--en-plan");
  if (servicio.id === idResaltado) clases.push("tarjeta--nueva");

  return `
    <article class="${clases.join(" ")}" data-id="${servicio.id}">
      <span class="etiqueta etiqueta--${CLASE_CATEGORIA[servicio.categoria] || "internet"}">${escaparHTML(servicio.categoria)}</span>
      <h3 class="tarjeta__nombre">${escaparHTML(servicio.nombre)}</h3>
      <p class="tarjeta__detalle">${escaparHTML(servicio.detalle)}</p>
      <p class="tarjeta__precio">${formatearPesos(servicio.precio)}<span class="tarjeta__periodo">/mes</span></p>
      <div class="tarjeta__acciones">
        <button type="button" class="boton ${servicio.contratado ? "boton--oscuro" : ""}" data-accion="alternar">
          ${servicio.contratado ? "Quitar de mi plan" : "Agregar a mi plan"}
        </button>
        <button type="button" class="boton boton--peligro" data-accion="eliminar" aria-label="Eliminar ${escaparHTML(servicio.nombre)}">
          Eliminar
        </button>
      </div>
    </article>`;
}

function renderizarServicios(idResaltado = null) {
  const filtrados = obtenerServiciosFiltrados();
  const hayResultados = filtrados.length > 0;

  contador.textContent = `${filtrados.length} de ${servicios.length} servicios`;

  contenedor.innerHTML = hayResultados
    ? filtrados.map((servicio) => crearTarjeta(servicio, idResaltado)).join("")
    : `<div class="vacio">
         <p>No encontramos servicios con esos filtros.</p>
         <button type="button" class="boton boton--borde" data-accion="limpiar-filtros">Limpiar filtros</button>
       </div>`;
}

function renderizarPlan() {
  const plan = calcularPlan();
  const hayServicios = plan.contratados.length > 0;

  listaPlan.innerHTML = plan.contratados
    .map(
      (s) => `
      <li class="plan__item">
        <span class="plan__nombre">${escaparHTML(s.nombre)}</span>
        <span class="plan__precio">${formatearPesos(s.precio)}</span>
        <button type="button" class="plan__quitar" data-accion="quitar" data-id="${s.id}" aria-label="Quitar ${escaparHTML(s.nombre)} de mi plan">✕</button>
      </li>`
    )
    .join("");

  planVacio.hidden = hayServicios;
  planFilaDescuento.hidden = !plan.aplicaDescuento;
  planSubtotal.textContent = formatearPesos(plan.subtotal);
  planDescuento.textContent = `- ${formatearPesos(plan.descuento)}`;
  planTotal.textContent = formatearPesos(plan.total);
  botonVaciar.disabled = !hayServicios;

  const faltan = MIN_SERVICIOS_DESCUENTO - plan.contratados.length;
  if (plan.aplicaDescuento) {
    planAyuda.textContent = "Tienes 10% de descuento por contratar 3 servicios o más.";
  } else if (hayServicios) {
    planAyuda.textContent = `Agrega ${faltan} servicio${faltan === 1 ? "" : "s"} más y obtén 10% de descuento.`;
  } else {
    planAyuda.textContent = `Contrata ${MIN_SERVICIOS_DESCUENTO} servicios o más y obtén 10% de descuento.`;
  }
}

function renderizarEstadisticas() {
  const plan = calcularPlan();
  const promedio = servicios.length
    ? Math.round(servicios.reduce((acumulado, s) => acumulado + s.precio, 0) / servicios.length)
    : 0;

  statTotal.textContent = String(servicios.length);
  statContratados.textContent = String(plan.contratados.length);
  statMensual.textContent = formatearPesos(plan.total);
  statPromedio.textContent = formatearPesos(promedio);
}

// Cada vez que el array cambia, se vuelve a dibujar toda la interfaz.
function actualizarVista(idResaltado = null) {
  renderizarServicios(idResaltado);
  renderizarPlan();
  renderizarEstadisticas();
}

function marcarFiltroActivo() {
  filtros.querySelectorAll(".filtro").forEach((boton) => {
    boton.setAttribute("aria-pressed", String(boton.dataset.categoria === categoriaActiva));
  });
}

/* ---------- 7. Feedback visual (avisos en pantalla) ---------- */

function mostrarToast(texto, tipo = "exito", accion = null) {
  const toast = document.createElement("div");
  toast.className = `toast toast--${tipo}`;

  const mensaje = document.createElement("span");
  mensaje.textContent = texto;
  toast.appendChild(mensaje);

  if (accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "toast__accion";
    boton.dataset.accion = accion.clave;
    boton.textContent = accion.texto;
    toast.appendChild(boton);
  }

  contenedorToasts.appendChild(toast);
  setTimeout(() => toast.remove(), DURACION_TOAST_MS);
}

function mostrarErrorFormulario(mensaje) {
  errorFormulario.textContent = mensaje;
  errorFormulario.hidden = false;
}

function ocultarErrorFormulario() {
  errorFormulario.textContent = "";
  errorFormulario.hidden = true;
}

/* ---------- 8. Acciones sobre el array ---------- */

function validarNuevoServicio(nombre, precio) {
  if (nombre.length < 3) return "El nombre debe tener al menos 3 caracteres.";
  if (servicios.some((s) => normalizar(s.nombre) === normalizar(nombre))) {
    return "Ya existe un servicio con ese nombre.";
  }
  if (!Number.isFinite(precio) || precio < 1000 || precio > 1000000) {
    return "Escribe un precio entre $1.000 y $1.000.000.";
  }
  return "";
}

function agregarServicio(evento) {
  evento.preventDefault();

  const nombre = inputNombre.value.trim();
  const precio = Number(inputPrecio.value);
  const error = validarNuevoServicio(nombre, precio);

  if (error) {
    mostrarErrorFormulario(error);
    mostrarToast("Revisa los datos del formulario.", "error");
    return;
  }

  const nuevo = {
    id: siguienteId++,
    nombre,
    categoria: inputCategoria.value,
    detalle: inputDetalle.value.trim() || "Servicio personalizado CONECTA.",
    precio: Math.round(precio),
    contratado: false,
  };
  servicios.unshift(nuevo);

  // Se limpian los filtros para que el nuevo servicio siempre quede visible.
  categoriaActiva = "Todos";
  textoBusqueda = "";
  buscador.value = "";
  marcarFiltroActivo();

  formulario.reset();
  ocultarErrorFormulario();
  actualizarVista(nuevo.id);
  mostrarToast(`"${nuevo.nombre}" se agregó al catálogo.`, "exito");
  inputNombre.focus();
}

function alternarContratacion(id) {
  const servicio = servicios.find((s) => s.id === id);
  if (!servicio) return;

  servicio.contratado = !servicio.contratado;
  actualizarVista();
  mostrarToast(
    servicio.contratado
      ? `"${servicio.nombre}" se agregó a tu plan.`
      : `"${servicio.nombre}" se quitó de tu plan.`,
    servicio.contratado ? "exito" : "info"
  );
}

function eliminarServicio(id) {
  const indice = servicios.findIndex((s) => s.id === id);
  if (indice === -1) return;

  const [eliminado] = servicios.splice(indice, 1);
  ultimoEliminado = { servicio: eliminado, indice };
  actualizarVista();
  mostrarToast(`"${eliminado.nombre}" se eliminó del catálogo.`, "peligro", { clave: "deshacer", texto: "Deshacer" });
}

function deshacerEliminacion() {
  if (!ultimoEliminado) return;

  const { servicio, indice } = ultimoEliminado;
  servicios.splice(indice, 0, servicio);
  ultimoEliminado = null;
  actualizarVista(servicio.id);
  mostrarToast(`"${servicio.nombre}" se restauró.`, "exito");
}

function vaciarPlan() {
  servicios.forEach((s) => (s.contratado = false));
  actualizarVista();
  mostrarToast("Tu plan quedó vacío.", "info");
}

function limpiarFiltros() {
  categoriaActiva = "Todos";
  textoBusqueda = "";
  buscador.value = "";
  marcarFiltroActivo();
  renderizarServicios();
}

/* ---------- 9. Eventos ---------- */

function registrarEventos() {
  // Click en los botones de cada tarjeta (delegación de eventos)
  contenedor.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    const tarjeta = boton.closest(".tarjeta");
    const id = tarjeta ? Number(tarjeta.dataset.id) : null;

    if (boton.dataset.accion === "alternar") alternarContratacion(id);
    if (boton.dataset.accion === "eliminar") eliminarServicio(id);
    if (boton.dataset.accion === "limpiar-filtros") limpiarFiltros();
  });

  // Click en "Mi plan"
  listaPlan.addEventListener("click", (evento) => {
    const boton = evento.target.closest('button[data-accion="quitar"]');
    if (boton) alternarContratacion(Number(boton.dataset.id));
  });
  botonVaciar.addEventListener("click", vaciarPlan);

  // Click en los filtros de categoría
  filtros.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-categoria]");
    if (!boton) return;
    categoriaActiva = boton.dataset.categoria;
    marcarFiltroActivo();
    renderizarServicios();
  });

  // Teclado: búsqueda en tiempo real mientras se escribe
  const filtrarPorTexto = () => {
    textoBusqueda = buscador.value;
    renderizarServicios();
  };
  buscador.addEventListener("keyup", filtrarPorTexto);
  buscador.addEventListener("input", filtrarPorTexto);

  // Teclado: atajos Ctrl/Cmd + K para buscar y Escape para limpiar
  document.addEventListener("keydown", (evento) => {
    if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "k") {
      evento.preventDefault();
      buscador.focus();
      buscador.select();
    }
    if (evento.key === "Escape" && document.activeElement === buscador) {
      buscador.value = "";
      filtrarPorTexto();
    }
  });

  // Formulario: el botón "Agregar" dispara el evento submit
  formulario.addEventListener("submit", agregarServicio);
  formulario.addEventListener("input", ocultarErrorFormulario);

  // Botón "Deshacer" dentro de los avisos
  contenedorToasts.addEventListener("click", (evento) => {
    const boton = evento.target.closest('button[data-accion="deshacer"]');
    if (!boton) return;
    deshacerEliminacion();
    boton.closest(".toast").remove();
  });
}

/* ---------- 10. Inicio ---------- */

registrarEventos();
actualizarVista();