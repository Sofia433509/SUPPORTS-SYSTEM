import React, { createContext, useContext, useState, ReactNode } from 'react';
// ...existing code...
import { Ticket, Comment } from '../types/ticket';

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  addComment: (ticketId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  deleteTicket: (id: string) => Promise<void>;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Cargar tickets desde el backend al iniciar
  React.useEffect(() => {
    async function fetchTickets() {
      try {
        const response = await fetch('http://localhost:3006/api/tickets');
        if (!response.ok) throw new Error('Error obteniendo tickets');
        const data = await response.json();
        // Mapear user_id a createdBy para compatibilidad frontend
        const mapped = Array.isArray(data)
          ? data.map(ticket => ({
              ...ticket,
              createdBy: ticket.user_id,
              deskId: ticket.desk_id,
              createdAt: ticket.createdAt ? new Date(ticket.createdAt) : new Date(),
              updatedAt: ticket.updatedAt ? new Date(ticket.updatedAt) : new Date(),
              comments: ticket.comments || [],
            }))
          : [];
        setTickets(mapped);
      } catch (error) {
        console.error('Error obteniendo tickets:', error);
      }
    }
    fetchTickets();
  }, []);

  const addTicket = async (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    try {
      // Determine if location already has >=3 non-resolved tickets
      const locationKey = ticket.location || '';
      const existingCount = tickets.filter((t) => (t.location || '') === locationKey && t.status !== 'resolved').length;
      // use >=2 so the third ticket (existingCount 2) triggers urgency
      const willBeUrgent = existingCount >= 2;
      const sendStatus = willBeUrgent ? 'urgent' : ticket.status;

      // Enviar ticket al backend
      const response = await fetch('http://localhost:3006/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ticket.title,
          description: ticket.description,
          status: sendStatus,
          user_id: ticket.createdBy,
          desk_id: null,
          priority: ticket.priority || 'low',
          category: ticket.category,
          createdByName: ticket.createdByName,
          assignedTo: ticket.assignedTo || '',
          assignedToName: ticket.assignedToName || '',
          location: locationKey,
        })
      });
      if (!response.ok) throw new Error('Error creando ticket en backend');
      const result = await response.json();

      // Actualizar el estado local
      const newTicket: Ticket = {
        ...ticket,
        status: sendStatus,
        location: locationKey,
        id: result.insertId ? String(result.insertId) : `ticket-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        comments: [],
      };
      setTickets((prev) => [newTicket, ...prev]);

      // If we crossed threshold, escalate existing tickets locally and request backend update
      if (willBeUrgent) {
        setTickets((prev) =>
          prev.map((t) =>
            (t.location || '') === locationKey && t.status !== 'resolved'
              ? { ...t, status: 'urgent' }
              : t
          )
        );
        // patch backend for each such ticket (fire & forget)
        tickets.forEach((t) => {
          if ((t.location || '') === locationKey && t.status !== 'resolved' && t.status !== 'urgent') {
            updateTicket(t.id, { status: 'urgent' }).catch((e) => console.error(e));
          }
        });
      }
    } catch (error) {
      console.error('Error creando ticket:', error);
    }
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    try {
      const response = await fetch(`http://localhost:3006/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Error actualizando ticket en backend');
      }

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === id
            ? { ...ticket, ...updates, updatedAt: new Date() }
            : ticket
        )
      );

      // after the update, check if modification affects urgent threshold
      if (updates.location) {
        const loc = updates.location;
        const count = tickets.filter((t) => t.location === loc && t.status !== 'resolved').length;
        if (count > 2) {
          setTickets((prev) =>
            prev.map((t) =>
              t.location === loc && t.status !== 'resolved' ? { ...t, status: 'urgent' } : t
            )
          );
          tickets.forEach((t) => {
            if (t.location === loc && t.status !== 'resolved' && t.status !== 'urgent') {
              fetch(`http://localhost:3006/api/tickets/${t.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'urgent' }),
              }).catch((e) => console.error(e));
            }
          });
        }
      }
    } catch (error) {
      console.error('Error actualizando ticket:', error);
    }
  };

  const deleteTicket = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3006/api/tickets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error eliminando ticket en backend');
      }

      setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
    } catch (error) {
      console.error('Error eliminando ticket:', error);
    }
  };

  const addComment = (ticketId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date(),
    };

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              comments: [...ticket.comments, newComment],
              updatedAt: new Date(),
            }
          : ticket
      )
    );
  };

  return (
    <TicketContext.Provider
      value={{ tickets, addTicket, updateTicket, addComment, deleteTicket }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}