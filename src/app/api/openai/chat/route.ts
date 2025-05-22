import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { rateLimiter } from "@/lib/middleware/rateLimit";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  // Apply rate limiting - 10 requests per minute
  const rateLimited = rateLimiter(req, { maxRequests: 10, windowMs: 60000 });
  if (rateLimited) return rateLimited;

  try {
    const body = await req.json();
    
    // Input validation
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }
    
    const result = await streamText({
      model: openai("gpt-4o"),
      messages: convertToCoreMessages(body.messages),
      system: "You are a helpful AI assistant",
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
