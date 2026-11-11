// Selección de elementos del DOM
const textarea = document.getElementById("texto-input");
const selectVelocidad = document.getElementById("velocidad-select");
const btnCopiar = document.getElementById("btn-copiar");
const avisoCopiado = document.getElementById("aviso-copiado");

const statPalabras = document.getElementById("stat-palabras");
const statCaracteresCon = document.getElementById("stat-caracteres-con");
const statCaracteresSin = document.getElementById("stat-caracteres-sin");
const statFrases = document.getElementById("stat-frases");
const statParrafos = document.getElementById("stat-parrafos");
const statTiempo = document.getElementById("stat-tiempo");

/**
 * Analiza el texto introducido en tiempo real y actualiza las métricas.
 */
function analizarTexto() {
  const texto = textarea.value;

  // 1. Caracteres con y sin espacios
  const caracteresConEspacios = texto.length;
  const caracteresSinEspacios = texto.replace(/\s+/g, "").length;

  // 2. Palabras: dividir por espacios y descartar vacíos
  const palabras =
    texto.trim() === "" ? [] : texto.trim().split(/\s+/).filter(Boolean);
  const numPalabras = palabras.length;

  // 3. Frases: dividir por signos de cierre (., ?, !)
  const frases =
    texto.trim() === ""
      ? []
      : texto.split(/[.!?]+/).filter((f) => f.trim().length > 0);
  const numFrases = frases.length;

  // 4. Párrafos: dividir por saltos de línea dobles
  const parrafos =
    texto.trim() === ""
      ? []
      : texto.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const numParrafos = parrafos.length;

  // 5. Cálculo del tiempo de lectura en minutos y segundos
  const velocidad = parseInt(selectVelocidad.value, 10);
  const totalSegundos = Math.round((numPalabras / velocidad) * 60);
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;

  let tiempoFormateado = `${segundos} s`;
  if (minutos > 0) {
    tiempoFormateado =
      segundos > 0 ? `${minutos} min ${segundos} s` : `${minutos} min`;
  }

  // Actualización de la interfaz
  statPalabras.textContent = numPalabras;
  statCaracteresCon.textContent = caracteresConEspacios;
  statCaracteresSin.textContent = caracteresSinEspacios;
  statFrases.textContent = numFrases;
  statParrafos.textContent = numParrafos;
  statTiempo.textContent = tiempoFormateado;
}

// Eventos en tiempo real al escribir o cambiar la velocidad
textarea.addEventListener("input", analizarTexto);
selectVelocidad.addEventListener("change", analizarTexto);

// Copiar resumen al portapapeles
btnCopiar.addEventListener("click", () => {
  const resumen = [
    `Métricas del texto:`,
    `- Palabras: ${statPalabras.textContent}`,
    `- Caracteres (con espacios): ${statCaracteresCon.textContent}`,
    `- Caracteres (sin espacios): ${statCaracteresSin.textContent}`,
    `- Frases: ${statFrases.textContent}`,
    `- Párrafos: ${statParrafos.textContent}`,
    `- Tiempo estimado de lectura: ${statTiempo.textContent}`,
  ].join("\n");

  navigator.clipboard.writeText(resumen).then(() => {
    avisoCopiado.classList.remove("hidden");
    setTimeout(() => {
      avisoCopiado.classList.add("hidden");
    }, 2500);
  });
});
