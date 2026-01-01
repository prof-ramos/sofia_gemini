import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { history, modelName, systemInstruction, tools } =
      await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response("Server Configuration Error", { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = modelName || "gemini-1.5-pro";

    // The SDK's generateContentStream returns a custom iterable, not a standard ReadableStream directly compatible with Response.
    // We need to bridge it.

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await ai.models.generateContentStream({
            model: modelId,
            contents: history, // Expects properly formatted history from client
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.35,
              tools: tools, // Pass through tools definition
            },
          });

          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({ type: "text", content: text }) + "\n",
                ),
              );
            }
            // Handle function calls if necessary, or let the client handle it if we forward raw chunks.
            // For simplicity in this proxy, we are forwarding text chunks.
            // Complex function calling might need raw forwarding or specific handling.
            // Let's forward raw function calls too.
            if (chunk.functionCalls) {
              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({
                    type: "functionCalls",
                    content: chunk.functionCalls,
                  }) + "\n",
                ),
              );
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("API Proxy Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
