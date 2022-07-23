const db = require('./db');
const shuffle = require('../utils/shuffle');

const refill = () => {
    db.prepare('UPDATE cards SET position = 0 WHERE owner = 0 AND position = 1').run();
}

const remainingCards = () => db.prepare('SELECT * FROM cards WHERE owner = 0 AND position = 0').all();

const disposedCards = () => db.prepare('SELECT * FROM cards WHERE owner = 0 AND position = 1').all();

const getOwner = (arr) => {
    const singleOwner = db.prepare('SELECT * FROM cards WHERE cardNo = (?)');

    const getAllOwners = db.transaction((cards) => {
        return cards.map(card => singleOwner.get(card));
    })

    return getAllOwners(arr);
}

const setOwner = (arr, owner, position = 0) => {
    const singleOwner = db.prepare('UPDATE cards SET owner = (?), position = (?) WHERE cardNo = (?)');

    const setAllOwners = db.transaction((cards) => {
        return cards.map(card => singleOwner.run(owner, position, card));
    })

    setAllOwners(arr);
}

exports.getOwner = getOwner;

const getCardsByOwner = (userId) => {
    return db.prepare('SELECT * FROM cards WHERE owner = (?) AND position = 0').all(userId);
}

const discardAllCardsByOwner = (userId) => {
    const myCards = getCardsByOwner(userId);
    const myCardNumbers = myCards.map(card => card.cardNo);
    setOwner(myCardNumbers, 0, 1);
    return myCardNumbers;
}

exports.getCardsByOwner = getCardsByOwner;
exports.discardAllCardsByOwner = discardAllCardsByOwner;

const discardAllHands = () => {
    const handedCards = db.prepare('SELECT * FROM cards WHERE NOT owner = 0 AND position = 0').all();
    const preparedCardNumbers = handedCards.map(card => card.cardNo);
    setOwner(preparedCardNumbers, 0, 1);
    return preparedCardNumbers;
}
exports.discardAllHands = discardAllHands;

const logPlayRecord = (arr, owner) => {
    const stmt = db.prepare('INSERT INTO playRecord (userid, playedCards) VALUES (?, ?)');
    stmt.run(owner, JSON.stringify(arr));
}

const showPlayRecord = (num = 5) => {
    return db.prepare('SELECT * FROM playRecord ORDER BY id DESC LIMIT (?)').all(num);
}

exports.showPlayRecord = showPlayRecord;

const revertPlayRecord = () => {
    const lastCard = db.prepare('SELECT * FROM playRecord ORDER BY id DESC LIMIT 1').get();
    if (!lastCard) return null;
    const {userid, playedCards} = lastCard;
    const playedCardsParsed = JSON.parse(playedCards);
    setOwner(playedCardsParsed, userid, 0);
    db.prepare('DELETE FROM playRecord WHERE id = (?)').run(lastCard.id);
    return lastCard;
}

exports.revertPlayRecord = revertPlayRecord;

const pickCards = (numOfCards, arr) => {
    if (arr.length < numOfCards) return [];
    let retVal = [];
    let copyArr = arr.slice();
    for (let i = 0; i < numOfCards; i++) {
        copyArr = shuffle(copyArr);
        retVal.push((copyArr.splice(Math.floor(Math.random() * copyArr.length), 1))[0]);
    }
    return retVal;
}

const draw = (numOfCards, owner, isOpen = false) => {
    const remainingCard = remainingCards();
    let preparedCards;
    if (remainingCard.length < numOfCards) {
        const neededCards = numOfCards - remainingCard.length;
        const disposedCardsArr = disposedCards();
        preparedCards = remainingCard.concat(pickCards(neededCards, disposedCardsArr));
        refill();
    } else {
        preparedCards = pickCards(numOfCards, remainingCard);
    }
    const preparedCardNumbers = preparedCards.map(card => card.cardNo);

    if (isOpen) {
        setOwner(preparedCardNumbers, 0, 1);
    } else {
        setOwner(preparedCardNumbers, owner, 0);
    }

    return preparedCards.map(card => card.cardNo);
}

exports.draw = draw;

