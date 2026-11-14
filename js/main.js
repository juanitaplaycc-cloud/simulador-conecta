/*
   Proyecto: CONECTA
   Simulador de gestion de servicios de telecomunicaciones.
   
   Objetivo:
   Administrar un catalogo de servicios utilizando:
   Arrays y objetos
   Funciones
   Manipulacion del DOM
   innerHTML y template strings
   eventos con con addEventListener
   metodos map(), filter() y reduce().
   */

   /* Modelo de datos
   Array principal que almacena los servicios.
   Cada servicio es un objeto con sus propiedades */

   let planes = [
    {
        id: 1,
        nombre: "Fibra esencial",
        tipo: "Internet",
        precio: 59900,
        descripcion: "Conexion estable para navegar y tabajar",
        disponible: true,
        favorito: false
    },
    {
        id: 2,
        nombre: "Fibra Ultra",
        tipo: "Internet",
        precio: 89900,
        descripcion: "Alta velocidad para hogares conectados.",
        disponible: true,
        favorito: true
    },
    {
        id: 3,
        nombre: "Voz Total",
        tipo: "Telefonia",
        precio: "32900",
        descripcion: "Comunicacion nacional con minutos ilimitados.",
        disponible: true,
        favorito: false
    },

    {
        id:4,
        nombre: "TV Entretenimiento",
        tipo: "Television",
        precio: "74900",
        descripcion: "Entretenimiento para todos los integrantes del hogar.",
        disponible: false,
        favorito: false
    },
    {
        id: 5,
        nombre:"Conecta HOGAR",
        tipo:"Combo",
        precio:"129900",
        descripcion:"Internet de alta velocidad y television en un solo plan.",
        disponible: true,
        favorito: true
    },
    {
    id: 6,
    nombre: "Fibra Familiar",
    tipo:"Internet",
    precio:"69900",
    descripcion:"Una conexion pensada para toda la familia.",
    disponible: true,
    favorito: false
    }
];

