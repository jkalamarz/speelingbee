const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new DatabaseSync(path.join(dataDir, 'speelingbee.db'));

function initialize() {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS players (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS progress (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id     INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      stage         TEXT NOT NULL,
      mode          TEXT NOT NULL,
      word          TEXT NOT NULL,
      correct_count INTEGER NOT NULL DEFAULT 0,
      total_count   INTEGER NOT NULL DEFAULT 0,
      UNIQUE(player_id, stage, mode, word)
    );
  `);
  const cols = db.prepare('PRAGMA table_info(progress)').all();
  if (!cols.some(c => c.name === 'total_count')) {
    db.exec('ALTER TABLE progress ADD COLUMN total_count INTEGER NOT NULL DEFAULT 0');
  }
}

function getAllPlayers() {
  return db.prepare('SELECT id, name FROM players ORDER BY name').all();
}

function createPlayer(name) {
  const stmt = db.prepare('INSERT INTO players (name) VALUES (?)');
  const info = stmt.run(name);
  return { id: Number(info.lastInsertRowid), name };
}

function getProgress(playerId, stage, mode) {
  return db.prepare(
    'SELECT word, correct_count FROM progress WHERE player_id = ? AND stage = ? AND mode = ?'
  ).all(playerId, stage, mode);
}

function getStageProgress(playerId, stage) {
  return db.prepare(`
    SELECT word,
           SUM(correct_count) AS correct_count,
           SUM(total_count)   AS total_count
    FROM progress
    WHERE player_id = ? AND stage = ?
    GROUP BY word
  `).all(playerId, stage);
}

function recordAnswer(playerId, stage, mode, word, correct) {
  if (correct) {
    db.prepare(`
      INSERT INTO progress (player_id, stage, mode, word, correct_count, total_count)
      VALUES (?, ?, ?, ?, 1, 1)
      ON CONFLICT(player_id, stage, mode, word)
      DO UPDATE SET correct_count = correct_count + 1, total_count = total_count + 1
    `).run(playerId, stage, mode, word);
  } else {
    db.prepare(`
      INSERT INTO progress (player_id, stage, mode, word, correct_count, total_count)
      VALUES (?, ?, ?, ?, 0, 1)
      ON CONFLICT(player_id, stage, mode, word)
      DO UPDATE SET total_count = total_count + 1
    `).run(playerId, stage, mode, word);
  }
  const row = db.prepare(
    'SELECT correct_count FROM progress WHERE player_id = ? AND stage = ? AND mode = ? AND word = ?'
  ).get(playerId, stage, mode, word);
  const correct_count = row ? Number(row.correct_count) : 0;
  return { word, correct_count, mastered: correct_count >= 2 };
}

module.exports = { initialize, getAllPlayers, createPlayer, getProgress, getStageProgress, recordAnswer };
