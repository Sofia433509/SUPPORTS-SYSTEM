import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { User, MoreVertical, Plus, Edit2, Eye, Home } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface MapLegendProps {
  onModeChange?: (mode: 'add' | 'edit' | 'view') => void;
  onBackToMenu?: () => void;
}

export default function MapLegend({ onModeChange, onBackToMenu }: MapLegendProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Estados para los modales
  const [addMapModal, setAddMapModal] = useState(false);
  const [editMapModal, setEditMapModal] = useState(false);
  const [viewMapModal, setViewMapModal] = useState(false);

  // Estados para agregar mapa
  const [addSeat, setAddSeat] = useState('');
  const [addFloor, setAddFloor] = useState('');

  // Estados para editar mapa
  const [editSeat, setEditSeat] = useState('');
  const [editFloor, setEditFloor] = useState('');

  // Estados para ver mapa
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedSeat, setSelectedSeat] = useState('');

  // Example data
  const floors = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'];
  const seats = ['Main Headquarters', 'South Headquarters', 'North Headquarters'];

  // Cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !(menuRef.current as HTMLElement).contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Funciones del menú
  const handleAddMap = () => {
    setAddMapModal(true);
    setIsOpen(false);
  };

  const handleEditMap = () => {
    setEditMapModal(true);
    setIsOpen(false);
  };

  const handleViewMap = () => {
    setViewMapModal(true);
    setIsOpen(false);
  };

  const handleConfirmAddMap = () => {
    console.log('Map added:', { addSeat, addFloor });
    setAddMapModal(false);
    setAddSeat('');
    setAddFloor('');
    if (onModeChange) onModeChange('add');
  };

  const handleConfirmEditMap = () => {
    console.log('Map edited:', { editSeat, editFloor });
    setEditMapModal(false);
    setEditSeat('');
    setEditFloor('');
    if (onModeChange) onModeChange('edit');
  };

  const handleConfirmViewMap = () => {
    console.log('View map:', { selectedFloor, selectedSeat });
    setViewMapModal(false);
    if (onModeChange) onModeChange('view');
  };

  return (
    <>
      <Card className="relative overflow-visible z-40 shadow-md border border-gray-200">
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

          {/* --- MENÚ DESPLEGABLE MEJORADO --- */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2" ref={menuRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-full transition-all duration-300 ${
                isOpen 
                  ? 'bg-blue-600 text-white shadow-lg scale-110' 
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
              }`}
              title="Options menu"
            >
              <MoreVertical size={24} strokeWidth={2} />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-[9999] py-2 border border-gray-200 overflow-hidden">
                <button 
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 gap-3 transition-colors duration-150"
                  onClick={handleAddMap}
                >
                  <Plus size={18} className="text-blue-500 flex-shrink-0" /> 
                  <span>Add Map</span>
                </button>
                
                <button 
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-green-50 gap-3 transition-colors duration-150"
                  onClick={handleEditMap}
                >
                  <Edit2 size={18} className="text-green-500 flex-shrink-0" /> 
                  <span>Edit Map</span>
                </button>

                <button 
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 gap-3 transition-colors duration-150"
                  onClick={handleViewMap}
                >
                  <Eye size={18} className="text-purple-500 flex-shrink-0" /> 
                  <span>View Map</span>
                </button>

                <div className="border-t border-gray-200 my-1"></div>

                <button 
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 gap-3 transition-colors duration-150"
                  onClick={() => {
                    setIsOpen(false);
                    onBackToMenu?.();
                  }}
                >
                  <Home size={18} className="text-red-500 flex-shrink-0" /> 
                  <span>Back to Menu</span>
                </button>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* MODAL: AGREGAR MAPA */}
      <Dialog open={addMapModal} onOpenChange={setAddMapModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Map</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="addSeat">Select Headquarters</Label>
              <select 
                id="addSeat"
                value={addSeat}
                onChange={(e) => setAddSeat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select a headquarters --</option>
                {seats.map((seat) => (
                  <option key={seat} value={seat}>{seat}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="addFloor">Select Floor</Label>
              <select 
                id="addFloor"
                value={addFloor}
                onChange={(e) => setAddFloor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select a floor --</option>
                {floors.map((floor) => (
                  <option key={floor} value={floor}>{floor}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMapModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAddMap}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: EDITAR MAPA */}
      <Dialog open={editMapModal} onOpenChange={setEditMapModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Map</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editSeat">Select Headquarters</Label>
              <select 
                id="editSeat"
                value={editSeat}
                onChange={(e) => setEditSeat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select a headquarters --</option>
                {seats.map((seat) => (
                  <option key={seat} value={seat}>{seat}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editFloor">Select Floor</Label>
              <select 
                id="editFloor"
                value={editFloor}
                onChange={(e) => setEditFloor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select a floor --</option>
                {floors.map((floor) => (
                  <option key={floor} value={floor}>{floor}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMapModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmEditMap}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: VER MAPA */}
      <Dialog open={viewMapModal} onOpenChange={setViewMapModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>View Map</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="selectFloor">Select Floor</Label>
              <select 
                id="selectFloor"
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select a floor --</option>
                {floors.map((floor) => (
                  <option key={floor} value={floor}>{floor}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="selectSeat">Select Headquarters</Label>
              <select 
                id="selectSeat"
                value={selectedSeat}
                onChange={(e) => setSelectedSeat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select a headquarters --</option>
                {seats.map((seat) => (
                  <option key={seat} value={seat}>{seat}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewMapModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmViewMap}>
              View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}