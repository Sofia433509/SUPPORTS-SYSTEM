import { createContext, useContext, useState, ReactNode } from 'react';
import { Ticket, Comment } from '../types/ticket';

// Definición del tipo del contexto de tickets
// Describiendo los datos y funciones disponibles para los componentes
interface TicketContextType {
  tickets: Ticket[]; // Lista de todos los tickets
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void; // Crear ticket
  updateTicket: (id: string, updates: Partial<Ticket>) => void; // Actualizar ticket existente
  addComment: (ticketId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void; // Agregar comentario a un ticket
  deleteTicket: (id: string) => void; // Eliminar ticket
}

// Creación del contexto
// Inicialmente puede ser undefined hasta que esté dentro del Provider
const TicketContext = createContext<TicketContextType | undefined>(undefined);

// Provider del contexto
// Este componente envuelve la aplicación o parte de ella
// y permite que los componentes hijos accedan a los tickets
export function TicketProvider({ children }: { children: ReactNode }) {

  // Estado que almacena todos los tickets
  // Se inicializa como un arreglo vacío
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Función para agregar un nuevo ticket
  const addTicket = (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {

    // Crear un nuevo ticket agregando propiedades automáticas
    const newTicket: Ticket = {
      ...ticket, // datos recibidos del formulario
      id: `ticket-${Date.now()}`, // generar id único basado en timestamp
      createdAt: new Date(), // fecha de creación
      updatedAt: new Date(), // fecha de última actualización
      comments: [], // inicializar lista de comentarios vacía
    };

    // Actualizar el estado agregando el nuevo ticket al inicio del arreglo
    setTickets((prev) => [newTicket, ...prev]);
  };

  // Función para actualizar un ticket existente
  const updateTicket = (id: string, updates: Partial<Ticket>) => {

    // Recorre la lista de tickets y actualiza solo el que coincida con el id
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id
          ? { ...ticket, ...updates, updatedAt: new Date() } // aplicar cambios y actualizar fecha
          : ticket // si no coincide, se mantiene igual
      )
    );
  };

  // Función para agregar un comentario a un ticket específico
  const addComment = (ticketId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {

    // Crear nuevo comentario agregando propiedades automáticas
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}`, // id único del comentario
      createdAt: new Date(), // fecha de creación
    };

    // Buscar el ticket correspondiente y agregar el comentario
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              comments: [...ticket.comments, newComment], // agregar comentario al arreglo
              updatedAt: new Date(), // actualizar fecha del ticket
            }
          : ticket
      )
    );
  };

  // Función para eliminar un ticket
  const deleteTicket = (id: string) => {

    // Filtra los tickets eliminando el que coincida con el id
    setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
  };

  // Proveedor del contexto
  // Expone el estado y las funciones a todos los componentes hijos
  return (
    <TicketContext.Provider
      value={{ tickets, addTicket, updateTicket, addComment, deleteTicket }}
    >
      {children}
    </TicketContext.Provider>
  );
}

// Hook personalizado para acceder fácilmente al contexto
export function useTickets() {

  const context = useContext(TicketContext);

  // Validación para asegurar que se use dentro del TicketProvider
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }

  return context;
}