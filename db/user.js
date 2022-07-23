const db = require('./db');

const reset = () => {
    db.prepare('DELETE FROM users WHERE 1=1').run();
}

const leave = (userId) => {
    db.prepare('DELETE FROM users WHERE userid = (?)').run(userId);
}

const findUser = (userId) => {
    return db.prepare('SELECT * FROM users WHERE userid = (?)').get(userId);
}

const isGM = (userId) => {
    let user = findUser(userId);
    return user && user.role === 1;
}

const findGM = () => {
    return db.prepare('SELECT userid FROM users WHERE role = 1').get();
}

exports.findGM = findGM;

const numberOfPlayers = () => {
    return (db.prepare('SELECT * FROM users').all()).length;
}

const playerIdList = () => {
    return (db.prepare('SELECT userid FROM users WHERE NOT role = 1').all()).map(row => row.userid);
}

const playerNames = () => {
    return (db.prepare('SELECT name FROM users WHERE NOT role = 1').all()).map(row => row.name);
}

const findUserByName = (username) => {
    return db.prepare('SELECT * FROM users WHERE name = (?)').get(username);
}
exports.findUserByName = findUserByName;

exports.playerNames = playerNames;

exports.playerIdList = playerIdList;

exports.reset = reset;

exports.leave = leave;

exports.findUser = findUser;

exports.isGM = isGM;

exports.numberOfPlayers = numberOfPlayers;

exports.join = (username, userId, role) => {
    if (role !== 0 && role !== 1) return false;
    try {
        const hasGM = db.prepare('SELECT * FROM users WHERE role = 1').get();
        if (!hasGM) {
            return false;
        }
        if (findUser(userId)) {
            leave(userId);
        }
        const join = db.prepare('INSERT INTO users (name, userid, role) VALUES (?, ?, ?)');
        join.run(username, userId, role);
        return true;
    } catch (e) {
        return false;
    }
}