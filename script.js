// Variables de estado
let indice = 0;
let angulo = 90;
let omnitrix_activado = false;
let transformado = false;
let timeoutID = null;

// Elementos DOM
const canvas = document.getElementById("my_canvas");
const ctx = canvas.getContext("2d");
const center = document.getElementById("center");
const omnitrix_transform = document.getElementById("omnitrix_transformed");
const dial_omnitrix = document.getElementById("dial");
const silueta = document.getElementById("alien_silhouette");

// Sonidos
const sonido_transormacion = new Audio("sounds/omnitrix-transform.mp3");
const sonido_next = new Audio("sounds/omnitrix-next.mp3");
const sonido_previus = new Audio("sounds/omnitrix-previus.mp3");
const sonido_activacion = new Audio("sounds/omnitrix-activado.mp3");
const sonido_loop = new Audio("sounds/omnitrix_waiting_selection.mp3");
const sonido_tiempo_agotado = new Audio("sounds/omnitrix-power_down.mp3");

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

// Flash verde al transformarse
const flash = document.createElement("div");
flash.style.position = "fixed";
flash.style.top = 0;
flash.style.left = 0;
flash.style.width = "100vw";
flash.style.height = "100vh";
flash.style.backgroundColor = "#00ff00";
flash.style.opacity = "0";
flash.style.pointerEvents = "none";
flash.style.transition = "opacity 0.3s ease";
flash.style.zIndex = "9999";
document.body.appendChild(flash);

function hacerFlash() {
  flash.style.opacity = "0.8";
  setTimeout(() => {
    flash.style.opacity = "0";
  }, 300);
}

// Activar Omnitrix o Transformar
center.addEventListener("click", () => {
  if (!omnitrix_activado && !transformado) {
    // ENCENDER
    document.getElementById("center_off").style.display = "none";
    document.getElementById("center_on").style.display = "block";

    sonido_activacion.currentTime = 0;
    sonido_activacion.play();

    sonido_activacion.onended = () => {
      sonido_loop.currentTime = 0;
      sonido_loop.play(); // Play waiting selection sound
    };

    omnitrix_activado = true;
    mostrar_alien();
  } else if (omnitrix_activado && !transformado) {
    // TRANSFORMAR
    hacerFlash();
    sonido_loop.pause(); // Stop waiting selection sound
    sonido_loop.currentTime = 0;
    sonido_transormacion.currentTime = 0;
    sonido_transormacion.play();

    transformado = true;
    omnitrix_activado = false;

    // Ensure Omnitrix changes to transformed state
    document.getElementById("center_on").style.display = "none";
    silueta.style.display = "none";
    const omnitrix_transformed = document.createElement("img");
    omnitrix_transformed.id = "omnitrix_transformed";
    omnitrix_transformed.src = "graphics/omnitrix-transformed.svg";
    omnitrix_transformed.className = "omnitrix_transformed"; // Use CSS class for styling
    document.getElementById("center").appendChild(omnitrix_transformed);

    timeoutID = setTimeout(() => {
      sonido_tiempo_agotado.src = "sounds/omnitrix-power-down.mp3"; // Correct sound file
      sonido_tiempo_agotado.currentTime = 0;
      sonido_tiempo_agotado.play();

      // Flash red 5 times, with the last flash slower and longer-lasting
      let flashCount = 0;
      let flashInterval = setInterval(
        () => {
          flash.style.backgroundColor = "#ff0000"; // Red flash
          flash.style.opacity = "0.8";

          if (flashCount === 4) {
            // Change image to omnitrix-transformed.svg immediately on the last flash
            document.getElementById("center_on").style.display = "none";
            document.getElementById("center_off").style.display = "block";
            document.getElementById("omnitrix_transformed").remove();
            silueta.style.display = "none";
            transformado = false;
            indice = 0;
            angulo = 90;
            dial_omnitrix.style.transform = `rotate(${angulo}deg)`;
            mostrar_alien();
          }

          setTimeout(
            () => {
              flash.style.opacity = "0";
            },
            flashCount === 4 ? 1500 : 300
          ); // Last flash fades out slower

          flashCount++;
          if (flashCount >= 5) {
            clearInterval(flashInterval); // Stop flashing
            flash.style.transition = "opacity 1.5s ease"; // Slow fade-out transition
            flash.style.opacity = "0"; // Fade out slowly
            setTimeout(() => {
              flash.style.backgroundColor = "#00ff00"; // Reset to green for future flashes
            }, 1500); // Delay for smooth transition
          }
        },
        flashCount === 4 ? 1200 : 600
      ); // Last flash slower
    }, 30000);
  }
});

// Mostrar alien en canvas y silueta si corresponde
function mostrar_alien() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (omnitrix_activado && !transformado) {
    const alien = aliens[indice];
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(alien, 50, 50);
    silueta.src = `graphics/${alien}.svg`;
    silueta.style.display = "block";
  } else {
    silueta.style.display = "none";
  }
}

// === GESTOS PARA DESLIZAR ===
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].screenX; // Ensure touch detection works globally on phones
});

document.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX; // Ensure touch detection works globally on phones
  handleSwipe(touchEndX - touchStartX);
});

let isDragging = false;
let mouseStartX = 0;

document.addEventListener("mousedown", (e) => {
  isDragging = true;
  mouseStartX = e.clientX; // Detect mouse down anywhere on the screen
});

document.addEventListener("mouseup", (e) => {
  if (!isDragging) return;
  isDragging = false;
  const mouseEndX = e.clientX; // Detect mouse up anywhere on the screen
  handleSwipe(mouseEndX - mouseStartX);
});

function handleSwipe(distance) {
  if (!omnitrix_activado || transformado) return;

  const threshold = 50;

  if (distance > threshold) {
    // Anterior alien
    indice = (indice - 1 + aliens.length) % aliens.length;
    angulo += 90;
    sonido_previus.currentTime = 0;
    sonido_previus.play();
  } else if (distance < -threshold) {
    // Siguiente alien
    indice = (indice + 1) % aliens.length;
    angulo -= 90;
    sonido_next.currentTime = 0;
    sonido_next.play();
  } else {
    return;
  }

  dial_omnitrix.style.transform = `rotate(${angulo}deg)`;
  mostrar_alien();
}
