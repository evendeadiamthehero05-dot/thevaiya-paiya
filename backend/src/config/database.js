const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database in project root
const dbPath = path.join(__dirname, '../../game.db');

// Create and initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log(`SQLite database connected at: ${dbPath}`);
    initializeDatabase();
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Store original sqlite3 methods
const originalRun = db.run.bind(db);
const originalAll = db.all.bind(db);
const originalGet = db.get.bind(db);

// Support both callback and no-callback modes
db.run = function(sql, params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = [];
  } else if (!params) {
    params = [];
  }
  return originalRun.call(this, sql, params, callback);
};

db.get = function(sql, params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = [];
  } else if (!params) {
    params = [];
  }
  return originalGet.call(this, sql, params, callback);
};

db.all = function(sql, params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = [];
  } else if (!params) {
    params = [];
  }
  return originalAll.call(this, sql, params, callback);
};

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Create rooms table
    db.run(`
      CREATE TABLE IF NOT EXISTS rooms (
        room_id TEXT PRIMARY KEY,
        status TEXT CHECK(status IN ('waiting', 'playing', 'ended')) DEFAULT 'waiting',
        current_seeker_id TEXT,
        current_role_index INTEGER DEFAULT 0,
        last_accused_player TEXT,
        timer_ends_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create players table
    db.run(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id TEXT NOT NULL,
        uid TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT,
        points INTEGER DEFAULT 0,
        has_revealed INTEGER DEFAULT 0,
        is_host INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(room_id, uid),
        FOREIGN KEY(room_id) REFERENCES rooms(room_id)
      )
    `);

    // Create indexes
    db.run('CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status)');

    // Create dares table
    db.run(`
      CREATE TABLE IF NOT EXISTS dares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL UNIQUE,
        classroom_safe INTEGER DEFAULT 1,
        used_count INTEGER DEFAULT 0
      )
    `, () => {
      seedDares();
    });
  });
}

// Seed 20 classroom-safe dares
function seedDares() {
  const dares = [
    'Sing the national anthem',
    'Do your best celebrity impression',
    'Tell a joke',
    'Do 10 pushups',
    'Speak in a British accent for 30 seconds',
    'Say the alphabet backwards',
    'Do a dance',
    'High-five everyone in the room',
    'Compliment the person to your left',
    'Say everything backwards for 30 seconds',
    'Pretend to be a dinosaur',
    'Read a text message in a funny voice',
    'Stand on one leg and sing',
    'Do your best animal impression',
    'Recite a tongue twister fast',
    'Describe your day using only emojis',
    'Do a handstand (or try!)',
    'Narrate your next action like a sports commentator',
    'Do your best robot impression',
    'Sing Happy Birthday loudly',
  ];

  dares.forEach((dare) => {
    db.run(
      'INSERT OR IGNORE INTO dares (text, classroom_safe, used_count) VALUES (?, 1, 0)',
      [dare],
      (err) => {
        if (err && !err.message.includes('UNIQUE constraint')) {
          console.error('Error inserting dare:', err);
        }
      }
    );
  });
}

module.exports = { db };
