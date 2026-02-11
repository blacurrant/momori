import { ChatExport, Message } from "../types";

export function parseWhatsAppChat(
  fileContent: string,
  fileName: string,
): ChatExport {
  const lines = fileContent.split("\n");
  const messages: Message[] = [];
  const participants = new Set<string>();

  // Regex for WhatsApp formats:
  // 1. [dd/mm/yy, hh:mm:ss] Sender: Message (iOS)
  // 2. dd/mm/yy, hh:mm - Sender: Message (Android)

  const iosRegex =
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}:\d{2}(?:\s?[AP]M)?)\]\s(.*?):\s(.*)$/;
  const androidRegex =
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?:\s?[AP]M)?)\s-\s(.*?):\s(.*)$/;

  let currentMessage: Message | null = null;

  lines.forEach((line, index) => {
    line = line.trim();
    if (!line) return;

    // Remove LTR/RTL marks
    line = line.replace(/[\u200e\u200f]/g, "");

    let match = line.match(iosRegex) || line.match(androidRegex);

    if (match) {
      const [, dateStr, timeStr, sender, content] = match;

      // Parse Date
      // This is tricky because of locale variations (dd/mm vs mm/dd).
      // We'll assume dd/mm for now but a robust parser would try to detect.
      const timestamp = parseDateTime(dateStr, timeStr);

      if (sender && content) {
        participants.add(sender);

        currentMessage = {
          id: `wa-${index}`,
          sender,
          content,
          timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
          platform: "whatsapp",
          type: detectMessageType(content),
        };
        messages.push(currentMessage);
      }
    } else if (currentMessage) {
      // Continuation of previous message
      currentMessage.content += "\n" + line;
    }
  });

  return {
    fileName,
    messages,
    participants: Array.from(participants),
    totalMessages: messages.length,
  };
}

function parseDateTime(dateStr: string, timeStr: string): Date {
  // Normalize simple cases.
  // TODO: Add refined date parsing logic or use date-fns if needed.
  // Example: 20/01/24, 11:30 PM

  // Splitting by / to reorder for JS Date constructor (MM/DD/YYYY usually works best or ISO)
  // Assuming DD/MM/YYYY input
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    // Check if first part > 12 -> definitely day
    const [p1, p2, p3] = parts.map(Number);
    let day = p1,
      month = p2,
      year = p3;

    // If year is 2 digits
    if (year < 100) year += 2000;

    // JS Month is 0-indexed
    return new Date(year, month - 1, day, ...parseTime(timeStr));
  }

  return new Date(); // Fallback
}

function parseTime(timeStr: string): [number, number, number] {
  // Handle 11:30 PM vs 23:30 vs 11:30:45
  let [time, modifier] = timeStr.split(" ");
  let [hours, minutes, seconds] = time.split(":").map(Number);

  if (!seconds) seconds = 0;

  if (modifier) {
    modifier = modifier.toUpperCase();
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
  }

  return [hours, minutes, seconds];
}

function detectMessageType(content: string): Message["type"] {
  if (content.includes("<Media omitted>")) return "system";
  if (content.match(/image omitted/i)) return "image";
  if (content.match(/video omitted/i)) return "video";
  if (content.match(/audio omitted/i)) return "audio";
  return "text";
}
