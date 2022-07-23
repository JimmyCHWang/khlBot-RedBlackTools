const Database = require('better-sqlite3');

const db = new Database('./db.sqlite3');

module.exports = db;