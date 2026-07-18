const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = new Database("./data/expers.db");

const email = "info@expers.ru";
const existing = db.prepare("SELECT id, role FROM experts WHERE email = ?").get(email);

if (existing) {
  db.prepare("UPDATE experts SET role = ? WHERE email = ?").run("admin", email);
  console.log(`Роль обновлена: ${email} → admin (было: ${existing.role})`);
} else {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const passwordHash = bcrypt.hashSync("admin123", 10);
  db.prepare(
    "INSERT INTO experts (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(id, "Администратор", email, passwordHash, "admin", now, now);
  console.log(`Создан админ: ${email} / admin123`);
}

db.close();
