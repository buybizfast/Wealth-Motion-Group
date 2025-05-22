import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json({
    message: "This API route is disabled in this version of the application.",
    status: "disabled"
  });
}
