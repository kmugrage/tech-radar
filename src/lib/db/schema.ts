import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ─── Auth.js tables ───

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp" }),
  image: text("image"),
  passwordHash: text("passwordHash"),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = sqliteTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })]
);

// ─── Application tables ───

export const radars = sqliteTable("radars", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const quadrants = sqliteTable("quadrants", {
  id: text("id").primaryKey(),
  radarId: text("radarId")
    .notNull()
    .references(() => radars.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  color: text("color").notNull(),
});

export const rings = sqliteTable("rings", {
  id: text("id").primaryKey(),
  radarId: text("radarId")
    .notNull()
    .references(() => radars.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  opacity: real("opacity").notNull(),
});

export const blips = sqliteTable("blips", {
  id: text("id").primaryKey(),
  radarId: text("radarId")
    .notNull()
    .references(() => radars.id, { onDelete: "cascade" }),
  quadrantId: text("quadrantId")
    .notNull()
    .references(() => quadrants.id, { onDelete: "cascade" }),
  ringId: text("ringId")
    .notNull()
    .references(() => rings.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  isNew: integer("isNew", { mode: "boolean" }).notNull().default(true),
  offsetX: real("offsetX").notNull().default(0.5),
  offsetY: real("offsetY").notNull().default(0.5),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ─── Relations ───

export const usersRelations = relations(users, ({ many }) => ({
  radars: many(radars),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const radarsRelations = relations(radars, ({ one, many }) => ({
  user: one(users, { fields: [radars.userId], references: [users.id] }),
  quadrants: many(quadrants),
  rings: many(rings),
  blips: many(blips),
}));

export const quadrantsRelations = relations(quadrants, ({ one, many }) => ({
  radar: one(radars, { fields: [quadrants.radarId], references: [radars.id] }),
  blips: many(blips),
}));

export const ringsRelations = relations(rings, ({ one, many }) => ({
  radar: one(radars, { fields: [rings.radarId], references: [radars.id] }),
  blips: many(blips),
}));

export const blipsRelations = relations(blips, ({ one }) => ({
  radar: one(radars, { fields: [blips.radarId], references: [radars.id] }),
  quadrant: one(quadrants, {
    fields: [blips.quadrantId],
    references: [quadrants.id],
  }),
  ring: one(rings, { fields: [blips.ringId], references: [rings.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
