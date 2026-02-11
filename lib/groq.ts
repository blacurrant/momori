import Groq from "groq-sdk";
import { Message } from "./types";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API,
  dangerouslyAllowBrowser: true, // Enabling for client-side demo; ideally proxy via API route
});

export async function generateInsights(
  messages: Message[],
  query: string,
): Promise<string> {
  try {
    // SMART CONTEXT RETRIEVAL (Client-side RAG)
    // Instead of just the last 50 messages, we find the *relevant* ones.

    const relevantMessages = retrieveContext(messages, query);

    // Format for LLM
    const context = relevantMessages
      .map((m) => `[${m.timestamp.toISOString()}] ${m.sender}: ${m.content}`)
      .join("\n");

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are Momori, a helpful nostalgic assistant. Analyze the provided snippets of chat history to answer the user's question. The context provided is a mix of relevant messages found via search. If the answer isn't in the chat, politely say so.",
        },
        {
          role: "user",
          content: `Context (Relevant Excerpts):\n${context}\n\nQuestion: ${query}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1024,
    });

    return (
      completion.choices[0]?.message?.content ||
      "I couldn't generate an answer."
    );
  } catch (error) {
    console.error("Groq API Error:", error);
    return "Sorry, I ran into an issue connecting to my brain (Groq API). Please check your key.";
  }
}

function retrieveContext(messages: Message[], query: string): Message[] {
  const MAX_CONTEXT_MESSAGES = 150;
  const SURROUNDING_CONTEXT = 3; // Number of messages before/after a match to include

  // 1. keywords extraction (simple split by space, ignore small words)
  const keywords = query
    .toLowerCase()
    .split(" ")
    .filter((w) => w.length > 3);

  if (keywords.length === 0) {
    // If query is too vague (e.g. "Summarize"), just take the most interesting scattered messages or last ones.
    // For general summary, evenly spaced sample might be better, but let's stick to recent for now.
    return messages.slice(-50);
  }

  // 2. Score messages
  const hits: number[] = [];
  messages.forEach((msg, index) => {
    const content = msg.content.toLowerCase();
    // Check exact match or keyword match
    if (keywords.some((k) => content.includes(k))) {
      hits.push(index);
    }
  });

  // 3. If no hits, fallback to recent
  if (hits.length === 0) {
    return messages.slice(-50);
  }

  // 4. Collect context around hits
  const indicesToInclude = new Set<number>();

  hits.forEach((hitIndex) => {
    const start = Math.max(0, hitIndex - SURROUNDING_CONTEXT);
    const end = Math.min(messages.length - 1, hitIndex + SURROUNDING_CONTEXT);
    for (let i = start; i <= end; i++) {
      indicesToInclude.add(i);
    }
  });

  // 5. Convert to array and sort
  const sortedIndices = Array.from(indicesToInclude).sort((a, b) => a - b);

  // 6. Prune if too many (Prioritize most relevant or evenly spread? Let's just take the top X matches based on recency or density)
  // Simple approach: Take the last N indices to fit limit
  let finalIndices = sortedIndices;
  if (sortedIndices.length > MAX_CONTEXT_MESSAGES) {
    // Maybe prefer matches that are closer to the question's intent?
    // For now, simpler is creating a density map, but let's just slice the end for now.
    finalIndices = sortedIndices.slice(-MAX_CONTEXT_MESSAGES);
  }

  return finalIndices.map((i) => messages[i]);
}
