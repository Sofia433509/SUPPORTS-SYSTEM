import React, { useState } from 'react';
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
  initialLocation?: string;
  defaultPriority?: 'low' | 'medium' | 'high';
}

export default function TicketForm({ onClose, userId, userName, initialLocation, defaultPriority }: TicketFormProps) {
  const { addTicket } = useTickets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('hardware');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(defaultPriority ?? 'low');
  const [location, setLocation] = useState(initialLocation ?? '');

  // Update location if the initial location changes (e.g., clicked on a different desk)
  React.useEffect(() => {
    setLocation(initialLocation ?? '');
  }, [initialLocation]);

  // Update priority if a different default priority is provided (e.g., urgent desk)
  React.useEffect(() => {
    setPriority(defaultPriority ?? 'low');
  }, [defaultPriority]);

  const technicians = [
    { id: '1', name: 'Camilo' },
    { id: '2', name: 'Andres' },
    { id: '3', name: 'Jose' },
  ];

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

    // Crear el nuevo ticket
    addTicket({
      title,
      description,
      category,
      createdBy: userId,
      createdByName: userName,
      reportedBy: userName,
      location: location || undefined,
      status: 'pending',
      priority,
      assignedTo: undefined
    });

    // Mostrar notificación de éxito
    toast.success('Ticket created successfully', {
      description: `The ticket "${title}" has been created successfully`,
      duration: 5000,
    });

    // Cerrar el formulario
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
              {initialLocation ? (
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