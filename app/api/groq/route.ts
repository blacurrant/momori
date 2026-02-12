import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { type } = await req.json();

    if (type === "wordle") {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a game engine. Generate a SINGLE 5-letter English word related to cats, cozy vibes, or nature. Output ONLY the word, uppercase. No markdown, no explanations. Examples: KITTY, PURRS, MEOWS, COZYS, SLEEP, PAWSY.",
          },
        ],
        model: "llama3-8b-8192",
      });
      const word = completion.choices[0]?.message?.content
        ?.trim()
        .toUpperCase();
      return NextResponse.json({ word });
    }

    if (type === "spelling") {
      // Generate a 7-letter pangram and center letter
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a game engine. Generate a "Spelling Bee" puzzle configuration.
                        1. Pick a 7-letter pangram (a word with 7 unique letters).
                        2. Choose one center letter from it.
                        3. Find at least 10 valid words (4+ letters) that can be made from these 7 letters (must include center letter).
                        4. Output JSON ONLY: { "center": "A", "letters": ["A", "B", ...], "validConut": 15, "pangram": "..." }`,
          },
        ],
        model: "llama3-8b-8192",
        response_format: { type: "json_object" },
      });
      const data = JSON.parse(completion.choices[0]?.message?.content || "{}");
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
