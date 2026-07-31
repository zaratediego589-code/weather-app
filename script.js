const inputCiudad = document.getElementById("ciudad");
const botonBuscar = document.getElementById("btnBuscar");

const nombreCiudad = document.getElementById("nombreCiudad");
const temperatura = document.getElementById("temperatura");
const descripcion = document.getElementById("descripcion");
const humedad = document.getElementById("humedad");
const viento = document.getElementById("viento");
const iconoClima = document.getElementById("iconoClima");
const mensaje = document.getElementById("mensaje");

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

        // 1. Buscar coordenadas de la ciudad
        const urlCiudad =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1&language=es&format=json`;

        const respuestaCiudad = await fetch(urlCiudad);

        const datosCiudad = await respuestaCiudad.json();

        if (!datosCiudad.results || datosCiudad.results.length === 0) {
            mostrarMensaje("No encontramos esa ciudad.", "error");
            return;
        }

        const lugar = datosCiudad.results[0];

        const latitud = lugar.latitude;
        const longitud = lugar.longitude;

        // 2. Consultar el clima usando esas coordenadas
        const urlClima =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;

        const respuestaClima = await fetch(urlClima);

        const datosClima = await respuestaClima.json();

        const actual = datosClima.current;

        // 3. Actualizar la página
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

        mostrarMensaje("Clima actualizado correctamente.", "exito");
        
        setTimeout(() => {
            mostrarMensaje("", "");
        }, 3000);

    } catch (error) {
            console.error(error);

            mostrarMensaje(
                "Ocurrió un error al consultar el clima.",
                "error"
            );
        }   finally {

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