import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { rateLimit, getClientIp, getRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limiting: 5 requests per minute per IP
  const clientIp = getClientIp(request);
  const rateLimitResult = rateLimit(clientIp, 5, 60000);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  }

  // Validate request body size (prevent large payload attacks)
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 10000) {
    return NextResponse.json(
      { error: "Request payload too large" },
      { status: 413 }
    );
  }

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, parsed.data.email),
  });

  if (existing) {
    // Generic error message to prevent user enumeration
    return NextResponse.json(
      { error: "Registration failed. Please try a different email address." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await db.insert(users).values({
    id: uuid(),
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
