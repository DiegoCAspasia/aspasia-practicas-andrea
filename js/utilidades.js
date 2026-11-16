/**
 * Normaliza un texto para facilitar comparaciones y búsquedas:
 * - Convierte a minúsculas
 * - Elimina tildes y diacríticos
 * - Elimina signos de puntuación y caracteres especiales
 * - Colapsa múltiples espacios en uno solo
 */
function normalizarTexto(texto) {
  if (!texto) return ""; // Retorna una cadena vacía si el texto es nulo, vacío o indefinido.

  return texto
    .toLowerCase()
    .normalize("NFD") // Descompone letras con acentos (ej: 'é' -> 'e' + '´')
    .replace(/[\u0300-\u036f]/g, "") // Elimina las marcas diacríticas (tildes, diéresis)
    .replace(/[^\w\sñ]/g, " ") // Reemplaza signos de puntuación por espacios (conservando la ñ)
    .replace(/\s+/g, " ") // Compactar espacios
    .trim(); // Elimina espacios al principio y al final

    //Encadenando las funciones de normalización para asegurar que el texto esté en un formato uniforme y limpio, facilitando así las comparaciones y búsquedas posteriores.(Encadenamiento de métodos)
}
