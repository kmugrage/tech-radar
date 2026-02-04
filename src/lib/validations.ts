import { z } from "zod";

export const createRadarSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

export const updateRadarSchema = createRadarSchema;

export const createBlipSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(1000).optional(),
  quadrantId: z.string().min(1, "Quadrant is required"),
  ringId: z.string().min(1, "Ring is required"),
  isNew: z.boolean().default(true),
});

export const updateBlipSchema = createBlipSchema;

export const updateQuadrantSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
});

export const updateRingSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
