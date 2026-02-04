import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

export async function POST(request: Request) {
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
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
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
