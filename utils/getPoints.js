
const isRed = (card) => {
    return (card >= 14 && card <= 39) || card === 53
}
const isBlack = (card) => {
    return (card >= 1 && card <= 13) || (card >= 40 && card <= 53);
}
const isJoker = (card) => card === 53;

const getPoint = (card) => {
    if (isJoker(card)) return 15;
    let cardPoint = (card - 1) % 13;
    return [15,2,3,4,5,6,7,8,9,10,10,10,10][cardPoint];
}

const getPoints = (arr, unlimited = false) => {
   let red = 0;
   let black = 0;
   let total = 0;
   let largeRed = 0;
   let largeBlack = 0;
   arr.forEach(card => {
       let point = getPoint(card);
       if (isRed(card)) {
           red += point;
           if (!isJoker(card) && point > largeRed) largeRed = point;
       }
       if (isBlack(card)) {
           black += point;
           if (!isJoker(card) && point > largeBlack) largeBlack = point;
       }
       total += point;
   })
    if (unlimited) {
        red += largeBlack;
        black += largeRed;
    }
    return {
        red,
        black,
        total
    }
}

exports.getPoints = getPoints;