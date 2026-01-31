export interface UserContext {
  user_id: string;
  route: string;
  device: string;
  logs: string[];
  recent_errors?: string[];
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface TicketDraft {
  title: string;
  description: string;
  component?: string;
  priority: TicketPriority;
  file_hints?: string[];
}

export interface TicketPayload extends TicketDraft {
  user_context: UserContext;
}

export interface MessageTurn {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
