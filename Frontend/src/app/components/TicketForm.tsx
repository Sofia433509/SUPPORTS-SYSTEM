import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../context/TicketContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { TicketCategory } from '../types/ticket';
import { toast } from 'sonner'; // Importamos toast para las notificaciones

interface TicketFormProps {
  onClose: () => void;
  userId: string;
  userName: string;
  /** Texto que se muestra al usuario (nombre del desk) */
  initialLocationLabel?: string;
  /** Identificador interno del desk (usado para conteo/escala) */
  initialDeskId?: string;
  defaultPriority?: 'low' | 'medium' | 'high';
  /** Si se proporciona, redirige a esta ruta después de crear el ticket */
  redirectTo?: string;
}

export default function TicketForm({
  onClose,
  userId,
  userName,
  initialLocationLabel,
  initialDeskId,
  defaultPriority,
  redirectTo,
}: TicketFormProps) {
  const navigate = useNavigate();
  const { tickets, addTicket } = useTickets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('hardware');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(defaultPriority ?? 'low');
  const [location, setLocation] = useState(initialLocationLabel ?? '');
  const [deskId, setDeskId] = useState(initialDeskId ?? '');

  // Update location label/id if the initial location changes (e.g., clicked on a different desk)
  React.useEffect(() => {
    setLocation(initialLocationLabel ?? '');
    setDeskId(initialDeskId ?? '');
  }, [initialLocationLabel, initialDeskId]);

  // Count active (non-resolved) tickets for the current location
  const activeTicketsForLocation = useMemo(() => {
    if (!location) return 0;
    return tickets.filter((t) => t.location === location && t.status !== 'resolved').length;
  }, [location, tickets]);

  // Update priority if a different default priority is provided (e.g., urgent desk)
  React.useEffect(() => {
    setPriority(defaultPriority ?? 'low');
  }, [defaultPriority]);

  // Show a warning if the location already has 3+ active reports
  const urgentNotice = activeTicketsForLocation >= 2 ? (
    <div className="p-3 mb-4 bg-red-100 text-red-800 rounded">
      Este escritorio ya tiene {activeTicketsForLocation} reportes; el siguiente se marcará como <strong>urgent</strong> y no se podrán crear más luego.
    </div>
  ) : null;

  const locations = [
    ...Array.from({ length: 73 }, (_, i) => `D-${String(i + 1).padStart(3, '0')}`),
    ...Array.from({ length: 75 }, (_, i) => `R-${String(i + 1).padStart(3, '0')}`),
    ...Array.from({ length: 7 }, (_, i) => `E-${String(i + 1).padStart(3, '0')}`),
  ];

  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que los campos requeridos no estén vacíos
    if (!title.trim() || !description.trim()) {
      return;
    }

    if (activeTicketsForLocation >= 3) {
      toast.error('Ya hay 3 tickets activos en este escritorio; no se pueden crear más.');
      return;
    }

    const willBeUrgent = activeTicketsForLocation === 2;

    // Crear el nuevo ticket
    addTicket({
      title,
      description,
      category,
      createdBy: userId,
      createdByName: userName,
      reportedBy: userName,
      // Use user-visible location label (desk name/id) for display
      location: location || undefined,
      deskId: deskId || undefined,
      status: willBeUrgent ? 'urgent' : 'pending',
      priority,
      assignedTo: undefined
    });

    if (willBeUrgent) {
      toast.success('Este tercer ticket se ha creado como urgente. Después no se podrán crear más tickets en este desk.');
    }

    // Mostrar notificación de éxito
    toast.success('Ticket created successfully', {
      description: `The ticket "${title}" has been created successfully`,
      duration: 5000,
    });

    // Cerrar el formulario
    onClose();

    // Si se provee una ruta de redirección, navegar allí para reflejar los cambios
    if (redirectTo) {
      navigate(redirectTo);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {urgentNotice}
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Computer won't turn on"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem in as much detail as possible..."
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Desk Location</Label>
              {initialLocationLabel ? (
                <Input
                  id="location"
                  value={location}
                  readOnly
                  className="bg-gray-100"
                />
              ) : (
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select your desk" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as TicketCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Ticket
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}