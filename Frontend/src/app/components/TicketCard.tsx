import { useDrag } from 'react-dnd';
import { Card, CardContent } from './ui/card';
import { Badge } from '../components/ui/badge';
import { Ticket, TicketCategory } from '../types/ticket';
import { Clock, User, Tag, AlertCircle, MapPin } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

const categoryLabels: Record<TicketCategory, string> = {
  hardware: 'Hardware',
  software: 'Software',
  other: 'Otros',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
};

export default function TicketCard({ ticket, onClick }: TicketCardProps) {
    // Asegurar que createdAt sea un objeto Date
    let fecha = ticket.createdAt;
    if (typeof fecha === 'string') {
      fecha = new Date(fecha);
    }
    const fechaStr = fecha instanceof Date && !isNaN(fecha.getTime())
      ? fecha.toLocaleDateString('es-ES')
      : 'Fecha desconocida';
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TICKET',
    item: { id: ticket.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <Card
      ref={drag as any}
      className={`cursor-pointer hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${ticket.status === 'urgent' ? 'border border-red-300' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm line-clamp-2 flex-1">
              {ticket.title}
            </h3>
            <div className="flex items-center gap-1">
              {ticket.status === 'urgent' && (
                <Badge className="bg-red-500 text-white" variant="secondary">
                  Urgent
                </Badge>
              )}
              <Badge className={priorityColors[ticket.priority]} variant="secondary">
                {ticket.priority === 'low' && 'Baja'}
                {ticket.priority === 'medium' && 'Media'}
                {ticket.priority === 'high' && 'Alta'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{categoryLabels[ticket.category]}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate">{ticket.createdByName}</span>
            </div>
            {ticket.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{ticket.location}</span>
              </div>
            )}
            {ticket.assignedToName && (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span className="truncate">→ {ticket.assignedToName}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{fechaStr}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
