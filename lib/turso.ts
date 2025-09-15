// Turso Database Configuration
import { createClient } from "@libsql/client";

declare global {
  var __tursoClient: ReturnType<typeof createClient> | undefined;
}

export const tursoClient = globalThis.__tursoClient ?? createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

if (process.env.NODE_ENV !== "production") {
  globalThis.__tursoClient = tursoClient;
}

// Test connection function
export async function testTursoConnection() {
  try {
    const result = await tursoClient.execute("SELECT 1 as test");
    console.log("✅ Turso connection successful:", result.rows);
    return true;
  } catch (error) {
    console.error("❌ Turso connection failed:", error);
    return false;
  }
}