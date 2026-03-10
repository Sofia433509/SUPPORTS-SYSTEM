import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { User, MoreVertical, Plus, Edit2, Eye, Home } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { apiService } from '../../utils/api';

interface MapLegendProps {
  activeMode?: 'select' | 'add' | 'edit' | 'view';
  onModeChange?: (mode: 'add' | 'edit' | 'view') => void;
  onBackToMenu?: () => void;
  onSaveMap?: (headquarters: string, floor: string) => Promise<void>;
  onEditMap?: (headquarters: string, floor: string) => Promise<void>;
  onLoadMap?: (headquarters: string, floor: string) => Promise<void>;
  currentHeadquarters?: string;
  currentFloor?: string;
  setCurrentHeadquarters?: (value: string) => void;
  setCurrentFloor?: (value: string) => void;
  isExistingMap?: boolean;
}

export default function MapLegend({
  activeMode,
  onModeChange,
  onBackToMenu,
  onSaveMap,
  onEditMap,
  onLoadMap,
  currentHeadquarters,
  currentFloor,
  setCurrentHeadquarters,
  setCurrentFloor,
  isExistingMap,
}: MapLegendProps) {
  const isViewMode = activeMode === 'view';
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
  const [savedMaps, setSavedMaps] = useState<{ headquarters: string; floor: string }[]>([]);

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


  const handleConfirmViewMap = async () => {
    if (!selectedSeat || !selectedFloor) {
      toast.error('Selecciona sede y piso para ver el mapa');
      return;
    }

    setViewMapModal(false);
    if (onLoadMap) {
      await onLoadMap(selectedSeat, selectedFloor);
    }
    if (onModeChange) {
      onModeChange('view');
    }
  };

  const handleGlobalSave = async () => {
    if (!currentHeadquarters || !currentFloor) {
      toast.error('Selecciona sede y piso antes de guardar');
      return;
    }

    try {
      if (isExistingMap && onEditMap) {
        await onEditMap(currentHeadquarters, currentFloor);
      } else if (onSaveMap) {
        await onSaveMap(currentHeadquarters, currentFloor);
      }
      toast.success('Mapa guardado');
    } catch (err) {
      console.error('Error guardando mapa global:', err);
      toast.error('Error guardando mapa');
    }
  };

  // Estados para opciones dinámicas
  const [hqOptions, setHqOptions] = useState<string[]>([]);
  const [floorOptions, setFloorOptions] = useState<string[]>([]);

  // Cargar opciones de headquarters, floors y mapas guardados al iniciar (o al abrir el modal)
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const res = await apiService.getMapOptions();
        setHqOptions(res.headquarters);
        setFloorOptions(res.floors);
        setSavedMaps(res.savedMaps ?? []);
      } catch (err) {
        // Si ocurre error, usar valores de ejemplo locales como fallback
        setHqOptions(seats);
        setFloorOptions(floors);
        setSavedMaps([]);
      }
    };

    if (addMapModal || editMapModal || viewMapModal) {
      loadOptions();
    }
  }, [addMapModal, editMapModal, viewMapModal]);

  // Setear metadata actual (usar en el botón Guardar global)
  const setMetadataFromAdd = () => {
    setCurrentHeadquarters?.(addSeat);
    setCurrentFloor?.(addFloor);
  };

  const setMetadataFromEdit = () => {
    setCurrentHeadquarters?.(editSeat);
    setCurrentFloor?.(editFloor);
  };

  const handleSaveMap = async () => {
    if (!addSeat || !addFloor) {
      toast.error('Selecciona sede y piso');
      return;
    }

    if (!onSaveMap) {
      toast.error('Función de guardar no disponible');
      return;
    }

    setMetadataFromAdd();

    try {
      await onSaveMap(addSeat, addFloor);
      toast.success('Mapa guardado correctamente');
      setAddMapModal(false);
      setAddSeat('');
      setAddFloor('');
      if (onModeChange) onModeChange('add');
    } catch (err) {
      console.error('Error guardando mapa (frontend):', err);
      toast.error('Error guardando mapa');
    }
  };

  const handleLoadMapForEdit = async () => {
    if (!editSeat || !editFloor) {
      toast.error('Selecciona sede y piso');
      return;
    }

    if (!onLoadMap) {
      toast.error('Función de cargar no disponible');
      return;
    }

    setMetadataFromEdit();

    try {
      await onLoadMap(editSeat, editFloor);
      setEditMapModal(false);
      setEditSeat('');
      setEditFloor('');
      if (onModeChange) onModeChange('edit');
    } catch (err) {
      console.error('Error cargando mapa (frontend):', err);
      toast.error('Error cargando mapa');
    }
  };

  const handleSaveEditMap = async () => {
    if (!editSeat || !editFloor) {
      toast.error('Selecciona sede y piso');
      return;
    }

    if (!onEditMap) {
      toast.error('Función de guardar no disponible');
      return;
    }

    try {
      await onEditMap(editSeat, editFloor);
      setEditMapModal(false);
      setEditSeat('');
      setEditFloor('');
      if (onModeChange) onModeChange('edit');
    } catch (err) {
      console.error('Error guardando mapa (frontend):', err);
      toast.error('Error guardando mapa');
    }
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
          {!isViewMode && (
            <Button
              variant="secondary"
              className="ml-4"
              onClick={handleGlobalSave}
            >
              Guardar mapa
            </Button>
          )}

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
                {!isViewMode && (
                  <>
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
                  </>
                )}

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
              <input
                list="hq-options"
                id="addSeat"
                value={addSeat}
                onChange={(e) => {
                  setAddSeat(e.target.value);
                  setCurrentHeadquarters?.(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Select or type a headquarters"
              />
              <datalist id="hq-options">
                {hqOptions.map((seat) => (
                  <option key={seat} value={seat} />
                ))}
              </datalist>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="addFloor">Select Floor</Label>
              <input
                list="floor-options"
                id="addFloor"
                value={addFloor}
                onChange={(e) => {
                  setAddFloor(e.target.value);
                  setCurrentFloor?.(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Select or type a floor"
              />
              <datalist id="floor-options">
                {floorOptions.map((floor) => (
                  <option key={floor} value={floor} />
                ))}
              </datalist>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMapModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMap}>
              Guardar
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
            {savedMaps.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="editSavedMap">Select Saved Map</Label>
                <select
                  id="editSavedMap"
                  value={editSeat && editFloor ? `${editSeat}||${editFloor}` : ''}
                  onChange={async (e) => {
                    const [hq, fl] = e.target.value.split('||');
                    setEditSeat(hq);
                    setEditFloor(fl);
                    setCurrentHeadquarters?.(hq);
                    setCurrentFloor?.(fl);
                    if (onLoadMap) {
                      await onLoadMap(hq, fl);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select a saved map --</option>
                  {savedMaps.map((m) => (
                    <option key={`${m.headquarters}||${m.floor}`} value={`${m.headquarters}||${m.floor}`}>
                      {m.headquarters} - {m.floor}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="editSeat">Select Headquarters</Label>
              <input
                list="hq-options"
                id="editSeat"
                value={editSeat}
                onChange={(e) => {
                  setEditSeat(e.target.value);
                  setCurrentHeadquarters?.(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Select or type a headquarters"
              />
              <datalist id="hq-options">
                {hqOptions.map((seat) => (
                  <option key={seat} value={seat} />
                ))}
              </datalist>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editFloor">Select Floor</Label>
              <input
                list="floor-options"
                id="editFloor"
                value={editFloor}
                onChange={(e) => {
                  setEditFloor(e.target.value);
                  setCurrentFloor?.(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Select or type a floor"
              />
              <datalist id="floor-options">
                {floorOptions.map((floor) => (
                  <option key={floor} value={floor} />
                ))}
              </datalist>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMapModal(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleLoadMapForEdit}>
              Cargar
            </Button>
            <Button onClick={handleSaveEditMap}>
              Guardar
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
            {savedMaps.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="viewSavedMap">Select Saved Map</Label>
                <select
                  id="viewSavedMap"
                  value={selectedSeat && selectedFloor ? `${selectedSeat}||${selectedFloor}` : ''}
                  onChange={async (e) => {
                    const [hq, fl] = e.target.value.split('||');
                    setSelectedSeat(hq);
                    setSelectedFloor(fl);
                    setCurrentHeadquarters?.(hq);
                    setCurrentFloor?.(fl);
                    if (onLoadMap) {
                      await onLoadMap(hq, fl);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select a saved map --</option>
                  {savedMaps.map((m) => (
                    <option key={`${m.headquarters}||${m.floor}`} value={`${m.headquarters}||${m.floor}`}>
                      {m.headquarters} - {m.floor}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="selectFloor">Select Floor</Label>
              <select 
                id="selectFloor"
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select a floor --</option>
                {floorOptions.map((floor) => (
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
                {hqOptions.map((seat) => (
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