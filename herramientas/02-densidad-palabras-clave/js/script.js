document.addEventListener("DOMContentLoaded", function () {
  const btnAnalizar = document.getElementById("btn-analizar");

  btnAnalizar.addEventListener("click", function () {
    const textoAnalisis = document.getElementById("texto-analisis").value;
    const palabrasClave = document.getElementById("input-keywords").value;
    const minDensity =
      parseFloat(document.getElementById("densidad-min").value) || 0.5;
    const maxDensity =
      parseFloat(document.getElementById("densidad-max").value) || 2.5;

    if (textoAnalisis.trim() === "") {
      alert("Por favor, introduce un texto para analizar.");
      return;
    }

    // 1. Normalizar texto y convertirlo en un array de palabras usando bucle tradicional
    const textoNormalizado = normalizarTexto(textoAnalisis);
    const palabrasSplit = textoNormalizado.split(" ");

    const palabras = [];
    for (let i = 0; i < palabrasSplit.length; i++) {
      if (palabrasSplit[i] !== "") {
        palabras.push(palabrasSplit[i]);
      }
    }
    // En el array palabras solo quedan palabras válidas (sin espacios vacíos) del texto normalizado.

    const totalPalabras = palabras.length;

    if (totalPalabras === 0) {
      alert("El texto no contiene palabras válidas.");
      return;
    }

    // 2. Analizar Keywords del usuario (pasando directamente el texto ya normalizado)
    analizarKeywordsUsuario(
      textoNormalizado,
      palabrasClave,
      totalPalabras,
      minDensity,
      maxDensity,
    );

    // 3. Generar ranking Top 20 de palabras frecuentes
    generarRankingPalabras(palabras, totalPalabras);
  });
});

/**
 * Analiza las palabras clave introducidas por el usuario usando bucles simples
 */
function analizarKeywordsUsuario(
  textoNorm,
  palabrasClave,
  totalPalabras,
  minDensity,
  maxDensity,
) {
  const contenedorResultados = document.getElementById("resultados-keywords");

  if (palabrasClave.trim() === "") {
    contenedorResultados.innerHTML =
      '<p class="subtitle">No se han introducido palabras clave objetivo.</p>';
    return;
  }

  // Separar keywords manualmente con un bucle
  const keywordsBrutas = palabrasClave.split(",");
  const keywords = [];
  for (let i = 0; i < keywordsBrutas.length; i++) {
    const keywordLimpia = keywordsBrutas[i].trim();
    if (keywordLimpia !== "") {
      keywords.push(keywordLimpia);
    }
  } // En el array keywords solo quedan keywords válidas (sin espacios vacíos).

  let html = `
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Keyword</th>
            <th>Apariciones</th>
            <th>Densidad (%)</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
  `;

  for (let i = 0; i < keywords.length; i++) {
    const kw = keywords[i];
    const kwNormalizada = normalizarTexto(kw);

    // Contar las palabras de la keyword cuando el usuario introduce varias palabras en una keyword.
    const kwPartes = kwNormalizada.split(" ");
    let numPalabrasClave = 0;
    for (let p = 0; p < kwPartes.length; p++) {
      if (kwPartes[p] !== "") {
        numPalabrasClave++;
      }
    }

    // Expresión regular con límites de palabra (\b)
    const regexKw = new RegExp(
      `\\b${kwNormalizada.replace(/\s+/g, "\\s+")}\\b`,
      "gi",
    );
    const coincidencias = textoNorm.match(regexKw);

    let apariciones = 0;
    if (coincidencias !== null) {
      apariciones = coincidencias.length;
    }

    // Cálculo de densidad
    let densidad = 0;
    if (totalPalabras > 0) {
      densidad = ((apariciones * numPalabrasClave) / totalPalabras) * 100;
    }

    // Estado visual con condiciones simples
    let estadoHTML = "";
    if (densidad < minDensity) {
      estadoHTML =
        '<span style="color: #d97706; font-weight: bold;">Baja</span>';
    } else if (densidad > maxDensity) {
      estadoHTML =
        '<span style="color: #dc2626; font-weight: bold;">Alta</span>';
    } else {
      estadoHTML =
        '<span style="color: #16a34a; font-weight: bold;">Óptima</span>';
    }

    html += `
      <tr>
        <td><strong>${kw}</strong></td>
        <td>${apariciones}</td>
        <td>${densidad.toFixed(2)}%</td>
        <td>${estadoHTML}</td>
      </tr>
    `;
  }

  html += "</tbody></table></div>";
  contenedorResultados.innerHTML = html;
}

/** 
 * Listado de Stopwords en español. 
 * Se han incluido artículos, preposiciones, pronombres, conjunciones y otros conectores.
 */
 const STOPWORDS = new Set([
  'de', 'la', 'que', 'el', 'en', 'y', 'los', 'del', 'para' , 'se', 'las', 'por', 'un', 'con', 
  'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'a' , 'este', 'sí', 
  'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay', 
  'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 
  'otros', 'fase', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mi', 'antes', 'algunos', 'qué', 
  'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 
  'nada', 'muchos', 'cual', 'sea', 'poco', 'ella', 'estar', 'haber', 'estas', 'están', 'estado', 
  'he', 'había', 'fueron', 'ser', 'son' , 'luego' , 'siempre' , 'nunca' , 'ahora'
]);

/**
 * Genera el ranking de palabras frecuentes mediante bucles explícitos
 */
function generarRankingPalabras(palabras, totalPalabras) {
  const frecuencias = {};

  // Contar frecuencias con bucle for
  for (let i = 0; i < palabras.length; i++) {
    const palabra = palabras[i];
    if (palabra.length > 2 && !STOPWORDS.has(palabra)) {
      if (frecuencias[palabra]) {
        frecuencias[palabra]++;
      } else {
        frecuencias[palabra] = 1;
      }
    }
  }

  // Pasar el objeto a un array de pares [palabra, frecuencia] manualmente
  const entradas = [];
  for (let palabra in frecuencias) {
    entradas.push([palabra, frecuencias[palabra]]);
  }

  // Ordenar de mayor a menor frecuencia
  entradas.sort(function (a, b) {
    return b[1] - a[1];
  });

  // Quedarnos con los 20 primeros elementos como máximo
  const palabrasOrdenadas = [];
  const limite = entradas.length < 20 ? entradas.length : 20;
  for (let i = 0; i < limite; i++) {
    palabrasOrdenadas.push(entradas[i]);
  }

  // Pintar la tabla en el HTML
  const tbody = document.querySelector("#tabla-palabras tbody");
  tbody.innerHTML = "";

  for (let i = 0; i < palabrasOrdenadas.length; i++) {
    const item = palabrasOrdenadas[i];
    const palabra = item[0];
    const freq = item[1];
    const densidad = ((freq / totalPalabras) * 100).toFixed(2);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${palabra}</td>
      <td>${freq}</td>
      <td>${densidad}%</td>
    `;
    tbody.appendChild(tr);
  }
}