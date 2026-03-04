import { useState, useRef } from 'react';
import { 
  OfficeMapHeader, 
  StatsCards, 
  MapLegend, 
  MapSidebar, 
  MapCanvas, 
  TipBox 
} from '../components/OfficeMap';

export default function OfficeMap() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [search, setSearch] = useState('');
  const [desks, setDesks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'objects'>('inventory');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);

  const CANVAS_WIDTH = 2400;
  const CANVAS_HEIGHT = 5000;

  // 1. SE AGREGÓ EL OBJETO 'FRAME' AQUÍ
  const [defaultObjects] = useState([
    { id: 'GRAY-ZONE', type: 'zone', width: 600, height: 400, placed: false },
    { id: 'FRAME-OBJECT', type: 'frame', width: 300, height: 600, placed: false },
    { id: 'STORE-AREA', type: 'store', width: 200, height: 100, placed: false },
    { id: 'MANAGEMENT', type: 'management', width: 180, height: 80, placed: false },
    { id: 'ENTRANCE', type: 'entrance', width: 150, height: 60, placed: false },
  ]);

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
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (data.isDefault) {
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
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
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

  const bgLayers = desks.filter(d => d.placed && (d.type === 'zone' || d.type === 'frame'));
  const items = desks.filter(d => d.placed && d.type !== 'zone' && d.type !== 'frame');
  const inventory = desks.filter(d => !d.placed && d.id.toLowerCase().includes(search.toLowerCase()));

  // Handler para el mouse up global
  const handleMouseUp = () => {
    setDraggingId(null);
    setResizingId(null);
  };

  // Handler para iniciar drag desde el canvas
  const handleCanvasMouseDown = (id: string) => {
    setDraggingId(id);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen select-none"
         onMouseUp={handleMouseUp}>

      {/* Header */}
      <OfficeMapHeader />

      {/* 📊 Statistics */}
      <StatsCards 
        totalDesks={totalDesks} 
        reports={reports} 
        noIssues={noIssues} 
      />

      {/* 🎨 Leyenda del Mapa */}
      <MapLegend />

      {/* Layout */}
      <div className="flex gap-6 h-[700px]">

        {/* Sidebar */}
        <MapSidebar
          search={search}
          setSearch={setSearch}
          inventory={inventory}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRotateItem={rotateItem}
          onFileUpload={handleFileUpload}
        />

        {/* Canvas */}
        <MapCanvas
          items={items}
          inventory={inventory}
          CANVAS_WIDTH={CANVAS_WIDTH}
          CANVAS_HEIGHT={CANVAS_HEIGHT}
          onDrop={handleSvgDrop}
          onMouseMove={handleMouseMove}
          onMouseDown={handleCanvasMouseDown}
        />
      </div>

      {/* Tip */}
      <TipBox />

    </div>
  );
}

