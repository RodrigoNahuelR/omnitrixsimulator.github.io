// Variables de estado
let indice = 0;
let angulo = 90;
let omnitrix_activado = false;
let transformado = false;
let timeoutID = null;

// Elementos DOM

const center = document.getElementById("center");
const dial_omnitrix = document.getElementById("dial");
const silueta = document.getElementById("alien_silhouette");
const center_off = document.getElementById("center_off");
const center_on = document.getElementById("center_on");

// Sonidos
const sonido_transormacion = new Audio("sounds/omnitrix-transform.mp3");
const sonido_next = new Audio("sounds/omnitrix-next.mp3");
const sonido_previus = new Audio("sounds/omnitrix-previus.mp3");
const sonido_activacion = new Audio("sounds/omnitrix-activado.mp3");
const sonido_loop = new Audio("sounds/omnitrix_waiting_selection.mp3");
const sonido_tiempo_agotado = new Audio("sounds/omnitrix-power-down.mp3");
sonido_loop.loop = true;

// Lista de aliens
const aliens = [
  "fuego",
  "cuatro_brazos",
  "xrl8",
  "insectoide",
  "diamante",
  "materia_gris",
  "bestia",
  "cannonbolt",
  "acuatico",
  "ultra_t",
];

// Flash verde
const flash = document.createElement("div");
flash.style.position = "fixed";
flash.style.top = 0;
flash.style.left = 0;
flash.style.width = "100vw";
flash.style.height = "100vh";
flash.style.backgroundColor = "#00ff00";
flash.style.opacity = "0";
flash.style.pointerEvents = "none";
flash.style.transition = "opacity 0.2s ease-in-out";
flash.style.zIndex = "9999";
document.body.appendChild(flash);

// Flash rojo
const redFlash = document.createElement("div");
redFlash.style.position = "fixed";
redFlash.style.top = "0";
redFlash.style.left = "0";
redFlash.style.width = "100vw";
redFlash.style.height = "100vh";
redFlash.style.backgroundColor = "#ff0000";
redFlash.style.opacity = "0";
redFlash.style.pointerEvents = "none";
redFlash.style.transition = "opacity 0.2s ease-in-out";
redFlash.style.zIndex = "9999";
document.body.appendChild(redFlash);

// Flash verde al transformar
function hacerFlash() {
  flash.style.opacity = "0.8";
  setTimeout(() => {
    flash.style.opacity = "0";
  }, 300);
}

// Flash rojo final mejorado (sin romper tu ritmo)
function hacerFlashRojoFinal(callback) {
  const tiempos = [200, 180, 150, 150, 200, 800];
  let i = 0;

  function parpadear() {
    if (i >= tiempos.length) {
      if (callback) callback();
      return;
    }

    redFlash.style.opacity = "0.85";

    setTimeout(() => {
      redFlash.style.opacity = "0";
      setTimeout(() => {
        i++;
        parpadear();
      }, 80);
    }, tiempos[i]);
  }

  parpadear();
}

// Evento tocar el centro
center.addEventListener("click", () => {
  if (!omnitrix_activado && !transformado) {
    // Encender Omnitrix
    center_off.style.display = "none";
    center_on.style.display = "block";

    sonido_activacion.currentTime = 0;
    sonido_activacion.play();

    sonido_activacion.onended = () => {
      sonido_loop.currentTime = 0;
      sonido_loop.play();
    };

    omnitrix_activado = true;
    mostrar_alien();
  } else if (omnitrix_activado && !transformado) {
    // Transformarse
    hacerFlash();
    sonido_loop.pause();
    sonido_loop.currentTime = 0;
    sonido_transormacion.currentTime = 0;
    sonido_transormacion.play();

    transformado = true;
    omnitrix_activado = false;

    // Mostrar silueta
    silueta.style.display = "block";

    // Cambiar el centro por la imagen de transformación
    center_on.style.display = "none";
    center_off.style.display = "none";

    const imgTransformado = document.createElement("img");
    imgTransformado.src = "graphics/omnitrix-transformed.svg";
    imgTransformado.id = "center_transformed";
    imgTransformado.style.position = "absolute";
    imgTransformado.style.top = "0";
    imgTransformado.style.left = "0";
    imgTransformado.style.width = "100%";
    imgTransformado.style.height = "100%";
    center.appendChild(imgTransformado);

    timeoutID = setTimeout(() => {
      sonido_tiempo_agotado.currentTime = 0;
      sonido_tiempo_agotado.play();

      hacerFlashRojoFinal(() => {
        // Apagar Omnitrix
        document.getElementById("center_transformed")?.remove();
        center_on.style.display = "none";
        center_off.style.display = "block";
        silueta.style.display = "none";
        transformado = false;
        indice = 0;
        angulo = 90;
        dial_omnitrix.style.transform = `rotate(${angulo}deg)`;
        mostrar_alien();
      });
    }, 20000); // Este es el tiempo de transformacion
  }
});

// Mostrar alien en canvas y silueta (solo si activado o transformado)
function mostrar_alien() {
  if (omnitrix_activado || transformado) {
    const alien_seleccionado = aliens[indice];

    silueta.src = `graphics/${alien_seleccionado}.svg`;
    silueta.style.display = "block";
  } else {
    silueta.style.display = "none";
  }
}

// GESTOS — Touch
let touchStartX = 0;
let touchEndX = 0;

document.body.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.body.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe(touchEndX - touchStartX);
});

// GESTOS EN TODA LA PANTALLA — Movimiento tipo rueda
let gestureStartX = 0;
let gestureStartY = 0;
let gestureEndX = 0;

// Touch
document.body.addEventListener("touchstart", (e) => {
  const touch = e.changedTouches[0];
  gestureStartX = touch.clientX;
  gestureStartY = touch.clientY;
});

document.body.addEventListener("touchend", (e) => {
  const touch = e.changedTouches[0];
  gestureEndX = touch.clientX;
  handleWheelSwipe(gestureStartX, gestureStartY, gestureEndX);
});

// Mouse (PC)
let dragging = false;

document.body.addEventListener("mousedown", (e) => {
  dragging = true;
  gestureStartX = e.clientX;
  gestureStartY = e.clientY;
});

document.body.addEventListener("mouseup", (e) => {
  if (!dragging) return;
  dragging = false;
  gestureEndX = e.clientX;
  handleWheelSwipe(gestureStartX, gestureStartY, gestureEndX);
});

// Nueva lógica de control de dirección tipo rueda
function handleWheelSwipe(startX, startY, endX) {
  if (!omnitrix_activado || transformado) return;

  const deltaX = endX - startX;
  const umbral = 50; // sensibilidad mínima
  const pantallaMitad = window.innerHeight / 2;

  if (Math.abs(deltaX) < umbral) return;

  const desdeArriba = startY < pantallaMitad;
  const sentidoHorario =
    (desdeArriba && deltaX > 0) || (!desdeArriba && deltaX < 0);

  if (sentidoHorario) {
    indice = (indice + 1) % aliens.length;
    angulo += 90;
    sonido_next.currentTime = 0;
    sonido_next.play();
  } else {
    indice = (indice - 1 + aliens.length) % aliens.length;
    angulo -= 90;
    sonido_previus.currentTime = 0;
    sonido_previus.play();
  }

  dial_omnitrix.style.transform = `rotate(${angulo}deg)`;
  mostrar_alien();
}