const play = (arr, userId) => {
    const cardOwner = getOwner(arr);
    if (cardOwner.every(card => card.owner == userId && card.position === 0)) {
        setOwner(arr, 0, 1);
        logPlayRecord(arr, userId);
        return 0; // 表示没有问题
    }
    return cardOwner.find(card => card.owner != userId); //表示错误的卡
}

exports.play = play;

const orderCard = (card, userId) => {
    const cardOwner = getOwner([card]);
    if (cardOwner.length > 0) {
        let item = cardOwner[0];
        if (item.owner == userId && item.position === 0) {
            setOwner([card], userId, 1);
            return true;
        }
    }
    return false;
}

exports.setOrder = orderCard;

const showMyOrder = (userId) => {
    return db.prepare('SELECT * FROM cards WHERE owner = (?) AND position = 1').all(userId);
}
exports.showMyOrder = showMyOrder;

const showAllOrder = () => {
    return db.prepare('SELECT * FROM cards WHERE NOT owner = 0 AND position = 1').all();
}

exports.showAllOrder = showAllOrder;

const removeOrder = () => {
    const orderCards = showAllOrder();
    const orderCardNumbers = orderCards.map(card => card.cardNo);
    setOwner(orderCardNumbers, 0, 1);
}

exports.removeOrder = removeOrder;

const clearStock = () =>  {
    const stockCards = db.prepare('SELECT * FROM stockCards').all();
    stockCards.forEach(stockCardInfo => {
        const cards = JSON.parse(stockCardInfo.cards);
        setOwner(cards, 0, 1);
    })
    db.prepare('DELETE FROM stockCards WHERE 1=1').run();
    return stockCards.length * 5;
}

exports.clearStock = clearStock;

const showStock = () => {
    const stockStats = db.prepare('SELECT * FROM stockCards').all();
    return stockStats.map((row) => ({
        stockNo: row.stockNo,
        cards: JSON.parse(row.cards)
    }));
}

exports.showStock = showStock;

const getStock = (stockNo) => {
    let result = db.prepare('SELECT * FROM stockCards WHERE stockNo = (?)').get(stockNo);
    if (result) {
        result.cards = JSON.parse(result.cards);
        return result;
    } else return result;
}

exports.getStock = getStock;

const assignStock = (stockNo, userId) => {
    const hasStock = db.prepare('SELECT * FROM stockCards WHERE stockNo = (?)').get(stockNo);
    if (hasStock) {
        db.prepare('DELETE FROM stockCards WHERE stockNo = (?)').run(stockNo);
        const cards = JSON.parse(hasStock.cards);
        setOwner(cards, userId, 0);
        return hasStock;
    }
    return null;
}

exports.assignStock = assignStock;

const stock = (numOfPeople) => {
    const remainingCard = remainingCards();
    const requiredCards = numOfPeople * 5;
    let preparedCards;
    if (remainingCard.length < requiredCards) {
        const neededCards = requiredCards - remainingCard.length;
        const disposedCardsArr = disposedCards();
        preparedCards = remainingCard.concat(pickCards(neededCards, disposedCardsArr));
        refill();
    } else {
        preparedCards = pickCards(requiredCards, remainingCard);
    }

    const preparedCardNumbers = preparedCards.map(card => card.cardNo);
    setOwner(preparedCardNumbers, 0, 2);
    const shuffled = shuffle(preparedCardNumbers)

    const insertStmt = db.prepare('INSERT INTO stockCards (stockNo, cards) VALUES (?, ?)');

    const trans = db.transaction((cards) => {
        for (let i = 0; i < numOfPeople; i++) {
            insertStmt.run(i+1, JSON.stringify(cards.slice(i*5, i*5+5)));
        }
    })

    trans(shuffled);

    return showStock();

}

exports.stock = stock;

const drawFromGM = (numOfCards, gmId) => {
    const gmCards = getCardsByOwner(gmId).map(card => card.cardNo);
    if (gmCards.length >= numOfCards) {
        const picked = pickCards(numOfCards, gmCards);
        setOwner(picked, 0, 1);
        return picked;
    }
    return [];
}
exports.drawFromGM = drawFromGM;
