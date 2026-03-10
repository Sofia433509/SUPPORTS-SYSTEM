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

import { useState, useRef, useEffect } from 'react';
import { 
  OfficeMapHeader, 
  StatsCards, 
  MapLegend, 
  MapSidebar, 
  MapCanvas, 
  TipBox 
} from '../components/OfficeMap';
import { toast } from 'sonner'; // Importamos toast para las notificaciones
import { apiService } from '../utils/api';

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

  const [search, setSearch] = useState('');
  // Inicializar desks con los objetos por defecto en el inventario
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [desks, setDesks] = useState<any[]>(defaultObjects);
  const [activeTab, setActiveTab] = useState<'inventory' | 'objects'>('inventory');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'select' | 'add' | 'edit' | 'view'>('select');
  const [mapHeadquarters, setMapHeadquarters] = useState('');
  const [mapFloor, setMapFloor] = useState('');
  const [isExistingMap, setIsExistingMap] = useState(false);
  const [scale, setScale] = useState(1);
  
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 2;

  const CANVAS_WIDTH = 2400;
  const CANVAS_HEIGHT = 5000;

  // 📊 Stats
  const totalDesks = desks.filter(d => d.type === 'desk').length;
  const reports = desks.filter(d => d.hasReport).length;
  const noIssues = desks.filter(d => d.type === 'desk' && !d.hasReport).length;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (activeMode === 'view') return; // No permitir cargar CSV en modo ver
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').slice(1);

      const parsed = rows.map((row, index) => {
        const [id, x, y, width, height, type] = row.split(',');
        const cleanId = id?.trim() || `D-${100 + index}`;
        return {
          id: cleanId,
          name: cleanId,
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
      
      // Notificación de éxito al importar CSV
      toast.success('CSV imported correctly', {
        description: `${parsed.length} desks have been imported`,
        duration: 5000,
      });
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Función para rotar un elemento (intercambia width por height)
  const rotateItem = (id: string) => {
    setDesks(prev => 
      prev.map(d => d.id === id ? { ...d, width: d.height, height: d.width } : d)
    );
    // Notificación de éxito al rotar
    toast.success('Element rotated', {
      description: 'The element has been rotated 90 degrees',
      duration: 3000,
    });
  };

  const handleSvgDrop = (e: React.DragEvent) => {
    if (activeMode === 'view') return; // No permitir agregar objetos en modo ver
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
        name: data.name || data.id,
        x: x - data.width / 2,
        y: y - data.height / 2,
        placed: true
      };
      setDesks(prev => [...prev, newObj]);
      // Notificación de éxito al agregar elemento
      toast.success('Element added', {
        description: `The element ${newObj.name} has been added to the map`,
        duration: 3000,
      });
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
    if (activeMode === 'view') return; // No permitir mover en modo solo lectura

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
    if (activeMode === 'view') return; // No permitir mover en modo solo lectura
    setDraggingId(id);
  };

  // Handler para iniciar el redimensionamiento
  const handleResizeStart = (id: string) => {
    setResizingId(id);
  };

  // Handler para cambiar el modo activo
  const handleModeChange = (mode: 'add' | 'edit' | 'view') => {
    setActiveMode(mode);
  };

  // Asegurar que no haya dragging/redimensionando si estamos en modo view
  useEffect(() => {
    if (activeMode === 'view') {
      setDraggingId(null);
      setResizingId(null);
    }
  }, [activeMode]);

  // Handler para volver al menú inicial
  const handleBackToMenu = () => {
    setActiveMode('select');
    setScale(1); // Resetear zoom al volver al menú
  };

  // Handlers para zoom
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, MAX_SCALE));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, MIN_SCALE));

  // Handler para eliminar un elemento placed y devolverlo al inventory
  const handleDeleteItem = (id: string) => {
    if (activeMode === 'view') return; // No permitir borrar en modo ver

    setDesks(prev =>
      prev.map(d =>
        d.id === id
          ? { ...d, x: null, y: null, placed: false }
          : d
      )
    );
  };

  // Guardar mapa (crea registros de headquarters/floor si no existen)
  const handleSaveMap = async (headquarters: string, floor: string) => {
    try {
      await apiService.saveMap({
        headquarters,
        floor,
        objects: desks.map((d) => ({
          type: d.type,
          name: d.name || d.id,
          x: d.x,
          y: d.y,
          width: d.width,
          height: d.height,
          placed: d.placed,
          isDefault: d.isDefault || false,
        })),
      });

      // Asegurar que el canvas muestre el nombre del desk (no el id)
      setDesks((prev) =>
        prev.map((d) => ({
          ...d,
          name: d.name || d.id,
        }))
      );

      toast.success('Mapa guardado correctamente');
      setActiveMode('edit');
      setIsExistingMap(true);
    } catch (error) {
      console.error('Error guardando mapa:', error);
      toast.error('No se pudo guardar el mapa. Revisa la consola.');
      throw error;
    }
  };

  // Cargar mapa existente desde la DB para editarlo
  const handleLoadMap = async (headquarters: string, floor: string) => {
    try {
      const resp = await apiService.viewMap(headquarters, floor);
      setDesks(
        resp.objects.map((d) => ({
          ...d,
          id: d.id?.toString() ?? `${d.type}-${Date.now()}`,
          name: d.name || d.id?.toString() || `${d.type}-${Date.now()}`,
        }))
      );
      setActiveMode('edit');
      setIsExistingMap(true);
      toast.success('Mapa cargado para editar');
    } catch (error) {
      console.error('Error cargando mapa:', error);
      toast.error('No se pudo cargar el mapa. Revisa la consola.');
      throw error;
    }
  };

  // Editar mapa (reemplaza los objetos para ese floor)
  const handleEditMap = async (headquarters: string, floor: string) => {
    try {
      await apiService.editMap({
        headquarters,
        floor,
        objects: desks.map((d) => ({
          type: d.type,
          name: d.name || d.id,
          x: d.x,
          y: d.y,
          width: d.width,
          height: d.height,
          placed: d.placed,
          isDefault: d.isDefault || false,
        })),
      });
      toast.success('Mapa actualizado correctamente');
      setActiveMode('edit');
      setIsExistingMap(true);
    } catch (error) {
      console.error('Error editando mapa:', error);
      toast.error('No se pudo actualizar el mapa. Revisa la consola.');
      throw error;
    }
  };

  // Si el modo es 'view', mostrar solo el canvas sin sidebars
  if (activeMode === 'view') {
    return (
      <div className="space-y-4 p-6 bg-gray-50 min-h-screen select-none flex flex-col"
           onMouseUp={handleMouseUp}>

        {/* Header simple */}
        <OfficeMapHeader />

        {/* Leyenda */}
        <MapLegend
          activeMode={activeMode}
          onModeChange={handleModeChange}
          onBackToMenu={handleBackToMenu}
          onSaveMap={handleSaveMap}
          onEditMap={handleEditMap}
          onLoadMap={handleLoadMap}
          currentHeadquarters={mapHeadquarters}
          currentFloor={mapFloor}
          setCurrentHeadquarters={setMapHeadquarters}
          setCurrentFloor={setMapFloor}
          isExistingMap={isExistingMap}
        />

        {/* Canvas a pantalla completa */}
        <div className="flex-1 flex gap-6 relative">
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
            onDeleteItem={handleDeleteItem}
            scale={scale}
            readOnly={true}
          />

          {/* Botones de zoom en la esquina inferior derecha */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
            <button
              type="button"
              className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-blue-700 transition font-semibold text-lg"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              title="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-blue-700 transition font-semibold text-lg"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              title="Zoom out"
            >
              −
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si el modo es 'add' o 'edit', mostrar interfaz completa de mapeo
  if (activeMode === 'add' || activeMode === 'edit') {
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
        <MapLegend
          activeMode={activeMode}
          onModeChange={handleModeChange}
          onBackToMenu={handleBackToMenu}
          onSaveMap={handleSaveMap}
          onEditMap={handleEditMap}
          onLoadMap={handleLoadMap}
          currentHeadquarters={mapHeadquarters}
          currentFloor={mapFloor}
          setCurrentHeadquarters={setMapHeadquarters}
          setCurrentFloor={setMapFloor}
          isExistingMap={isExistingMap}
        />

        {/* Layout */}
        <div className="flex gap-6 h-[700px] relative">

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
            onDeleteItem={handleDeleteItem}
            scale={scale}
          />

          {/* Botones de zoom en la esquina inferior derecha */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
            <button
              type="button"
              className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-blue-700 transition font-semibold text-lg"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              title="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-blue-700 transition font-semibold text-lg"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              title="Zoom out"
            >
              −
            </button>
          </div>
        </div>

        {/* Tip */}
        <TipBox />

      </div>
    );
  }

  // Si el modo es 'select', mostrar solo el menú de opciones y el canvas en blanco
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6 space-y-6">
      <OfficeMapHeader />
      <MapLegend
        activeMode={activeMode}
        onModeChange={handleModeChange}
        onBackToMenu={handleBackToMenu}
        onSaveMap={handleSaveMap}
        onEditMap={handleEditMap}
        onLoadMap={handleLoadMap}
        currentHeadquarters={mapHeadquarters}
        currentFloor={mapFloor}
        setCurrentHeadquarters={setMapHeadquarters}
        setCurrentFloor={setMapFloor}
        isExistingMap={isExistingMap}
      />
      
      {/* Canvas vacío para visualizar el espacio de mapeo */}
      <div className="flex-1 bg-white rounded-lg border-2 border-dashed border-gray-300 shadow-sm flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg font-medium">Select an option from the menu to begin</p>
        </div>
      </div>
    </div>
  );
}

