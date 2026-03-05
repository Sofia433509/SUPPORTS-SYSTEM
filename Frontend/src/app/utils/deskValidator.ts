import { Desk } from '../types/desk';

// Resultado de la validación
// Contiene si los datos son válidos, errores críticos y advertencias
export interface ValidationResult {
  isValid: boolean; // Indica si la validación pasó sin errores
  errors: string[]; // Lista de errores que deben corregirse
  warnings: string[]; // Advertencias (no bloquean el uso pero pueden indicar problemas)
}

/**
 * Valida un conjunto de escritorios
 * Comprueba:
 * - IDs vacíos o duplicados
 * - Coordenadas negativas
 * - Dimensiones inválidas
 * - Tamaños sospechosos
 * - Posibles superposiciones
 */
export function validateDesks(desks: Desk[]): ValidationResult {

  const errors: string[] = [];
  const warnings: string[] = [];

  // Verificar que exista al menos un escritorio
  if (desks.length === 0) {
    errors.push('There must be at least one desk');
    return { isValid: false, errors, warnings };
  }

  // Estructuras para detectar IDs duplicados
  const ids = new Set<string>();
  const duplicateIds = new Set<string>();
  
  desks.forEach((desk, index) => {

    // Validar que el ID exista
    if (!desk.id || desk.id.trim() === '') {
      errors.push(`Desk at position ${index + 1}: ID is empty`);
    }

    // Detectar IDs duplicados
    if (ids.has(desk.id)) {
      duplicateIds.add(desk.id);
    }
    ids.add(desk.id);

    // Validar coordenadas
    if (desk.x < 0 || desk.y < 0) {
      errors.push(`Desk ${desk.id}: Coordinates cannot be negative`);
    }

    // Validar dimensiones
    if (desk.width <= 0 || desk.height <= 0) {
      errors.push(`Desk ${desk.id}: Dimensions must be positive`);
    }

    // Advertencia si las coordenadas son muy grandes
    if (desk.x > 2000 || desk.y > 2000) {
      warnings.push(`Desk ${desk.id}: Coordinates are too large (x: ${desk.x}, y: ${desk.y})`);
    }

    // Advertencia si el escritorio es demasiado grande
    if (desk.width > 200 || desk.height > 200) {
      warnings.push(`Desk ${desk.id}: Dimensions are too large (${desk.width}x${desk.height})`);
    }

    // Advertencia si el escritorio es demasiado pequeño
    if (desk.width < 10 || desk.height < 10) {
      warnings.push(`Desk ${desk.id}: Dimensions are too small (${desk.width}x${desk.height})`);
    }
  });

  // Reportar IDs duplicados encontrados
  if (duplicateIds.size > 0) {
    errors.push(`Duplicate IDs found: ${Array.from(duplicateIds).join(', ')}`);
  }

  // Buscar posibles superposiciones entre escritorios
  const overlaps = findOverlaps(desks);

  if (overlaps.length > 0) {
    overlaps.forEach(overlap => {
      warnings.push(`Possible overlap between ${overlap.desk1} and ${overlap.desk2}`);
    });
  }

  // Retornar resultado final
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}


/**
 * Detecta superposición entre escritorios
 * Compara cada escritorio con todos los demás
 */
function findOverlaps(desks: Desk[]): Array<{ desk1: string; desk2: string }> {

  const overlaps: Array<{ desk1: string; desk2: string }> = [];

  // Comparar cada escritorio con los siguientes
  for (let i = 0; i < desks.length; i++) {
    for (let j = i + 1; j < desks.length; j++) {

      const desk1 = desks[i];
      const desk2 = desks[j];

      // Algoritmo de detección de colisión entre rectángulos
      const overlap = !(
        desk1.x + desk1.width <= desk2.x ||
        desk2.x + desk2.width <= desk1.x ||
        desk1.y + desk1.height <= desk2.y ||
        desk2.y + desk2.height <= desk1.y
      );

      if (overlap) {
        overlaps.push({
          desk1: desk1.id,
          desk2: desk2.id,
        });
      }
    }
  }

  return overlaps;
}


/**
 * Limpia y normaliza un conjunto de escritorios
 * - Elimina duplicados
 * - Elimina escritorios inválidos
 * - Normaliza IDs y tipos
 */
export function sanitizeDesks(desks: Desk[]): Desk[] {

  const seenIds = new Set<string>();
  const sanitized: Desk[] = [];

  desks.forEach(desk => {

    // Si el ID ya existe se ignora
    if (seenIds.has(desk.id)) {
      return;
    }

    // Si el escritorio tiene datos inválidos se descarta
    if (!desk.id || desk.width <= 0 || desk.height <= 0 || desk.x < 0 || desk.y < 0) {
      return;
    }

    // Registrar ID válido
    seenIds.add(desk.id);

    // Agregar escritorio limpio
    sanitized.push({
      ...desk,
      id: desk.id.trim(), // eliminar espacios en ID
      type: desk.type || 'regular', // asignar tipo por defecto
    });
  });

  return sanitized;
}