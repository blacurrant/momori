import { ChatExport, Message } from "../types";

export function parseInstagramChat(
  fileContent: string,
  fileName: string,
): ChatExport {
  // Instagram exports are usually JSON.
  // Logic works for standard "messages_[nb].json" from Meta Download.

  try {
    const data = JSON.parse(fileContent);
    const messages: Message[] = [];
    const participants = new Set<string>();

    // Standard structure: { participants: [{name: "A"}], messages: [...] }
    if (Array.isArray(data.participants)) {
      data.participants.forEach((p: any) => {
        if (p.name) participants.add(p.name);
      });
    }

    if (Array.isArray(data.messages)) {
      // Reverse because Instagram export usually has newest first
      const rawMessages = [...data.messages].reverse();

      rawMessages.forEach((msg: any, index: number) => {
        const sender = msg.sender_name || "Unknown";
        participants.add(sender);

        const content =
          msg.content ||
          (msg.photos
            ? "Sent a photo"
            : msg.videos
              ? "Sent a video"
              : "Unknown content");

        // Instagram uses ms timestamp
        const timestamp_ms = msg.timestamp_ms;

        messages.push({
          id: `ig-${index}`,
          sender,
          content: decodeEncoding(content), // Fix mojibake (utf8 encoded as latin1)
          timestamp:
            timestamp_ms && !isNaN(new Date(timestamp_ms).getTime())
              ? new Date(timestamp_ms)
              : new Date(),
          platform: "instagram",
          type: msg.photos ? "image" : msg.videos ? "video" : "text",
          mediaUri: msg.photos?.[0]?.uri || msg.videos?.[0]?.uri,
        });
      });
    }

    return {
      fileName,
      messages,
      participants: Array.from(participants),
      totalMessages: messages.length,
    };
  } catch (e) {
    console.error("Failed to parse Instagram parsing", e);
    return {
      fileName,
      messages: [],
      participants: [],
      totalMessages: 0,
    };
  }
}

// Helper to fix common encoding issue in Meta exports (Latin1 vs UTF8)
function decodeEncoding(str: string): string {
  try {
    return decodeURIComponent(escape(str));
  } catch (e) {
    return str;
  }
}
