const db = require("./db");
module.exports = function () {

    db.prepare('DELETE FROM cards WHERE 1=1').run();
    db.prepare('DELETE FROM playRecord WHERE 1=1').run();
    db.prepare('DELETE FROM stockCards WHERE 1=1').run();

    const dbs = db.prepare("INSERT INTO cards (cardNo, card, owner, position, point, color) VALUES (?, ?, ?, ?, ?, ?)");

    const suits = ["\u2660", "\u2661", "\u2662", "\u2663"]
    const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const points = [15, 2,3,4,5,6,7,8,9,10,10,10,10];

    suits.forEach((suit, suitIdx) => {
        cards.forEach((card, cardIdx) => {
            const nextCard = suit + card;
            const cardId = suitIdx * cards.length + cardIdx + 1;
            const point = points[cardIdx];
            const color = (suitIdx < 2) ? 0 : 1;
            dbs.run(cardId, nextCard, 0, 0, point, color);
        })
    })

    dbs.run(53, "JOKER", 0, 0, 15, 2);

    console.log("Now card deck length = ", db.prepare('SELECT * FROM cards').all().length);

    // owner表示持有者Id (userid)。0为牌堆或弃牌堆。
    // position项，如果有持有者，那么0表示手牌，1表示顺序牌；如果没有持有者，0表示在牌堆中，1表示在弃牌堆中
}