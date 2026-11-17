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

    const totalPalabras = palabras.length;

    if (totalPalabras === 0) {
      alert("El texto no contiene palabras válidas.");
      return;
    }

    // 2. Analizar Keywords del usuario
    analizarKeywordsUsuario(
      textoNormalizado,
      palabrasClave,
      totalPalabras,
      minDensity,
      maxDensity,
    );

    // 3. Generar la tabla unificada de 30 elementos (20 palabras + 10 combinaciones)
    generarRankingUnificado(palabras, totalPalabras);
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

  const keywordsBrutas = palabrasClave.split(",");
  const keywords = [];
  for (let i = 0; i < keywordsBrutas.length; i++) {
    const keywordLimpia = keywordsBrutas[i].trim();
    if (keywordLimpia !== "") {
      keywords.push(keywordLimpia);
    }
  }

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

    const kwPartes = kwNormalizada.split(" ");
    let numPalabrasKw = 0;
    for (let p = 0; p < kwPartes.length; p++) {
      if (kwPartes[p] !== "") {
        numPalabrasKw++;
      }
    }

    const regexKw = new RegExp(
      `\\b${kwNormalizada.replace(/\s+/g, "\\s+")}\\b`,
      "gi",
    );
    const coincidencias = textoNorm.match(regexKw);

    let apariciones = 0;
    if (coincidencias !== null) {
      apariciones = coincidencias.length;
    }

    let densidad = 0;
    if (totalPalabras > 0) {
      densidad = ((apariciones * numPalabrasKw) / totalPalabras) * 100;
    }

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
 */
 const STOPWORDS = new Set([
  'de', 'la', 'que', 'el', 'en', 'y', 'los', 'del', 'para' , 'se', 'las', 'por', 'un', 'con', 
  'no', 'una', 'su', 'al', 'lo', 'como', 'mas', 'pero', 'sus', 'le', 'ya', 'o', 'a' , 'este', 'sí', 
  'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'tambien', 'me', 'hasta', 'hay', 
  'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 
  'otros', 'fase', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mi', 'antes', 'algunos', 'qué', 
  'unos', 'yo', 'otro', 'otras', 'otra', 'el', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 
  'nada', 'muchos', 'cual', 'sea', 'poco', 'ella', 'estar', 'haber', 'estas', 'estan', 'estado', 
  'he', 'habia', 'fueron', 'ser', 'son' , 'luego' , 'siempre' , 'nunca' , 'ahora'
]);

/**
 * Genera un ranking unificado de exactamente 30 elementos (20 palabras individuales + 10 combinaciones)
 */
