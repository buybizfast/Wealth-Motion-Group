import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  return NextResponse.json({
    message: "This API route is disabled in this version of the application.",
    status: "disabled"
  });
}
