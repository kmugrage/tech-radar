"use server";

import { db } from "@/lib/db";
import { blips, radars } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { createBlipSchema, updateBlipSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

async function verifyRadarOwnership(radarId: string, userId: string) {
  const radar = await db.query.radars.findFirst({
    where: and(eq(radars.id, radarId), eq(radars.userId, userId)),
  });
  if (!radar) throw new Error("Radar not found");
  return radar;
}

export async function createBlip(radarId: string, formData: FormData) {
  const userId = await requireUser();
  await verifyRadarOwnership(radarId, userId);

  const parsed = createBlipSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    quadrantId: formData.get("quadrantId"),
    ringId: formData.get("ringId"),
    isNew: formData.get("isNew") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Generate a semi-random offset so blips don't overlap
  const offsetX = 0.2 + Math.random() * 0.6;
  const offsetY = 0.2 + Math.random() * 0.6;

  await db.insert(blips).values({
    id: uuid(),
    radarId,
    quadrantId: parsed.data.quadrantId,
    ringId: parsed.data.ringId,
    name: parsed.data.name,
    description: parsed.data.description || null,
    isNew: parsed.data.isNew,
    offsetX,
    offsetY,
  });

  revalidatePath(`/radar/${radarId}`);
  redirect(`/radar/${radarId}/blips`);
}

export async function updateBlip(
  radarId: string,
  blipId: string,
  formData: FormData
) {
  const userId = await requireUser();
  await verifyRadarOwnership(radarId, userId);

  const existing = await db.query.blips.findFirst({
    where: and(eq(blips.id, blipId), eq(blips.radarId, radarId)),
  });
  if (!existing) return { error: "Blip not found" };

  const parsed = updateBlipSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    quadrantId: formData.get("quadrantId"),
    ringId: formData.get("ringId"),
    isNew: formData.get("isNew") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db
    .update(blips)
    .set({
      name: parsed.data.name,
      description: parsed.data.description || null,
      quadrantId: parsed.data.quadrantId,
      ringId: parsed.data.ringId,
      isNew: parsed.data.isNew,
      updatedAt: new Date(),
    })
    .where(eq(blips.id, blipId));

  revalidatePath(`/radar/${radarId}`);
  redirect(`/radar/${radarId}/blips`);
}

export async function importBlipsFromCsv(
  radarId: string,
  csvText: string
): Promise<{ error?: string; imported?: number }> {
  const userId = await requireUser();
  await verifyRadarOwnership(radarId, userId);

  // Load quadrants and rings for this radar to match by name
  const radar = await db.query.radars.findFirst({
    where: and(eq(radars.id, radarId), eq(radars.userId, userId)),
    with: {
      quadrants: true,
      rings: true,
    },
  });
  if (!radar) return { error: "Radar not found" };

  const quadrantMap = new Map(
    radar.quadrants.map((q) => [q.name.toLowerCase().trim(), q.id])
  );
  const ringMap = new Map(
    radar.rings.map((r) => [r.name.toLowerCase().trim(), r.id])
  );

  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    return { error: "CSV must have a header row and at least one data row" };
  }

  // Parse header
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = header.indexOf("name");
  const quadrantIdx = header.indexOf("quadrant");
  const ringIdx = header.indexOf("ring");
  const descIdx = header.indexOf("description");
  const isNewIdx = header.indexOf("isnew");

  if (nameIdx === -1 || quadrantIdx === -1 || ringIdx === -1) {
    return {
      error:
        "CSV must have columns: name, quadrant, ring. Optional: description, isNew",
    };
  }

  const errors: string[] = [];
  let imported = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const name = cols[nameIdx]?.trim();
    const quadrantName = cols[quadrantIdx]?.trim();
    const ringName = cols[ringIdx]?.trim();
    const description =
      descIdx !== -1 ? cols[descIdx]?.trim() || null : null;
    const isNew =
      isNewIdx !== -1
        ? ["true", "yes", "1"].includes(cols[isNewIdx]?.trim().toLowerCase())
        : true;

    if (!name) {
      errors.push(`Row ${i + 1}: missing name`);
      continue;
    }

    const quadrantId = quadrantMap.get(quadrantName.toLowerCase());
    if (!quadrantId) {
      errors.push(
        `Row ${i + 1}: unknown quadrant "${quadrantName}". Valid: ${Array.from(quadrantMap.keys()).join(", ")}`
      );
      continue;
    }

    const ringId = ringMap.get(ringName.toLowerCase());
    if (!ringId) {
      errors.push(
        `Row ${i + 1}: unknown ring "${ringName}". Valid: ${Array.from(ringMap.keys()).join(", ")}`
      );
      continue;
    }

    const offsetX = 0.2 + Math.random() * 0.6;
    const offsetY = 0.2 + Math.random() * 0.6;

    await db.insert(blips).values({
      id: uuid(),
      radarId,
      quadrantId,
      ringId,
      name,
      description,
      isNew,
      offsetX,
      offsetY,
    });
    imported++;
  }

  revalidatePath(`/radar/${radarId}`);
  revalidatePath(`/radar/${radarId}/blips`);

  if (errors.length > 0) {
    return {
      imported,
      error: `Imported ${imported} blip(s) with ${errors.length} error(s):\n${errors.join("\n")}`,
    };
  }

  return { imported };
}

/** Simple CSV line parser that handles quoted fields */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

export async function deleteBlip(radarId: string, blipId: string) {
  const userId = await requireUser();
  await verifyRadarOwnership(radarId, userId);

  await db
    .delete(blips)
    .where(and(eq(blips.id, blipId), eq(blips.radarId, radarId)));

  revalidatePath(`/radar/${radarId}`);
  revalidatePath(`/radar/${radarId}/blips`);
}

export async function getBlip(radarId: string, blipId: string) {
  const userId = await requireUser();
  await verifyRadarOwnership(radarId, userId);

  return db.query.blips.findFirst({
    where: and(eq(blips.id, blipId), eq(blips.radarId, radarId)),
    with: {
      quadrant: true,
      ring: true,
    },
  });
}
