/**
 * Página: OfficeMap
 * 
 * Descripción:
 * Este es el componente principal de la página del mapa de oficinas (Office Map).
 * Actúa como contenedor que orquesta todos los subcomponentes y gestiona el estado
 * global de la aplicación de mapas de escritorios.
 * 
 * Esta página permite:
 * - Visualizar un mapa interactivo de la oficina con escritorios
 * - Arrastrar y soltar (drag-and-drop) escritorios desde el sidebar al mapa
 * - Importar datos de escritorios desde archivos CSV
 * - Buscar y filtrar elementos en el inventario
 * - Rotar y posicionar elementos en el canvas
 * - Ver estadísticas en tiempo real sobre los escritorios
 * 
 * Estructura de componentes:
 * 1. OfficeMapHeader - Encabezado con título y navegación
 * 2. StatsCards - Tarjetas de estadísticas (total, con reportes, sin problemas)
 * 3. MapLegend - Leyenda de colores del mapa
 * 4. MapSidebar - Panel lateral con inventario y herramientas
 * 5. MapCanvas - Área principal del mapa con elementos SVG
 * 6. TipBox - Caja de consejos para el usuario
 * 
 * Estados (State Management):
 * - search: Valor del campo de búsqueda
 * - desks: Array de todos los escritorios/objetos
 * - activeTab: Pestaña activa en el sidebar (inventory/objects)
 * - draggingId: ID del elemento actualmente siendo arrastrado
 * - resizingId: ID del elemento actualmente siendo redimensionado
 * 
 * Handlers:
 * - handleFileUpload: Procesa archivos CSV subidos por el usuario
 * - rotateItem: Rota un elemento intercambiando width y height
 * - handleSvgDrop: Maneja el evento de soltar un elemento en el canvas
 * - handleMouseMove: Maneja el movimiento del mouse para arrastrar/redimensionar
 * - handleMouseUp: Finaliza las operaciones de arrastre/redimensionado
 * - handleCanvasMouseDown: Inicia el arrastre de un elemento en el mapa
 * 
 * Constantes:
 * - CANVAS_WIDTH: Ancho del área del mapa (2400px)
 * - CANVAS_HEIGHT: Alto del área del mapa (5000px)
 * - defaultObjects: Objetos por defecto disponibles para agregar al mapa
 * 
 * Dependencias:
 * - react: use_state, useRef para gestión de estado
 * - ../components/OfficeMap: Subcomponentes del mapa de oficinas
 */

import { useState, useRef } from 'react';
import { 
  OfficeMapHeader, 
  StatsCards, 
  MapLegend, 
  MapSidebar, 
  MapCanvas, 
  TipBox 
} from '../components/OfficeMap';

// Objetos por defecto disponibles para agregar al mapa
// Incluye zonas, marcos, áreas de tienda, gestión y entrada
const defaultObjects = [
  { id: 'GRAY-ZONE', type: 'zone', width: 600, height: 400, placed: false, isDefault: true },
  { id: 'FRAME-OBJECT', type: 'frame', width: 300, height: 600, placed: false, isDefault: true },
  { id: 'STORE-AREA', type: 'store', width: 200, height: 100, placed: false, isDefault: true },
  { id: 'MANAGEMENT', type: 'management', width: 180, height: 80, placed: false, isDefault: true },
  { id: 'ENTRANCE', type: 'entrance', width: 150, height: 60, placed: false, isDefault: true },
];

