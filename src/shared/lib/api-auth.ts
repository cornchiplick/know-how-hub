import { NextResponse } from "next/server";

export function validateApiKey(request: Request): boolean {
  const header = request.headers.get("Authorization");
  const token = header?.replace("Bearer ", "");
  const secret = process.env.API_SECRET_KEY;

  if (!secret) return false;
  return token === secret;
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized. Provide a valid Bearer token in the Authorization header." },
    { status: 401 },
  );
}