/**
 Seleccion del elemento DOM
 Se guardan referencias a los elementos HTML que 
 JavaScript necesita consultar o modificar. 
 */

 //Contenedor principal de las tarjetas
 const contenedorPlanes = document.getElementById("contenedor-planes");

 //Elementos de busqueda y filtrado
 const buscador = document.getElementById("buscador");
 const filtroCategoria = document.getElementById("filtro-categoria");
 const filtroEstado = document.getElementById("filtro-estado");

 const botonReiniciarBusqueda = document.getElementById("reiniciar-busqueda");

 //Elementos del formulario
 const formulario = document.getElementById("formulario-plan");
 const campoNombre = document.getElementById("nombre");
 const campoTipo = document.getElementById("tipo");
 const campoPrecio = document.getElementById("precio");
 const campoDescripcion = document.getElementById("descripcion");
 const campoDisponible = document.getElementById("disponible");

 //Elementos de estadisticas
 const totalPlanes = document.getElementById("total-planes");
 const planesDisponibles = document.getElementById("planes-disponibles");
 const planesNoDisponibles = document.getElementById("planes-no-disponibles");
 const totalFavoritos = document.getElementById("total-favoritos");

 //Elementos de informacion y mensaje 
 const estadoVacio = document.getElementById("estado-vacio");
 const contadorResultados = document.getElementById("contador-resultados");
 const mensajeToast = document.getElementById("mensaje-toast");
 const textoToast = document.getElementById("texto-toast");

 // Botones auxiliares
 const botonLimpiarFiltros = document.getElementById("limpiar-filtros");
 const botonReinniciarBusqueda = document.getElementById("reiniciar-busqueda");

 /** Variables  de control y funciones utilitarias */

 //Identificador incremental para los nuevos servicios
 let siguienteId = Math.max(...planes.map(plan => plan.id)) + 1;

 //Referencia al temporizador del mensaje
 let temporizadorToast;

 //Convierte un numero en formato de moneda colombiana
 function formatoCOP(valor) {
    return new  Intl.NumberFormat("es-CO", {
        style:"currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(valor);
 }

 //Escapa caracteres especiales para evitar que los datos
 //Ingresados por el usuario se interpreten como codigo HTML
 function escaparHTML(valor) {
    return String(valor).replace(/[&<>"']/g, caracter => {
        const caracteres ={
              "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return caracteres[caracter];
        });
    }
    //Normaliza los nombres de categoria para construir
    //clases CSS sin problemas con tildes o caracteres especiales
    function normalizarCategoria(categoria) {
        return categoria
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
 }

 /**
  * Actualizacion de estadisticas
  * Calcula los datos del catalogo y los muestra en pantalla
  */

 function actualizarEstadisticas() {

    //Cantidad total de servicios registrados
    const cantidadTotal = planes.length;

    //Cuenta los servicios que estan disponibles
    const cantidadDisponibles = planes.filter(
        plan => plan.disponible
    ).length;

    //Cuenta los servicios que no estan disponibles
    const cantidadNoDisponibles = planes.filter(
        plan => !plan.disponible
    ).length;

    //Cuenta los servicios marcados como favoritos
    const cantidadFavoritos = planes.filter(
        plan => plan.favorito
    ).length;

    //Actualiza los valores directamente en el DOM
    totalPlanes.textContent = cantidadTotal;
    planesDisponibles.textContent = cantidadDisponibles;
    planesNoDisponibles.textContent = cantidadNoDisponibles;
    totalFavoritos.textContent =cantidadFavoritos;
 }

 /* 
 Filtrado de servicios
 Combina la busqueda por texto con los filtros
 de categoria y disponibilidad */

 function obtenerPlanesFiltrados() {

    //Obtienelos valores actuales de los controles.

    const textoBusqueda = buscador.value.trim().toLowerCase();
    const categoriaSeleccionada = filtroCategoria.value;
    const estadoSeleccionado = filtroEstado.value;


    //filter() crea una nueva coleccion sin modificar
    //el array original
    return planes.filter(plan => {

        //Comprueba si el nombre o la descripcion 
        // contiene el texto escrito en el buscador

        const coincideTexto =
        plan.nombre.toLowerCase().includes(textoBusqueda) ||
        plan.descripcion.toLowerCase().includes(textoBusqueda);

        // Coprueba si coincide con la categoria seleccionada
        const coincideCategoria =
        categoriaSeleccionada === "todos" ||
        plan.tipo === categoriaSeleccionada;

        //Comprueba si coincide con el estado seleccionado
        let coincideEstado = true;

        if (estadoSeleccionado === "disponible") {
            coincideEstado = plan.disponible;
        } else if (estadoSeleccionado ==="no-disponible") {
            coincideEstado = !plan.disponible;
        }

        //El servicio debe cumplir todos los criterios
        return coincideTexto && coincideCategoria && coincideEstado;
    });
 }

 /** Renderizado Dinamico del Catalogo
  * Recorre los servicios y genera las tarjetas mediante
  * map(), template strings e innerHTML
  */

 function renderizarPlanes() {
     //Obtiene los servicios que cumplen los filtros
     const planesFiltrados = obtenerPlanesFiltrados();

     //Actualiza el contador de resultados
     contadorResultados.textContent =
     `  Mostrando ${planesFiltrados.length} de ${planes.lenght} servicios`;

     // Controla la visibilidad del catalogo y del estado vacio
     const hayResultados =planesFiltrados.lenght > 0;

     contenedorPlanes.hidden = !hayResultados;
     estadoVacio.hidden = hayResultados;

     //Si no existen resultados, limpia el contenedor
     if (!hayResultados) {
        contenedorPlanes.innerHTML = "";
        return;
     }

     //map() transforma cada objeto en una tarjeta HTML
     //join() une todas las tarjetas en una sola cadena
     const tarjetasHTML = planesFiltrados.map(plan => {

        //Prepara los datos para mostrarlos de forma segura
        const nombre = escaparHTML(plan.nombre);
        const tipo = escaparHTML(plan.tipo);
        const descripcion = escaparHTML(plan.decripcion);

        // Define los textos y clases segun el estado
        const textoEstado   = plan.disponible
        ? "Disponible"
        : "No disponible";

        const claseEstado = plan.disponible
        ? "available"
        : "unavailable";

        const claseCategoria = normalizarCategoria(plan.tipo);

        //Genera el contenido HTML de cada tarjeta
        return `
        <article class=plan-card ${plan.favorito ? "favorite" : ""}"
        data-id="${plan.id}">
        
        <div class="plan-top">

        <span class="category-tag ${claseCategoria}">
        ${tipo}
        </span>

        <button
        type="button"
        class=favorite-button ${plan.favorito ? "is-favorite" : ""}"
        data-accion="favorito"
        data-id="${plan.id}"
        aria-label="${plan.favorito ? "Quitar de favoritos" : "Agregar a favoritos"}"
        aria-pressed="${plan.favorito}"
        title="${plan.favorito ? "Quitar de favoritos" : "Agregar a favoritos"}">
        
        <i class="fa-solid fa-star"></i>
        </button>
        
        <h3 class="plan-name">${nombre}</h3>
        <p class="plan-description">${description}</p>

        <div class="plan-price">
        ${formatoCOP(plan.precio)}
        <small>/ mes </small>
        </div>

        <hr class="plan-divider">
        <span class="plan-status ${claseEstado}">
        ${textoEstado}
        </span>

        <div class="plan-actions">

        <button
        type="button"
        class="plan-action-button"
        data-accion="estado"
        data-id="${plan.id}">

        <i class="fa-solid fa-arrows-rotate"></i>
        Cambiar estado
        </button>

        <button
        type="button"
        class="plan-action-button delete"
        data-accion="eliminar"
        data-id="${plan.id}">

        <i class="fa-solid fa-trash"></i>
        Eliminar
        </button>
        </div>
        </article>

        `;
     }).join("");

     // Inserta todas las tarjetas generadas dentro del DOM
        contenedorPlanes.innerHTML = tarjetasHTML;

    }

    /**Mensajes de feedback visual 
     * Muestra confirmaciones sin utilizar alert()
     */

    function mostrarMensaje(mensaje) {
        //cambia el texto del mensaje
        textoToast.textContent = mensaje;

        //Muestra el mensaje agregando la clase CSS
            mensajeToast.classList.add("show");

            //Evita acumular temporizadores anteriores
            clearTimeout(temporizadorToast);

            //Oculta el mensaje despues de tres segundos
            temporizadorToast = setTimeout(() => {
                mensajeToast.classList.remove("show");
                
            }, 3000);
    }

    /* Validacion del formulario
    Comprueba que los campos tengan informacion correcta
*/

//Limpia los mensajes de error anteriores
function limpiarErrores() {

    const  grupos = document.querySelectorAll(".form-group");
    const errores = document.querySelectorAll(".field-error");

    grupos.forEach(grupo => {
        grupo.classList.remove("invalid");
    });

    errores.forEach(error => {
        error.textContent = "";
    });
}


// Muestra el error correspondiente a un campo.
function mostrarError(campo, mensaje) {

    const grupo = campo.closest(".form-group");
    const error = document.getElementById(`error-${campo.id}`);

    grupo.classList.add("invalid");
    error.textContent = mensaje;
}


// Valida los datos antes de registrar un nuevo servicio.
function validarFormulario() {

    limpiarErrores();

    let formularioValido = true;

    const nombre = campoNombre.value.trim();
    const tipo = campoTipo.value;
    const precio = Number(campoPrecio.value);
    const descripcion = campoDescripcion.value.trim();

    // Validación del nombre.
    if (nombre.length < 3) {
        mostrarError(
            campoNombre,
            "El nombre debe tener al menos 3 caracteres."
        );

        formularioValido = false;
    }

    // Validación de la categoría.
    if (!tipo) {
        mostrarError(
            campoTipo,
            "Selecciona una categoría."
        );

        formularioValido = false;
    }

    // Validación del precio.
    if (
        campoPrecio.value.trim() === "" ||
        !Number.isFinite(precio) ||
        precio < 1000 ||
        precio > 100000000
    ) {
        mostrarError(
            campoPrecio,
            "Ingresa un precio entre $1.000 y $100.000.000."
        );

        formularioValido = false;
    }

    // Validación de la descripción.
    if (descripcion.length < 10) {
        mostrarError(
            campoDescripcion,
            "La descripción debe tener al menos 10 caracteres."
        );

        formularioValido = false;
    }

    return formularioValido;
}


/*  Registro de nuevos servicios
   El evento submit permite agregar un objeto al array
   sin recargar la página.*/
   
formulario.addEventListener("submit", function(evento) {

    // Evita que el navegador recargue la página.
    evento.preventDefault();

    // Detiene el registro si existen errores.
    if (!validarFormulario()) {
        mostrarMensaje("Revisa los campos del formulario.");
        return;
    }

    // Construye un nuevo objeto con los datos ingresados.
    const nuevoPlan = {
        id: siguienteId,
        nombre: campoNombre.value.trim(),
        tipo: campoTipo.value,
        precio: Number(campoPrecio.value),
        descripcion: campoDescripcion.value.trim(),
        disponible: campoDisponible.checked,
        favorito: false
    };

    // Agrega el objeto al array principal.
    planes.push(nuevoPlan);

    // Incrementa el identificador para el próximo registro.
    siguienteId++;

    // Limpia los campos del formulario.
    formulario.reset();

    // Elimina los posibles mensajes de validación.
    limpiarErrores();

    // Actualiza las estadísticas y el catálogo.
    actualizarEstadisticas();
    renderizarPlanes();

    // Informa al usuario que el registro fue exitoso.
    mostrarMensaje("El servicio se registró correctamente.");

    // Lleva al usuario al catálogo para visualizar el nuevo plan.
    document.getElementById("catalogo").scrollIntoView({
        behavior: "smooth"
    });
});


/*  Interacciones con las tarjetas
   Se utiliza delegación de eventos: un solo listener
   controla los botones de todas las tarjetas. */
contenedorPlanes.addEventListener("click", function(evento) {

    // Identifica el botón que recibió el clic.
    const boton = evento.target.closest("button[data-accion]");

    // Si el clic no fue sobre un botón, no hace nada.
    if (!boton) {
        return;
    }

    // Obtiene la acción y el identificador del servicio.
    const accion = boton.dataset.accion;
    const id = Number(boton.dataset.id);

    // Busca el objeto correspondiente en el array.
    const planSeleccionado = planes.find(plan => plan.id === id);

    // Comprueba que el servicio exista.
    if (!planSeleccionado) {
        return;
    }


    // Accion 1: Agregar o quitar de favoritos.
    if (accion === "favorito") {

        planSeleccionado.favorito = !planSeleccionado.favorito;

        mostrarMensaje(
            planSeleccionado.favorito
                ? "Servicio agregado a favoritos."
                : "Servicio retirado de favoritos."
        );
    }


    // Accion 2: Cambiar disponibilidad.
    else if (accion === "estado") {

        planSeleccionado.disponible = !planSeleccionado.disponible;

        mostrarMensaje(
            planSeleccionado.disponible
                ? "El servicio ahora está disponible."
                : "El servicio ahora no está disponible."
        );
    }


    // Accion 3: Eliminar un servicio.
    else if (accion === "eliminar") {

        // filter() crea un nuevo array excluyendo el servicio.
        planes = planes.filter(plan => plan.id !== id);

        mostrarMensaje("El servicio fue eliminado del catálogo.");
    }

    // Actualiza la información después de cualquier acción.
    actualizarEstadisticas();
    renderizarPlanes();
});


/* Eventos de busqueda y filtrado
   Los resultados se actualizan mientras el usuario escribe
   o modifica las opciones de los selectores.*/

// Búsqueda en tiempo real mediante el evento input.
buscador.addEventListener("input", renderizarPlanes);

// Filtrado por categoría.
filtroCategoria.addEventListener("change", renderizarPlanes);

// Filtrado por disponibilidad.
filtroEstado.addEventListener("change", renderizarPlanes);


/* Limpieza de filtros
   Restablece los controles y muestra nuevamente el catálogo.*/
function limpiarFiltros() {

    buscador.value = "";
    filtroCategoria.value = "todos";
    filtroEstado.value = "todos";

    renderizarPlanes();

    mostrarMensaje("Se restablecieron los filtros.");
}


// Evento del botón para limpiar los filtros.
botonLimpiarFiltros.addEventListener("click", limpiarFiltros);


// Evento del botón del estado vacío.
botonReiniciarBusqueda.addEventListener("click", limpiarFiltros);


/* Eventos de teclado
   Atajos para mejorar la experiencia de navegación.*/


document.addEventListener("keydown", function(evento) {

    // Detecta Ctrl + K o Command + K en Mac.
    if (
        (evento.ctrlKey || evento.metaKey) &&
        evento.key.toLowerCase() === "k"
    ) {
        evento.preventDefault();

        // Lleva el cursor al buscador.
        buscador.focus();

        // Selecciona el texto que ya esté escrito.
        buscador.select();
    }

    // Detecta Escape para limpiar la búsqueda.
    if (
        evento.key === "Escape" &&
        document.activeElement === buscador
    ) {
        buscador.value = "";
        renderizarPlanes();
        buscador.blur();
    }

});


/* Limpieza de errores al editar el formulario
   Quita el error de un campo cuando el usuario lo modifica. */

[campoNombre, campoTipo, campoPrecio, campoDescripcion].forEach(campo => {

    campo.addEventListener("input", function() {

        const grupo = campo.closest(".form-group");
        const error = document.getElementById(`error-${campo.id}`);

        grupo.classList.remove("invalid");
        error.textContent = "";
    });

    campo.addEventListener("change", function() {

        const grupo = campo.closest(".form-group");
        const error = document.getElementById(`error-${campo.id}`);

        grupo.classList.remove("invalid");
        error.textContent = "";
    });
});


/*  Inicializaciones del simulador
   Estas funciones se ejecutan al cargar el archivo. */

function iniciarAplicacion() {

    // Calcula las estadísticas iniciales.
    actualizarEstadisticas();

    // Dibuja las tarjetas iniciales.
    renderizarPlanes();
}

// Ejecuta la aplicación.
iniciarAplicacion();
