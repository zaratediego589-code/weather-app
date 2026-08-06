const inputCiudad = document.getElementById("ciudad");
const botonBuscar = document.getElementById("btnBuscar");

const nombreCiudad = document.getElementById("nombreCiudad");
const temperatura = document.getElementById("temperatura");
const descripcion = document.getElementById("descripcion");
const humedad = document.getElementById("humedad");
const viento = document.getElementById("viento");
const iconoClima = document.getElementById("iconoClima");
const mensaje = document.getElementById("mensaje");
const pronosticoLista =
    document.getElementById("pronosticoLista");
const efectoClima =
    document.getElementById("efectoClima");


async function buscarCiudad() {

    const ciudad = inputCiudad.value.trim();

    if (ciudad === "") {
        mostrarMensaje("Escribe una ciudad.", "error");
        return;
    }

    mostrarMensaje("", "");

    botonBuscar.textContent = "Buscando...";
    botonBuscar.disabled = true;

    try {

        // 1. Buscar las coordenadas de la ciudad
        const urlCiudad =
            `https://geocoding-api.open-meteo.com/v1/search` +
            `?name=${encodeURIComponent(ciudad)}` +
            `&count=1` +
            `&language=es` +
            `&format=json`;

        const respuestaCiudad = await fetch(urlCiudad);

        if (!respuestaCiudad.ok) {
            throw new Error("No se pudo consultar la ciudad.");
        }

        const datosCiudad = await respuestaCiudad.json();

        if (
            !datosCiudad.results ||
            datosCiudad.results.length === 0
        ) {
            mostrarMensaje(
                "No encontramos esa ciudad.",
                "error"
            );

            return;
        }

        const lugar = datosCiudad.results[0];

        const latitud = lugar.latitude;
        const longitud = lugar.longitude;

        // 2. Consultar el clima y el pronóstico
        const urlClima =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitud}` +
            `&longitude=${longitud}` +
            `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
            `&forecast_days=5` +
            `&timezone=auto`;

        const respuestaClima = await fetch(urlClima);

        if (!respuestaClima.ok) {
            throw new Error("No se pudo consultar el clima.");
        }

        const datosClima = await respuestaClima.json();

        const actual = datosClima.current;
        const diario = datosClima.daily;

        // 3. Actualizar la interfaz
        nombreCiudad.textContent =
            `📍 ${lugar.name}, ${lugar.country}`;

        temperatura.textContent =
            `${actual.temperature_2m} °C`;

        iconoClima.textContent =
            obtenerIconoClima(actual.weather_code);

        humedad.textContent =
            `${actual.relative_humidity_2m}%`;

        viento.textContent =
            `${actual.wind_speed_10m} km/h`;

        descripcion.textContent =
            obtenerDescripcionClima(actual.weather_code);

        cambiarFondoClima(
            actual.weather_code,
            actual.is_day
        );

        mostrarPronostico(diario);

        mostrarMensaje(
            "Clima actualizado correctamente.",
            "exito"
        );

        setTimeout(() => {
            mostrarMensaje("", "");
        }, 3000);

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "Ocurrió un error al consultar el clima.",
            "error"
        );

    } finally {

        botonBuscar.textContent = "Buscar";
        botonBuscar.disabled = false;

    }

}


botonBuscar.addEventListener("click", buscarCiudad);


inputCiudad.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        buscarCiudad();
    }

});


function obtenerDescripcionClima(codigo) {

    if (codigo === 0) {
        return "Despejado";
    }

    if (codigo === 1 || codigo === 2) {
        return "Parcialmente nublado";
    }

    if (codigo === 3) {
        return "Nublado";
    }

    if (codigo === 45 || codigo === 48) {
        return "Niebla";
    }

    if (codigo >= 51 && codigo <= 57) {
        return "Llovizna";
    }

    if (codigo >= 61 && codigo <= 67) {
        return "Lluvia";
    }

    if (codigo >= 71 && codigo <= 77) {
        return "Nieve";
    }

    if (codigo >= 80 && codigo <= 82) {
        return "Chubascos";
    }

    if (codigo >= 95) {
        return "Tormenta";
    }

    return "Clima desconocido";
}

function obtenerIconoClima(codigo) {

    if (codigo === 0) {
        return "☀️";
    }

    if (codigo === 1 || codigo === 2) {
        return "🌤️";
    }

    if (codigo === 3) {
        return "☁️";
    }

    if (codigo === 45 || codigo === 48) {
        return "🌫️";
    }

    if (codigo >= 51 && codigo <= 57) {
        return "🌦️";
    }

    if (codigo >= 61 && codigo <= 67) {
        return "🌧️";
    }

    if (codigo >= 71 && codigo <= 77) {
        return "❄️";
    }

    if (codigo >= 80 && codigo <= 82) {
        return "🌧️";
    }

    if (codigo >= 95) {
        return "⛈️";
    }

    return "🌡️";
}