function generarRankingUnificado(palabras, totalPalabras) {
  // --- 1. OBTENER LAS 20 PALABRAS INDIVIDUALES MÁS REPETIDAS ---
  const frecuenciasPalabras = {};
  for (let i = 0; i < palabras.length; i++) {
    const palabra = palabras[i];
    if (palabra.length > 2 && !STOPWORDS.has(palabra)) {
      if (frecuenciasPalabras[palabra]) {
        frecuenciasPalabras[palabra]++;
      } else {
        frecuenciasPalabras[palabra] = 1;
      }
    }
  }

  const listaPalabras = [];
  for (let palabra in frecuenciasPalabras) {
    listaPalabras.push({
      texto: palabra,
      frecuencia: frecuenciasPalabras[palabra],
      densidad: (frecuenciasPalabras[palabra] / totalPalabras) * 100
    });
  }

  listaPalabras.sort(function (a, b) {
    return b.frecuencia - a.frecuencia;
  });

  const top20Palabras = [];
  const limiteP = listaPalabras.length < 20 ? listaPalabras.length : 20;
  for (let i = 0; i < limiteP; i++) {
    top20Palabras.push(listaPalabras[i]);
  }


  // --- 2. OBTENER LAS 10 COMBINACIONES (Bigramas y Trigramas) MÁS REPETIDAS ---
  const frecuenciasCombos = {};
  for (let i = 0; i < palabras.length - 1; i++) {
    const p1 = palabras[i];
    const p2 = palabras[i + 1];

    if (p1.length > 2 && p2.length > 2 && !STOPWORDS.has(p1) && !STOPWORDS.has(p2)) {
      const combo2 = p1 + " " + p2;
      if (frecuenciasCombos[combo2]) {
        frecuenciasCombos[combo2]++;
      } else {
        frecuenciasCombos[combo2] = 1;
      }
    }

    if (i < palabras.length - 2) {
      const p3 = palabras[i + 2];
      if (p1.length > 2 && p3.length > 2 && !STOPWORDS.has(p1) && !STOPWORDS.has(p3)) {
        const combo3 = p1 + " " + p2 + " " + p3;
        if (frecuenciasCombos[combo3]) {
          frecuenciasCombos[combo3]++;
        } else {
          frecuenciasCombos[combo3] = 1;
        }
      }
    }
  }

  const listaCombos = [];
  for (let combo in frecuenciasCombos) {
    listaCombos.push({
      texto: combo,
      frecuencia: frecuenciasCombos[combo],
      densidad: (frecuenciasCombos[combo] / totalPalabras) * 100
    });
  }

  listaCombos.sort(function (a, b) {
    return b.frecuencia - a.frecuencia;
  });

  const top10Combos = [];
  const limiteC = listaCombos.length < 10 ? listaCombos.length : 10;
  for (let i = 0; i < limiteC; i++) {
    top10Combos.push(listaCombos[i]);
  }


  // --- 3. FUSIONAR AMBOS GRUPOS EN UN ÚNICO ARRAY DE 30 ELEMENTOS ---
  const rankingUnificado30 = [];
  
  for (let i = 0; i < top20Palabras.length; i++) {
    rankingUnificado30.push(top20Palabras[i]);
  }
  for (let i = 0; i < top10Combos.length; i++) {
    rankingUnificado30.push(top10Combos[i]);
  }

  // Pintar y configurar la ordenación sobre esta tabla única de 30 elementos
  pintarTablaUnificadaYConfigurarOrden("#tabla-palabras", rankingUnificado30);
}

/**
 * Pinta la tabla unificada y permite ordenar exclusivamente sus 30 elementos fijos al hacer clic en los <th>
 */
function pintarTablaUnificadaYConfigurarOrden(selectorTabla, arrayDatos30) {
  const tabla = document.querySelector(selectorTabla);
  if (!tabla) return;

  const tbody = tabla.querySelector("tbody");
  const cabeceras = tabla.querySelectorAll("th");

  let asc = false;

  function render() {
    tbody.innerHTML = "";
    for (let i = 0; i < arrayDatos30.length; i++) {
      const item = arrayDatos30[i];
      const densidadStr = item.densidad.toFixed(2);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.texto}</td>
        <td>${item.frecuencia}</td>
        <td>${densidadStr}%</td>
      `;
      tbody.appendChild(tr);
    }
  }

  // Pintar inicialmente
  render();

  // Configurar clics en las cabeceras para reordenar SOLAMENTE este conjunto cerrado de 30 elementos
  for (let c = 0; c < cabeceras.length; c++) {
    cabeceras[c].style.cursor = "pointer";
    cabeceras[c].onclick = function () {
      asc = !asc;

      arrayDatos30.sort(function (a, b) {
        let valA, valB;

        if (c === 0) {
          valA = a.texto;
          valB = b.texto;
          if (asc) {
            return valA.localeCompare(valB);
          } else {
            return valB.localeCompare(valA);
          }
        } else if (c === 1) {
          valA = a.frecuencia;
          valB = b.frecuencia;
        } else {
          valA = a.densidad;
          valB = b.densidad;
        }

        if (asc) {
          return valA - valB;
        } else {
          return valB - valA;
        }
      });

      render();
    };
  }
}