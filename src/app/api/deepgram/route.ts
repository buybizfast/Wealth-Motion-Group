import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    message: "This API route is disabled in this version of the application.",
    status: "disabled"
  });
}
