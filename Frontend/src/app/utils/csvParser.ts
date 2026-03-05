import { Desk } from '../types/desk';

/**
Convierte un array de escritorios (Desk[]) a formato CSV
Esto permite exportar el layout de la oficina a un archivo que puede abrirse en Excel o similar.
 */
export function desksToCSV(desks: Desk[]): string {

  // Definimos las columnas del archivo CSV
  const headers = ['id', 'x', 'y', 'width', 'height', 'type'];

  // Convertimos cada escritorio en una fila de texto
  const rows = desks.map(desk => [
    desk.id,
    desk.x.toString(),
    desk.y.toString(),
    desk.width.toString(),
    desk.height.toString(),
    desk.type || 'regular' // Si no tiene tipo se usa "regular"
  ]);

  // Construimos el contenido final del CSV
  const csvContent = [
    headers.join(','), // Primera fila: encabezados
    ...rows.map(row => row.join(',')) // Filas con datos
  ].join('\n');

  return csvContent;
}


/**
Parsea el contenido de un CSV y lo convierte en un array de escritorios
Esto se usa para importar un layout desde un archivo CSV.
 */
export function parseCSVToDesks(csvContent: string): Desk[] {

  // Separar el archivo por líneas
  const lines = csvContent.trim().split('\n');
  
  // Validar que el archivo tenga al menos headers y una fila de datos
  if (lines.length < 2) {
    throw new Error('The CSV file is empty or has no data');
  }

  // Obtener y normalizar los encabezados
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

  // Columnas obligatorias
  const requiredHeaders = ['id', 'x', 'y', 'width', 'height'];
  
  // Verificar si falta alguna columna obligatoria
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  // Arreglo donde se guardarán los escritorios parseados
  const desks: Desk[] = [];
  
  // Iterar sobre cada línea de datos (saltando el header)
  for (let i = 1; i < lines.length; i++) {

    const line = lines[i].trim();

    // Ignorar líneas vacías
    if (!line) continue;

    // Separar valores por coma
    const values = line.split(',').map(v => v.trim());
    
    // Validar que la fila tenga suficientes columnas
    if (values.length < 5) {
      throw new Error(`Line ${i + 1}: Incomplete data`);
    }

    // Desestructurar valores
    const [id, xStr, yStr, widthStr, heightStr, typeStr] = values;

    // Convertir coordenadas y dimensiones a números
    const x = parseFloat(xStr);
    const y = parseFloat(yStr);
    const width = parseFloat(widthStr);
    const height = parseFloat(heightStr);

    // Validar que los valores numéricos sean válidos
    if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
      throw new Error(`Line ${i + 1}: Coordinates must be valid numbers`);
    }

    // Crear objeto Desk
    const desk: Desk = {
      id,
      x,
      y,
      width,
      height,
    };

    // Si se proporciona un tipo de escritorio, validarlo
    if (typeStr) {
      const validTypes = ['management', 'store', 'regular', 'empty', 'entrance'];

      // Solo se asigna si el tipo es válido
      if (validTypes.includes(typeStr.toLowerCase())) {
        desk.type = typeStr.toLowerCase() as Desk['type'];
      }
    }

    // Agregar el escritorio al array
    desks.push(desk);
  }

  return desks;
}


/**
 Descarga un archivo CSV en el navegador
 Se utiliza después de generar el CSV con desksToCSV()
 */
export function downloadCSV(
  csvContent: string,
  filename: string = 'office-layout.csv'
) {

  // Crear un objeto Blob con el contenido CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Crear un enlace temporal para descargar el archivo
  const link = document.createElement('a');

  // Crear URL temporal del archivo
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);

  // Ocultar el enlace
  link.style.visibility = 'hidden';
  
  // Insertar enlace en el DOM
  document.body.appendChild(link);

  // Simular clic para iniciar descarga
  link.click();

  // Eliminar el enlace del DOM
  document.body.removeChild(link);
  
  // Liberar memoria eliminando la URL creada
  URL.revokeObjectURL(url);
}


/**
 * Lee un archivo (por ejemplo CSV subido por el usuario)
 * y devuelve su contenido como texto
 */
export function readFileAsText(file: File): Promise<string> {

  return new Promise((resolve, reject) => {

    // Crear lector de archivos
    const reader = new FileReader();
    
    // Evento que se dispara cuando el archivo se carga correctamente
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('The file could not be read'));
      }
    };
    
    // Manejo de error al leer el archivo
    reader.onerror = () => {
      reject(new Error('Error reading the file'));
    };
    
    // Leer el archivo como texto
    reader.readAsText(file);
  });
}