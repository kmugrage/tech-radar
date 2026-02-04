"use server";

import { db } from "@/lib/db";
import { radars, quadrants, rings, blips } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { createRadarSchema, updateRadarSchema, updateQuadrantSchema, updateRingSchema } from "@/lib/validations";
import { DEFAULT_QUADRANTS, DEFAULT_RINGS } from "@/lib/constants";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createRadar(formData: FormData) {
  const userId = await requireUser();

  const parsed = createRadarSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const radarId = uuid();

  await db.insert(radars).values({
    id: radarId,
    userId,
    name: parsed.data.name,
    description: parsed.data.description || null,
  });

  // Insert default quadrants
  for (const q of DEFAULT_QUADRANTS) {
    await db.insert(quadrants).values({
      id: uuid(),
      radarId,
      name: q.name,
      position: q.position,
      color: q.color,
    });
  }

  // Insert default rings
  for (const r of DEFAULT_RINGS) {
    await db.insert(rings).values({
      id: uuid(),
      radarId,
      name: r.name,
      position: r.position,
      opacity: r.opacity,
    });
  }

  redirect(`/radar/${radarId}`);
}

export async function updateRadar(radarId: string, formData: FormData) {
  const userId = await requireUser();

  const radar = await db.query.radars.findFirst({
    where: and(eq(radars.id, radarId), eq(radars.userId, userId)),
  });
  if (!radar) return { error: "Radar not found" };

  const parsed = updateRadarSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db
    .update(radars)
    .set({
      name: parsed.data.name,
      description: parsed.data.description || null,
      updatedAt: new Date(),
    })
    .where(eq(radars.id, radarId));

  revalidatePath(`/radar/${radarId}`);
  redirect(`/radar/${radarId}`);
}

export async function deleteRadar(radarId: string) {
  const userId = await requireUser();

  const radar = await db.query.radars.findFirst({
    where: and(eq(radars.id, radarId), eq(radars.userId, userId)),
  });
  if (!radar) return { error: "Radar not found" };

  await db.delete(radars).where(eq(radars.id, radarId));

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function getUserRadars() {
  const userId = await requireUser();

  return db.query.radars.findMany({
    where: eq(radars.userId, userId),
    orderBy: (radars, { desc }) => [desc(radars.updatedAt)],
  });
}

export async function getRadar(radarId: string) {
  const userId = await requireUser();

  return db.query.radars.findFirst({
    where: and(eq(radars.id, radarId), eq(radars.userId, userId)),
    with: {
      quadrants: { orderBy: (quadrants, { asc }) => [asc(quadrants.position)] },
      rings: { orderBy: (rings, { asc }) => [asc(rings.position)] },
      blips: {
        with: {
          quadrant: true,
          ring: true,
        },
      },
    },
  });
}

export async function updateQuadrant(
  quadrantId: string,
  formData: FormData
) {
  const userId = await requireUser();

  const quadrant = await db.query.quadrants.findFirst({
    where: eq(quadrants.id, quadrantId),
    with: { radar: true },
  });
  if (!quadrant || quadrant.radar.userId !== userId) {
    return { error: "Quadrant not found" };
  }

  const parsed = updateQuadrantSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db
    .update(quadrants)
    .set({ name: parsed.data.name, color: parsed.data.color })
    .where(eq(quadrants.id, quadrantId));

  revalidatePath(`/radar/${quadrant.radarId}`);
  return { success: true };
}

export async function updateRing(ringId: string, formData: FormData) {
  const userId = await requireUser();

  const ring = await db.query.rings.findFirst({
    where: eq(rings.id, ringId),
    with: { radar: true },
  });
  if (!ring || ring.radar.userId !== userId) {
    return { error: "Ring not found" };
  }

  const parsed = updateRingSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db
    .update(rings)
    .set({ name: parsed.data.name })
    .where(eq(rings.id, ringId));

  revalidatePath(`/radar/${ring.radarId}`);
  return { success: true };
}
