export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export type MessagePart = 
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { functionCall: { name: string; args: Record<string, any>; id: string } }
  | { functionResponse: { name: string; response: any; id: string } };

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface HistoryEntry {
  role: Role;
  parts: MessagePart[];
}