export default function OfficeMap() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [search, setSearch] = useState('');
  // Inicializar desks con los objetos por defecto en el inventario
  const [desks, setDesks] = useState<any[]>(defaultObjects);
  const [activeTab, setActiveTab] = useState<'inventory' | 'objects'>('inventory');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);

  const CANVAS_WIDTH = 2400;
  const CANVAS_HEIGHT = 5000;

  // 📊 Stats
  const totalDesks = desks.filter(d => d.type === 'desk').length;
  const reports = desks.filter(d => d.hasReport).length;
  const noIssues = desks.filter(d => d.type === 'desk' && !d.hasReport).length;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').slice(1);

      const parsed = rows.map((row, index) => {
        const [id, x, y, width, height, type] = row.split(',');
        return {
          id: id?.trim() || `D-${100 + index}`,
          x: x && x.trim() !== "" ? Number(x) : null,
          y: y && y.trim() !== "" ? Number(y) : null,
          width: Number(width) || 80,
          height: Number(height) || 50,
          type: type?.trim() || 'desk',
          placed: !!(x && x.trim() !== ""),
          hasReport: Math.random() > 0.9
        };
      });

      setDesks(prev => [...prev, ...parsed]);
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const rotateItem = (id: string) => {
    setDesks(prev => 
      prev.map(d => d.id === id ? { ...d, width: d.height, height: d.width } : d)
    );
  };

  const handleSvgDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("objectData"));
    // svgRef ya no se usa - usamos e.currentTarget

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (data.isDefault) {
      // Es un objeto por defecto: crear nueva instancia
      const newObj = {
        ...data,
        id: `${data.id}-${Date.now()}`,
        x: x - data.width / 2,
        y: y - data.height / 2,
        placed: true
      };
      setDesks(prev => [...prev, newObj]);
    } else {
      setDesks(prev =>
        prev.map(d =>
          d.id === data.id
            ? { ...d, x: x - d.width / 2, y: y - d.height / 2, placed: true }
            : d
        )
      );
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // svgRef ya no se usa - usamos e.currentTarget
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (draggingId) {
      setDesks(prev =>
        prev.map(d =>
          d.id === draggingId
            ? { ...d, x: mouseX - d.width / 2, y: mouseY - d.height / 2 }
            : d
        )
      );
    }

    if (resizingId) {
      setDesks(prev =>
        prev.map(d =>
          d.id === resizingId
            ? {
                ...d,
                width: Math.max(40, mouseX - d.x),
                height: Math.max(40, mouseY - d.y)
              }
            : d
        )
      );
    }
  };

  // Capas de fondo: zonas, marcos y otros objetos placed en el mapa
  const bgLayers = desks.filter(d => d.placed && (d.type === 'zone' || d.type === 'frame' || d.type === 'store' || d.type === 'management' || d.type === 'entrance'));
  // Items: escritorios placed en el mapa
  const items = desks.filter(d => d.placed && d.type === 'desk');
  // Inventario: elementos no placed que coinciden con la búsqueda
  const inventory = desks.filter(d => !d.placed && d.type === 'desk' && d.id.toLowerCase().includes(search.toLowerCase()));
  // Objects: objetos no placed (zonas, frames, store, management, entrance)
  const objects = desks.filter(d => !d.placed && (d.type === 'zone' || d.type === 'frame' || d.type === 'store' || d.type === 'management' || d.type === 'entrance') && d.id.toLowerCase().includes(search.toLowerCase()));

  // Handler para el mouse up global
  const handleMouseUp = () => {
    setDraggingId(null);
    setResizingId(null);
  };

  // Handler para iniciar drag desde el canvas
  const handleCanvasMouseDown = (id: string) => {
    setDraggingId(id);
  };

  // Handler para iniciar el redimensionamiento
  const handleResizeStart = (id: string) => {
    setResizingId(id);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen select-none"
         onMouseUp={handleMouseUp}>

      {/* Header */}
      <OfficeMapHeader />

      {/*Statistics */}
      <StatsCards 
        totalDesks={totalDesks} 
        reports={reports} 
        noIssues={noIssues} 
      />

      {/* Leyenda del Mapa */}
      <MapLegend />

      {/* Layout */}
      <div className="flex gap-6 h-[700px]">

        {/* Sidebar */}
        <MapSidebar
          search={search}
          setSearch={setSearch}
          inventory={inventory}
          objects={objects}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRotateItem={rotateItem}
          onFileUpload={handleFileUpload}
        />

        {/* Canvas */}
        <MapCanvas
          items={items}
          bgLayers={bgLayers}
          inventory={inventory}
          CANVAS_WIDTH={CANVAS_WIDTH}
          CANVAS_HEIGHT={CANVAS_HEIGHT}
          onDrop={handleSvgDrop}
          onMouseMove={handleMouseMove}
          onMouseDown={handleCanvasMouseDown}
          onResizeStart={handleResizeStart}
        />
      </div>

      {/* Tip */}
      <TipBox />

    </div>
  );
}