function mostrarMensaje(texto, tipo) {

    mensaje.textContent = texto;

    mensaje.classList.remove(
        "mensaje-error",
        "mensaje-exito"
    );

    if (tipo === "error") {
        mensaje.classList.add("mensaje-error");
    }

    if (tipo === "exito") {
        mensaje.classList.add("mensaje-exito");
    }

}

function mostrarPronostico(diario) {

    pronosticoLista.innerHTML = "";

    for (let i = 0; i < diario.time.length; i++) {

        const fecha = new Date(
            diario.time[i] + "T00:00:00"
        );

        const nombreDia = fecha.toLocaleDateString(
            "es-MX",
            {
                weekday: "short"
            }
        );

        const codigo = diario.weather_code[i];
        const maxima = diario.temperature_2m_max[i];
        const minima = diario.temperature_2m_min[i];

        const tarjeta = document.createElement("article");

        tarjeta.classList.add("pronostico-card");

        tarjeta.innerHTML = `
            <p class="pronostico-dia">
                ${nombreDia}
            </p>

            <div class="pronostico-icono">
                ${obtenerIconoClima(codigo)}
            </div>

            <div class="pronostico-temperaturas">
                <span class="temp-max">
                    ${Math.round(maxima)}°
                </span>

                <span class="temp-min">
                    ${Math.round(minima)}°
                </span>
            </div>
        `;

        pronosticoLista.appendChild(tarjeta);
    }

}

function cambiarFondoClima(codigo, esDia) {

    document.body.classList.remove(
        "clima-despejado-dia",
        "clima-despejado-noche",
        "clima-nublado",
        "clima-lluvia",
        "clima-tormenta",
        "clima-nieve",
        "clima-niebla"
    );

    limpiarEfectosClima();

    if (codigo === 0) {

        if (esDia === 1) {
            document.body.classList.add(
                "clima-despejado-dia"
            );
        } else {
            document.body.classList.add(
                "clima-despejado-noche"
            );
        }

        return;
    }

    if (codigo >= 1 && codigo <= 3) {
        document.body.classList.add("clima-nublado");

        crearNubes();    

        return;
    }

    if (codigo === 45 || codigo === 48) {
        document.body.classList.add("clima-niebla");
        return;
    }

    if (
        (codigo >= 51 && codigo <= 67) ||
        (codigo >= 80 && codigo <= 82)
    ) {
        document.body.classList.add("clima-lluvia");

        crearLluvia();

        return;
    }

    if (codigo >= 71 && codigo <= 77) {
        document.body.classList.add("clima-nieve");

        crearNieve();

        return;
    }

    if (codigo >= 95) {
        document.body.classList.add("clima-tormenta");

        crearLluvia();

        return;
    }

}

function limpiarEfectosClima() {
    efectoClima.innerHTML = "";
}

function crearLluvia() {

    limpiarEfectosClima();

    const cantidadGotas = 90;

    for (let i = 0; i < cantidadGotas; i++) {

        const gota = document.createElement("span");

        gota.classList.add("gota");

        gota.style.left =
            Math.random() * 100 + "%";

        gota.style.animationDuration =
            0.6 + Math.random() * 0.8 + "s";

        gota.style.animationDelay =
            Math.random() * 2 + "s";

        gota.style.opacity =
            0.3 + Math.random() * 0.7;

        efectoClima.appendChild(gota);

    }

}

function crearNieve() {

    limpiarEfectosClima();

    const cantidadCopos = 70;

    for (let i = 0; i < cantidadCopos; i++) {

        const copo = document.createElement("span");

        copo.classList.add("copo");

        copo.textContent = "❄";

        copo.style.left =
            Math.random() * 100 + "%";

        copo.style.fontSize =
            12 + Math.random() * 18 + "px";

        copo.style.animationDuration =
            4 + Math.random() * 5 + "s";

        copo.style.animationDelay =
            Math.random() * 4 + "s";

        copo.style.opacity =
            0.4 + Math.random() * 0.6;

        efectoClima.appendChild(copo);

    }

}

function crearNubes() {

    limpiarEfectosClima();

    const cantidadNubes = 6;

    for (let i = 0; i < cantidadNubes; i++) {

        const nube = document.createElement("span");

        nube.classList.add("nube");

        nube.textContent = "☁";

        nube.style.top =
            5 + Math.random() * 65 + "%";

        nube.style.fontSize =
            70 + Math.random() * 80 + "px";

        nube.style.animationDuration =
            18 + Math.random() * 18 + "s";

        nube.style.animationDelay =
            -Math.random() * 30 + "s";

        nube.style.opacity =
            0.25 + Math.random() * 0.45;

        efectoClima.appendChild(nube);

    }

}