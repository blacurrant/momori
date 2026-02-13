export type Platform = "whatsapp" | "instagram";

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  platform: Platform;
  type: "text" | "image" | "video" | "audio" | "system";
  mediaUri?: string;
  starred?: boolean;
}

export interface ChatExport {
  fileName: string;
  messages: Message[];
  participants: string[];
  totalMessages: number;
}
