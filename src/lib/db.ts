import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

let _db: Database.Database | null = null;

function initDb() {
  if (_db) return;

  const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'autoclip.db');
  _db = new Database(dbPath);

  // Create tables if not exist
  _db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT, -- 'youtube' or 'upload'
      url TEXT,
      file_path TEXT,
      csv_config TEXT, -- JSON string
      status TEXT DEFAULT 'PENDING',
      results TEXT, -- JSON string
      error TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration to add 'user_id' to jobs if it doesn't exist
  try {
    _db.exec("ALTER TABLE jobs ADD COLUMN user_id TEXT");
  } catch (e) {
    // Column already exists
  }

  _db.exec(`
    CREATE TABLE IF NOT EXISTS clips (
      id TEXT PRIMARY KEY,
      job_id TEXT,
      title TEXT,
      url TEXT,
      start_time TEXT,
      end_time TEXT,
      topic TEXT,
      summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(job_id) REFERENCES jobs(id)
    )
  `);

  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      is_verified INTEGER DEFAULT 0,
      role TEXT DEFAULT 'USER',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration to add 'role' if it doesn't exist (safety for existing DBs)
  try {
    _db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'USER'");
  } catch (e) {
    // Column already exists
  }

  // Seed default admin account if no users exist
  try {
    const userCount = _db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
    if (userCount.count === 0) {
      const hashedPassword = bcrypt.hashSync("admin123", 10);
      const adminId = uuidv4();
      _db.prepare(`
        INSERT INTO users (id, email, password, is_verified, role)
        VALUES (?, ?, ?, 1, 'ADMIN')
      `).run(adminId, 'madajabbar22@gmail.com', hashedPassword);
      console.log("🌱 Default ADMIN account created: madajabbar22@gmail.com / admin123");
    }
  } catch (e) {
    console.error("Gagal membuat default admin:", e);
  }

  _db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  _db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_name TEXT,
      user_role TEXT,
      comment TEXT,
      rating INTEGER,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default settings if not present
  const seedSettings = [
    { key: 'contact_info', value: JSON.stringify({ email: 'support@autoclip.ai', address: 'Sudirman Central Business District, Jakarta', phone: '+62 812 3456 7890' }) },
    { key: 'demo_video', value: 'https://www.youtube.com/watch?v=6d2KuiZDFrg' },
    { key: 'pricing_plans', value: JSON.stringify([
        { name: 'Lite', price: '0', description: 'Ideal untuk pemula dan eksplorasi fitur dasar AI.', icon: 'Zap', features: ['5 Video / Bulan', 'Transkripsi Dasar'] },
        { name: 'Pro', price: '199.000', popular: true, description: 'Pilihan terbaik untuk kreator konten profesional.', icon: 'Rocket', features: ['Unlimited Video', 'AI Whisper High Accuracy'] },
        { name: 'Business', price: '890.000', description: 'Solusi lengkap untuk agensi dan tim kreatif.', icon: 'Building2', features: ['Multi-user Access', 'Export 4K Resolution'] }
      ]) 
    }
  ];

  const insertSetting = _db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  for (const s of seedSettings) {
    insertSetting.run(s.key, s.value);
  }

  _db.exec(`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT,
      expires_at DATETIME,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
}

const db = new Proxy({} as Database.Database, {
  get(target, prop) {
    initDb();
    const value = (_db as any)[prop];
    if (typeof value === 'function') {
      return value.bind(_db);
    }
    return value;
  }
});

export default db;
