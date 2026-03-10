import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Ticket, TicketStatus, TicketCategory } from '../types/ticket';
import { Clock, User, Tag, MessageSquare, MapPin, Wrench } from 'lucide-react';

interface TicketDetailsModalProps {
  ticket: Ticket;
  onClose: () => void;
  isAdmin: boolean;
}

const statusLabels: Record<TicketStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
};

const categoryLabels: Record<TicketCategory, string> = {
  hardware: 'Hardware',
  software: 'Software',
  other: 'Other',
};

const statusColors: Record<TicketStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
};

const technicians = [
  { id: '1', name: 'Camilo' },
  { id: '2', name: 'Andres' },
  { id: '3', name: 'Jose' },
];

export default function TicketDetailsModal({ ticket, onClose, isAdmin }: TicketDetailsModalProps) {
  // Validar campos esenciales (antes de los useState)
  const safeCreatedAt = ticket.createdAt ? new Date(ticket.createdAt) : new Date();
  const safeComments = Array.isArray(ticket.comments) ? ticket.comments : [];
  const safeAssignedToName = ticket.assignedToName || 'Unassigned';
  const safeCategory = ticket.category || 'other';
  const safeStatus = ticket.status || 'pending';
  const safeTitle = ticket.title || 'Sin título';
  const safeDescription = ticket.description || 'Sin descripción';
  const safeCreatedByName = ticket.createdByName || 'Desconocido';
  const safeLocation = ticket.location || '';

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(safeTitle);
  const [editDescription, setEditDescription] = useState(safeDescription);
  const [editPriority, setEditPriority] = useState(ticket.priority || 'low');
  const [editCategory, setEditCategory] = useState(safeCategory);
  const [editLocation, setEditLocation] = useState(safeLocation);

  const { deleteTicket } = useTickets();

  const handleEditSave = () => {
    updateTicket(ticket.id, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      category: editCategory,
      location: editLocation,
    });
    setEditMode(false);
  };

  const handleDelete = () => {
    if (window.confirm('¿Seguro que quieres eliminar este ticket?')) {
      deleteTicket(ticket.id);
      onClose();
    }
  };
  const { user } = useAuth();
  const { updateTicket, addComment } = useTickets();
  const [comment, setComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  // Validaciones defensivas para ticket
  if (!ticket || typeof ticket !== 'object') {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="text-red-600 font-bold">No se pudo cargar la información del ticket.</div>
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }


  const handleStatusChange = (newStatus: TicketStatus) => {
    updateTicket(ticket.id, { status: newStatus });
  };

  const handleAssignTechnician = (techId: string) => {
    const tech = technicians.find((t) => t.id === techId);
    updateTicket(ticket.id, {
      assignedTo: techId,
      assignedToName: tech?.name || '',
    });
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;

    addComment(ticket.id, {
      ticketId: ticket.id,
      userId: user?.id || '',
      userName: user?.name || user?.email || '',
      content: comment,
      isInternal: isInternalNote,
    });

    setComment('');
    setIsInternalNote(false);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date instanceof Date ? date : new Date());
  };

  const visibleComments = isAdmin
    ? safeComments
    : safeComments.filter((c) => !c.isInternal);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{editMode ? (
              <input
                className="border rounded px-2 py-1 text-lg font-semibold"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                autoFocus
              />
            ) : safeTitle}</span>
            <Badge className={statusColors[safeStatus]}>
              {statusLabels[safeStatus]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="w-4 h-4" />
                Category
              </div>
              {editMode ? (
                <Select value={editCategory} onValueChange={(value) => setEditCategory(value as TicketCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="font-medium">{categoryLabels[safeCategory]}</div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                Created by
              </div>
              <div className="font-medium">{safeCreatedByName}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Wrench className="w-4 h-4" />
                Technician
              </div>
              <div className="font-medium">
                {safeAssignedToName}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                Date
              </div>
              <div className="font-medium text-sm">
                {formatDateTime(safeCreatedAt)}
              </div>
            </div>
          </div>

          {editMode ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                Desk Location
              </div>
              <input
                className="border rounded px-2 py-1"
                value={editLocation}
                onChange={e => setEditLocation(e.target.value)}
              />
            </div>
          ) : safeLocation && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                Desk Location
              </div>
              <div className="font-medium">{safeLocation}</div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            {editMode ? (
              <Textarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                rows={4}
              />
            ) : (
              <p className="text-gray-700 bg-gray-50 p-4 rounded-md">
                {safeDescription}
              </p>
            )}
          </div>

          {editMode && (
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={editPriority} onValueChange={(value) => setEditPriority(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Admin Controls */}
          {isAdmin && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Change Status</Label>
                  <Select value={safeStatus} onValueChange={(value) => handleStatusChange(value as TicketStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Assign Technician</Label>
                  <Select value={ticket.assignedTo || ''} onValueChange={handleAssignTechnician}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {!editMode ? (
                  <Button variant="outline" onClick={() => setEditMode(true)}>
                    Edit Ticket
                  </Button>
                ) : (
                  <>
                    <Button variant="default" onClick={handleEditSave}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </>
                )}
                <Button variant="destructive" onClick={handleDelete}>
                  Delete Ticket
                </Button>
              </div>
            </>
          )}

          <Separator />

          {/* Comments */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments ({visibleComments.length})
            </h3>
            
            <div className="space-y-4 mb-4">
              {visibleComments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
              ) : (
                visibleComments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-4 rounded-lg ${
                      c.isInternal ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.userName}</span>
                        {c.isInternal && (
                          <Badge variant="outline" className="text-xs">Internal note</Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{formatDateTime(c.createdAt)}</span>
                    </div>
                    <p className="text-gray-700">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            <div className="space-y-3 border-t pt-4">
              <Label>Add {isAdmin && isInternalNote ? 'Internal Note' : 'Comment'}</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your comment..."
                rows={3}
              />
              <div className="flex items-center justify-between">
                {isAdmin && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span>Internal note (visible only to admins)</span>
                  </label>
                )}
                <Button onClick={handleAddComment} disabled={!comment.trim()}>
                  Add Comment
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}