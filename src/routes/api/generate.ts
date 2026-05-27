import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { system, prompt } = (await request.json()) as {
          system?: string;
          prompt?: string;
        };
        if (!prompt) return new Response("Prompt required", { status: 400 });
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: system || "You are a helpful workplace productivity assistant. Use clear markdown formatting.",
          prompt,
        });
        return result.toTextStreamResponse();
      },
    },
  },
});
