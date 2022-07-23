module.exports = function() {

    const db = require('./db');

    db.prepare(`CREATE TABLE IF NOT EXISTS users (
        name TEXT,
        userid INTEGER,
        role INTEGER
        )`).run();
    db.prepare(`CREATE TABLE IF NOT EXISTS cards (cardNo INTEGER, card TEXT, owner INTEGER, position INTEGER, point INTEGER, color INTEGER)`).run();
    db.prepare(`CREATE TABLE IF NOT EXISTS stockCards (
        stockNo INTEGER,
        cards TEXT
        )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS playRecord (
        id INTEGER PRIMARY KEY,
        userid INTEGER,
        playedCards TEXT
    )`).run();

    const cards = db.prepare('SELECT * FROM cards').all();

    if (cards.length !== 53) {
        const deckReset = require('./deck.reset');
        deckReset();
    }

};