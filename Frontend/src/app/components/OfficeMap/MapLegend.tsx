import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { User, MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';

export default function MapLegend() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Card className="relative overflow-visible">
      <CardContent className="flex flex-wrap items-center gap-6 py-4 pr-12">
        
        {/* Indicadores existentes */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 border border-gray-300 rounded shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">No issues</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 border border-gray-300 rounded shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">With active reports</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 border border-gray-300 rounded shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Management / Store area</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 border border-gray-300 rounded shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Entrance area</span>
        </div>
        
        <div className="flex items-center gap-2 border-l pl-4">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-500">Click on any desk to view details</span>
        </div>

        {/* --- MENÚ DESPLEGABLE MANUAL --- */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2" ref={menuRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <MoreVertical size={20} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
              <button 
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 gap-2"
                onClick={() => { console.log("Ver"); setIsOpen(false); }}
              >
                <Eye size={16} className="text-gray-400" /> Ver detalles
              </button>
              
              <button 
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 gap-2"
                onClick={() => { console.log("Editar"); setIsOpen(false); }}
              >
                <Pencil size={16} className="text-gray-400" /> Editar
              </button>

              <div className="border-t border-gray-100 my-1"></div>
              
              <button 
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 gap-2"
                onClick={() => { console.log("Eliminar"); setIsOpen(false); }}
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}