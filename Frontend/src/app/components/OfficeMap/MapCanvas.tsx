/**
 * Componente: MapCanvas
 * 
 * Descripción:
 * Este componente representa el área principal (canvas) del mapa de oficinas donde
 * se visualizan y manipulan los escritorios y objetos. Utiliza SVG para renderizar
 * los elementos con una cuadrícula de fondo y permite operaciones de drag-and-drop.
 * 
 * Funcionalidades:
 * - Renderizado de una cuadrícula de fondo (dot grid) usando SVG pattern
 * - Visualización de elementos placed (escritorios) como rectángulos coloreados
 * - Sistema de badges para mostrar contadores de elementos
 * - Manejo de eventos de arrastre (drop) desde el sidebar
 * - Movimiento del mouse para detectar posición en el canvas
 * - Colores diferenciados según estado del elemento (verde=ok, rojo=con reportes)
 * 
 * Props:
 * - items: Array de elementos que están placed en el mapa
 * - inventory: Array de elementos pendientes (sin colocar)
 * - CANVAS_WIDTH: Ancho del área SVG en píxeles
 * - CANVAS_HEIGHT: Alto del área SVG en píxeles
 * - onDrop: Función callback cuando se suelta un elemento arrastrado
 * - onMouseMove: Función callback cuando se mueve el mouse sobre el canvas
 * - onMouseDown: Función callback cuando se hace clic en un elemento del mapa
 * 
 * Dependencias:
 * - react: useRef para referencias al elemento SVG
 * - ../ui/card: Componentes Card y CardContent
 * - ../ui/badge: Componente Badge para indicadores
 */

import { useRef } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

/**
 * Interfaz que define la estructura de un elemento (escritorio u objeto)
 * Representa cada item que puede ser放置 (colocado) en el mapa
 */
interface DeskItem {
  /** Identificador único del elemento */
  id: string;
  /** Posición X del elemento en el canvas */
  x: number;
  /** Posición Y del elemento en el canvas */
  y: number;
  /** Ancho del elemento en píxeles */
  width: number;
  /** Alto del elemento en píxeles */
  height: number;
  /** Tipo de elemento ('desk', 'zone', 'frame', etc.) */
  type: string;
  /** Indica si el elemento está colocado en el mapa */
  placed: boolean;
  /** Indica si el elemento tiene reportes activos (opcional) */
  hasReport?: boolean;
}

/**
 * Interfaz de props para el componente MapCanvas
 * Define todos los parámetros que el componente padre debe proporcionar
 */
interface MapCanvasProps {
  /** Array de elementos que ya están colocados en el mapa */
  items: DeskItem[];
  /** Array de elementos pendientes (sin colocar) */
  inventory: DeskItem[];
  /** Ancho del canvas SVG en píxeles */
  CANVAS_WIDTH: number;
  /** Alto del canvas SVG en píxeles */
  CANVAS_HEIGHT: number;
  /** Callback ejecutado cuando se suelta un elemento arrastrado sobre el canvas */
  onDrop: (e: React.DragEvent) => void;
  /** Callback ejecutado cuando el mouse se mueve sobre el canvas */
  onMouseMove: (e: React.MouseEvent) => void;
  /** Callback ejecutado cuando se hace clic en un elemento del mapa */
  onMouseDown: (id: string) => void;
}

/**
 * Componente funcional que renderiza el canvas del mapa de oficinas
 * Utiliza SVG para dibujar la cuadrícula y los elementos placed
 * 
 * @param props - Propiedades del componente conteniendo datos y handlers
 * @returns JSX.Element - Componente canvas con elementos SVG
 */
export default function MapCanvas({
  items,
  inventory,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  onDrop,
  onMouseMove,
  onMouseDown,
}: MapCanvasProps) {
  // Referencia al elemento SVG para obtener dimensiones y posiciones
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    // Contenedor principal: Card que ocupa el espacio restante (flex-1)
    <Card className="flex-1 relative overflow-hidden bg-white shadow-inner">
      
      {/* Badges superiores derechos: contadores de elementos */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {/* Badge verde: elementos ubicados/colocados */}
        <Badge className="bg-green-600 text-white border-none">
          {items.length} Located
        </Badge>
        {/* Badge outline: elementos pendientes */}
        <Badge variant="outline">
          {inventory.length} Pending
        </Badge>
      </div>

      {/* Área del canvas: maneja eventos de drop y mouse */}
      <div
        className="w-full h-full"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()} // Necesario para permitir drop
        onMouseMove={onMouseMove}
      >
        {/* Elemento SVG principal del canvas */}
        <svg ref={svgRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
          
          {/* Definiciones SVG: patrones y filtros */}
          <defs>
            {/* Patrón de cuadrícula de puntos */}
            <pattern id="dotGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#CBD5E1" />
            </pattern>
          </defs>
          
          {/* Rectángulo de fondo con patrón de cuadrícula */}
          <rect width="100%" height="100%" fill="url(#dotGrid)" />

          {/* Renderizado de cada elemento placed en el mapa */}
          {items.map(item => (
            // Grupo SVG para cada elemento
            <g key={item.id} transform={`translate(${item.x}, ${item.y})`}>
              {/* Rectángulo del elemento: verde si OK, rojo si tiene reportes */}
              <rect
                width={item.width}
                height={item.height}
                fill={item.hasReport ? "#EF4444" : "#22C55E"} // Rojo: tiene reportes, Verde: OK
                rx={6} // Bordes redondeados
                onMouseDown={() => onMouseDown(item.id)} // Iniciar arrastre
                className="cursor-move" // Cursor de movimiento
              />
              {/* Texto con el ID del elemento centrado */}
              <text
                x={item.width / 2}
                y={item.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                className="text-[10px] font-bold pointer-events-none"
              >
                {item.id}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </Card>
  );
}

