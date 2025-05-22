import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json({
    text: "Transcription feature is not available in this version of the application.",
    status: "disabled"
  });
}
