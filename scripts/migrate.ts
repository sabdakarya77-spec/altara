/**
 * Jalankan migrasi database saja (tanpa seed).
 * Jalankan: `pnpm db:migrate`
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL belum diset.");
  process.exit(1);
}

const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    console.log(`→ migrasi ${file}`);
    await client.query(sql);
  }

  console.log("Migrasi selesai.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
