import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "fs";
import { dirname } from "path";
import * as schema from "./schema";

const DB_PATH = process.env.DB_PATH || "./data/expers.db";

const globalForDb = globalThis as unknown as {
  _sqlite: Database.Database | undefined;
  _drizzle: ReturnType<typeof drizzle> | undefined;
  _dbAvailable: boolean | null;
  _initLock: boolean;
};

function initDb() {
  if (globalForDb._initLock) {
    let waited = 0;
    while (!globalForDb._drizzle && !globalForDb._sqlite) {
      const waitStart = Date.now();
      while (Date.now() - waitStart < 100) {
        if (globalForDb._drizzle || globalForDb._sqlite) break;
      }
      waited += 100;
      if (waited > 30000) {
        globalForDb._initLock = false;
        throw new Error("DB init timeout after 30s");
      }
    }
    return;
  }
  globalForDb._initLock = true;

  try {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    const sqlite = new Database(DB_PATH);

    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("busy_timeout = 5000");
    sqlite.pragma("foreign_keys = ON");
    sqlite.pragma("cache_size = -64000");
    sqlite.pragma("synchronous = NORMAL");
    sqlite.pragma("mmap_size = 268435456");
    sqlite.pragma("temp_store = MEMORY");
    sqlite.pragma("wal_autocheckpoint = 1000");

    const drz = drizzle(sqlite, { schema });

    globalForDb._sqlite = sqlite;
    globalForDb._drizzle = drz;
  } catch (err) {
    console.error("Failed to initialize database:", err);
    globalForDb._initLock = false;
  }
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    if (!globalForDb._drizzle) initDb();
    return (globalForDb._drizzle as ReturnType<typeof drizzle>)[
      prop as keyof ReturnType<typeof drizzle>
    ];
  },
});

export async function isDatabaseAvailable(): Promise<boolean> {
  if (process.env.USE_DATABASE === "false") {
    return false;
  }
  if (globalForDb._dbAvailable != null) {
    return globalForDb._dbAvailable;
  }
  try {
    if (!globalForDb._drizzle) initDb();
    globalForDb._sqlite!.prepare("SELECT 1").get();
    globalForDb._dbAvailable = true;
    return true;
  } catch {
    console.warn("Database is not available. Running in static mode.");
    globalForDb._dbAvailable = false;
    return false;
  }
}

export function resetDbAvailableCache(): void {
  globalForDb._dbAvailable = null;
}
