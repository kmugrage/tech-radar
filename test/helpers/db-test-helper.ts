import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

/**
 * Create a test database instance in memory
 */
export function createTestDb() {
  const sqlite = new Database(':memory:');
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  const db = drizzle(sqlite, { schema });

  // Create tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      emailVerified INTEGER,
      image TEXT,
      passwordHash TEXT
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      providerAccountId TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      sessionToken TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      expires INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS verificationTokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires INTEGER NOT NULL,
      PRIMARY KEY (identifier, token)
    );

    CREATE TABLE IF NOT EXISTS radars (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quadrants (
      id TEXT PRIMARY KEY,
      radarId TEXT NOT NULL,
      name TEXT NOT NULL,
      position INTEGER NOT NULL,
      color TEXT NOT NULL,
      FOREIGN KEY (radarId) REFERENCES radars(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rings (
      id TEXT PRIMARY KEY,
      radarId TEXT NOT NULL,
      name TEXT NOT NULL,
      position INTEGER NOT NULL,
      opacity REAL NOT NULL,
      FOREIGN KEY (radarId) REFERENCES radars(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS blips (
      id TEXT PRIMARY KEY,
      radarId TEXT NOT NULL,
      quadrantId TEXT NOT NULL,
      ringId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      isNew INTEGER NOT NULL DEFAULT 1,
      offsetX REAL NOT NULL,
      offsetY REAL NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (radarId) REFERENCES radars(id) ON DELETE CASCADE,
      FOREIGN KEY (quadrantId) REFERENCES quadrants(id) ON DELETE CASCADE,
      FOREIGN KEY (ringId) REFERENCES rings(id) ON DELETE CASCADE
    );
  `);

  return { db, sqlite };
}

/**
 * Create a test user
 */
export async function createTestUser(
  db: ReturnType<typeof createTestDb>['db'],
  overrides: Partial<{
    id: string;
    name: string;
    email: string;
    password: string;
  }> = {}
) {
  const userId = overrides.id || uuidv4();
  const password = overrides.password || 'TestPassword123!';
  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(schema.users).values({
    id: userId,
    name: overrides.name || 'Test User',
    email: overrides.email || `test-${userId}@example.com`,
    passwordHash,
    emailVerified: null,
    image: null,
  });

  return { userId, password };
}

/**
 * Create a test radar with default quadrants and rings
 */
export async function createTestRadar(
  db: ReturnType<typeof createTestDb>['db'],
  userId: string,
  overrides: Partial<{
    id: string;
    name: string;
    description: string;
  }> = {}
) {
  const radarId = overrides.id || uuidv4();
  const now = Date.now();

  await db.insert(schema.radars).values({
    id: radarId,
    userId,
    name: overrides.name || 'Test Radar',
    description: overrides.description || null,
    createdAt: now,
    updatedAt: now,
  });

  // Create default quadrants
  const quadrants = [
    { name: 'Techniques', position: 0, color: '#8B5CF6' },
    { name: 'Platforms', position: 1, color: '#06B6D4' },
    { name: 'Tools', position: 2, color: '#10B981' },
    { name: 'Languages & Frameworks', position: 3, color: '#F59E0B' },
  ];

  const quadrantIds: string[] = [];
  for (const q of quadrants) {
    const qId = uuidv4();
    await db.insert(schema.quadrants).values({
      id: qId,
      radarId,
      ...q,
    });
    quadrantIds.push(qId);
  }

  // Create default rings
  const rings = [
    { name: 'Adopt', position: 0, opacity: 0.9 },
    { name: 'Trial', position: 1, opacity: 0.7 },
    { name: 'Assess', position: 2, opacity: 0.5 },
    { name: 'Hold', position: 3, opacity: 0.3 },
  ];

  const ringIds: string[] = [];
  for (const r of rings) {
    const rId = uuidv4();
    await db.insert(schema.rings).values({
      id: rId,
      radarId,
      ...r,
    });
    ringIds.push(rId);
  }

  return { radarId, quadrantIds, ringIds };
}

/**
 * Create a test blip
 */
export async function createTestBlip(
  db: ReturnType<typeof createTestDb>['db'],
  radarId: string,
  quadrantId: string,
  ringId: string,
  overrides: Partial<{
    id: string;
    name: string;
    description: string;
    isNew: boolean;
    offsetX: number;
    offsetY: number;
  }> = {}
) {
  const blipId = overrides.id || uuidv4();
  const now = Date.now();

  await db.insert(schema.blips).values({
    id: blipId,
    radarId,
    quadrantId,
    ringId,
    name: overrides.name || 'Test Blip',
    description: overrides.description || null,
    isNew: overrides.isNew !== undefined ? (overrides.isNew ? 1 : 0) : 1,
    offsetX: overrides.offsetX ?? 0.5,
    offsetY: overrides.offsetY ?? 0.5,
    createdAt: now,
    updatedAt: now,
  });

  return { blipId };
}

/**
 * Clean up test database
 */
export function cleanupTestDb(sqlite: Database.Database) {
  sqlite.close();
}
