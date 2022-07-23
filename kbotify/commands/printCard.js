const {sendMessage} = require("../sendMsg");
const {getPoints} = require("../../utils/getPoints");

const numberToText = (cardNumber) => {
    if (cardNumber <= 0 || cardNumber >= 54) return "数字无法识别";
    //if (cardNumber === 53) return "JOKER";
    if (cardNumber === 53) return ":black_joker:";
    const value = (cardNumber - 1) % 13 + 1;
    const valueText = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"][value-1];

    const suit = Math.floor((cardNumber - 1) / 13.0);
    //const suitText = ["黑桃", "红桃", "方片", "梅花"][suit];

    const suitText = [":spades:", ":hearts:", ":diamonds:", ":clubs:"][suit];

    return suitText + valueText;
}

exports.numberToText = numberToText;

const numberArrToText = (arr) => {
    return arr.map(card => numberToText(card)).join(" ");
}
exports.numberArrToText = numberArrToText;

const suitToTier = (suit) => {
    return ({
        's': 0,
        'h': 1,
        'd': 2,
        'c': 3
    })[suit]
}

const numberCharToNumber = (cardChar) => {
    if (cardChar >= '2' && cardChar <= '9' && cardChar.length === 1) return cardChar.charCodeAt(0) - 48;
    switch (cardChar) {
        case 'A':
            return 1;
        case '10':
        case 'T':
            return 10;
        case 'J':
            return 11;
        case 'Q':
            return 12;
        case 'K':
            return 13;
        default:
            return -999;
    }
}

const chsSuitToNumber = (chsSuit) => {
    switch (chsSuit) {
        case '黑桃':
        case '♠':
            return 0;
        case '红桃':
        case '红心':
        case '♥':
            return 1;
        case '方块':
        case '方片':
        case '♦':
            return 2;
        case '梅花':
        case '草花':
        case '♣':
            return 3;
        default:
            return -999;
    }
}

const getCardNumber = (card) => {
    let number = -1;
    let chsRegexTester = new RegExp('^(黑桃|红桃|方片|梅花|红心|方块|草花|♠|♥|♦|♣)([A23456789TJQK]|(10))$', 'u');
    if (/^[A23456789TJQK][shdc]$/.test(card)) {
        let numberChar = card.charAt(0);
        number = suitToTier(card.charAt(1)) * 13 + numberCharToNumber(numberChar);
    } else if (/^10[shdc]$/.test(card)) {
        number = suitToTier(card.charAt(2)) * 13 + 10;
    } else if (card === 'JOKER' || card === '鬼' || card === '鬼牌' || card === '王牌') {
        number = 53;
    } else if (chsRegexTester.test(card)) {
        let matchResult = card.match(chsRegexTester)
        number = chsSuitToNumber(matchResult[1]) * 13 + numberCharToNumber(matchResult[2]);
    }
    return number;
}

exports.getCardNumber = getCardNumber;

const printCard = (msg, args) => {
    let content = "结果：";
    for (let i = 1; i < args.params.length; i++) {
        const card = args.params[i];
        const number = getCardNumber(card);
        if (number > 0) {
            content += numberToText(number);
        } else {
            content += "无法识别的卡牌"
        }
        content += ' ';
    }
    sendMessage(msg, content, true, 'kmarkdown');
}

const printPoints = (msg, args) => {
    const cardList = args.params.slice(1);
    const cardNumbers = cardList.map(card => getCardNumber(card));
    const badIdx = cardNumbers.find(number => number < 1);
    if (!badIdx) {
        let unlimited = !!(args.flags['u'] || args.flags['unlimited']);
        const totalPoints = getPoints(cardNumbers, unlimited);
        sendMessage(msg, `出牌张数为${cardNumbers.length}。${unlimited ? '[Unlimited]' : ''}\n红法力值：${totalPoints.red}\n黑法力值：${totalPoints.black}\n通用法力值：${totalPoints.total}`)
    } else {
        sendMessage(msg, "错误：" + badIdx + "不是一个合法的牌代码。")
    }
}

exports.printCard = printCard;
exports.printPoints = printPoints;
