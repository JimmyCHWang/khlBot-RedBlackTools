const {isGM, numberOfPlayers, playerIdList, findGM, findUser} = require("../../db/user");
const {sendMessage, sendDM} = require("../sendMsg");
const {showStock, discardAllHands, stock, assignStock, getStock, removeOrder, draw, setOrder, showMyOrder,
    getCardsByOwner, play, showAllOrder, revertPlayRecord, drawFromGM
} = require("../../db/deck");
const {numberToText, numberArrToText, getCardNumber} = require("./printCard");

const resetDeck = require('../../db/deck.reset');
const {getPoints} = require("../../utils/getPoints");

const KMARKDOWN_TYPECODE = 9;

const showOneStock = (stockInfo, hide = false) => {
    let res = "";
    for (let i = 0; i < stockInfo.cards.length; i++) {
        if (i >= 3 && hide) {
            res += '[XXX] '
        } else {
            res += numberToText(stockInfo.cards[i]) + ' ';
        }
    }
    return res;
}

const prettifyStock = (stockInfoArr, hide = false) => {
    let res = "";
    stockInfoArr.forEach((stk) => {
        res += '卡组' + stk.stockNo + "：" + showOneStock(stk, hide) + `\n`;
    })
    return res;
}

const isNotMember = (msg) => {
    let myId = msg.authorId;
    let memberList = playerIdList();
    let isUser = isGM(myId) || memberList.some(item => item == myId);
    if (!isUser) {sendMessage(msg, "您还没有加入游戏，使用\`.join\`加入吧！", true, 'kmarkdown')}
    return !isUser;
}

const initialStock = (msg) => {
    const myId = msg.authorId;
    if (isGM(myId)) {
        const playerList = playerIdList();
        playerList.forEach(userId => {
            const cardList = draw(5, userId);
            const message = "您的手牌为：" + numberArrToText(cardList) + '\n';
            sendDM(userId, message, null, KMARKDOWN_TYPECODE);
        })
        sendMessage(msg, "所有玩家的初始手牌已发送完毕。请玩家放置顺序牌，命令为\`.orderCard [牌代码]\`或\`.顺序牌 [牌代码]\`。记得私聊！")
    } else {
        sendMessage(msg, "初始配牌需要GM权限。")
    }
}

exports.initialStock = initialStock;

const doStock = (msg) => {
    const myId = msg.authorId;
    if (isGM(myId)) {
        const currentStock = showStock();
        if (currentStock.length !== 0) {
            sendMessage(msg, "尚未完成上一次配牌！请先清空配牌区！");
        } else {
            const removedFromHands = discardAllHands();
            let message = "已移除所有玩家共计" + removedFromHands.length + "张手牌。\n";
            let newStock = stock(numberOfPlayers());
            message += '进入配牌环节。请所有玩家按照当前顺序，从以下几组中选择一组作为手牌。\n';
            message += prettifyStock(newStock, true);
            sendMessage(msg, message, false, 'kmarkdown');
            sendMessage(msg, "选取配牌请通过\`.pick [组号]\`或者\`.选择 [组号]\`，其中组号是一个数字。", false, 'kmarkdown');
        }
    } else {
        sendMessage(msg, "配牌需要GM权限。")
    }
}

exports.stock = doStock;

const resetDeckCmd = (msg) => {
    const myId = msg.authorId;
    if (isGM(myId)) {
        resetDeck();
        sendMessage(msg, "牌堆已重置。");
    } else {
        sendMessage(msg, "重置牌堆需要GM权限。");
    }
}

exports.resetDeck = resetDeckCmd;

const pickStock = (msg, args) => {
    const myId = msg.authorId;
    if (isNotMember(msg)) return;
    if (args.params.length < 2) {
        sendMessage(msg, '缺少组号！请使用\`.pick [组号]\`或者\`.选择 [组号]\`，其中组号是一个数字。', true, 'kmarkdown');
    } else {
        let stockId = args.params[1];
        let message = "";
        let myStock = getStock(stockId);
        console.log(myStock, showOneStock(myStock));
        if (myStock) {
            if (assignStock(stockId, myId)) {
                message = '选择成功！您的手牌将会通过私聊告知。\n';
                if (showStock().length !== 0) {
                    message += '现在还剩下这些卡组：\n';
                    message += prettifyStock(showStock(), true);
                } else {
                    removeOrder();
                    message += '所有卡组已经清空，顺序牌已经回收。请所有玩家放置顺序牌，命令为\`.orderCard [牌代码]\`或\`.顺序牌 [牌代码]\`。记得私聊！';
                }
                sendDM(myId, "您的手牌：" + showOneStock(myStock), null, KMARKDOWN_TYPECODE);
            } else {
                message = "程序出现问题。";
            }
        } else {
            message += '您选择的卡组不存在！\n现在还剩下这些卡组：\n';
            message += prettifyStock(showStock(), true);
        }
        sendMessage(msg, message, true, 'kmarkdown');
    }
}

exports.pickStock = pickStock;

const setOrderCard = (msg, args) => {
    const myId = msg.authorId;
    if (isNotMember(msg)) return;
    if (!showMyOrder(myId)) {
        sendMessage(msg, '您已经有顺序牌了！');
    } else if (args.params.length < 2) {
        sendMessage(msg, '缺少顺序牌！请使用\`.orderCard [牌代码]\`或\`.顺序牌 [牌代码]\`。', true, 'kmarkdown');
    } else {
        let orderCard = args.params[1];
        let orderCardNumber = getCardNumber(orderCard);
        if (orderCardNumber < 1) {
            sendMessage(msg, "您的顺序牌代码有误！请重试！")
        } else {
            if (setOrder(orderCardNumber, myId)) {
                sendMessage(msg, "设置完成！您本局面的顺序牌为" + numberToText(orderCardNumber)+ "。")
                sendDM(findGM().userid, "玩家" + msg.author.username + "已设置顺序牌。");
            } else {
                sendMessage(msg, "设置失败……这张牌或许不属于你？使用`\.myHand\`或\`.我的手牌\`来查看你当前的手牌。", true, 'kmarkdown');
            }
        }
    }
}
exports.setOrderCard = setOrderCard;

const showAllOrderCard = (msg) => {
    if (isNotMember(msg)) return;
    let message = "";
    let allOrderCards = showAllOrder();
    allOrderCards.forEach(orderCard => {
        message += findUser(orderCard.owner).name + "： " + numberToText(orderCard.cardNo) + '\n';
    })
    sendMessage(msg, message, true, 'kmarkdown');
}
exports.showAllOrderCard = showAllOrderCard;

const showMyHand = (msg, args) => {
    let myId = msg.authorId;
    if (isNotMember(msg)) return;
    if (args.flags['target'] && args.params.length >= 2 && isGM(myId)) {
        myId = args.params[1];
    }
    const myCards = getCardsByOwner(myId).map(card => card.cardNo);
    let username = findUser(myId).name || msg.author.username;
    if (myCards.length === 0) {
        sendMessage(msg,  username + "当前没有手牌！");
    } else {
        sendDM(msg.authorId, username + "当前的手牌有：" + numberArrToText(myCards), null, KMARKDOWN_TYPECODE);
    }
}
exports.showMyHand = showMyHand;

const drawCard = (msg, args) => {
    let myId = msg.authorId;
    if (isNotMember(msg)) return;
    let numOfCards = 1;
    if (args.params.length >= 2) {
        numOfCards = parseInt(args.params[1])
    }
    if (isNaN(numOfCards) || numOfCards <= 0 || numOfCards >= 6) {
        sendMessage(msg, '指定的张数无法识别！')
    } else {
        if (args.flags['gm'] || args.flags['GM']) {
            const cardsFromGM = drawFromGM(numOfCards, findGM().userid);
            const cardTexts = numberArrToText(cardsFromGM);
            if (cardsFromGM.length > 0 && msg.channelType === 'GROUP') {
                sendMessage(msg, "抽取了GM的手牌：" + cardTexts, true, 'kmarkdown');
                let gmCurrentHand = getCardsByOwner(findGM().userid).map(card => card.cardNo);
                let message = "玩家" + msg.author.username + "抽取了" + numOfCards + "张牌。\n";
                message += '现在GM的手牌为：' + numberArrToText(gmCurrentHand);
                sendDM(findGM().userid, message, null, KMARKDOWN_TYPECODE);
            } else {
                sendMessage(msg, "没有抽到GM的牌……请确保GM有足够数量的手牌，并在频道里抽取！");
            }
            return;
        }
        let isOpen = args.flags['o'] || args.flags['O'] || args.flags['open']
        const cards = draw(numOfCards, myId, isOpen);
        const cardTexts = numberArrToText(cards);
        if (isOpen && msg.channelType === 'GROUP') {
            sendMessage(msg, "从牌堆顶翻开牌：" + cardTexts, true, 'kmarkdown');
        } else {
            sendDM(myId, "从牌堆抽取手牌：" + cardTexts, null, KMARKDOWN_TYPECODE);
            sendDM(findGM().userid, "玩家" + msg.author.username + "抽取了" + numOfCards + "张牌。");
        }
    }
}
exports.drawCard = drawCard;

const playCard = (msg, args) => {
    let myId = msg.authorId;
    if (isNotMember(msg)) return;
    // 检查每一张牌都是我的
    const cardList = args.params.slice(1);
    const cardNumbers = cardList.map(card => getCardNumber(card));
    const badIdx = cardNumbers.find(number => number < 1);
    if (!badIdx) {
        const myCards = getCardsByOwner(myId);
        const notMyCard = cardNumbers.find((item) => myCards.find((cardInfo) => cardInfo.cardNo === item) === undefined);
        if (notMyCard) {
            sendMessage(msg, "错误：" + numberToText(notMyCard) + "不是你的手牌。");
        } else {
            // 都是你的手牌，可以打出了！
            let errorCard = play(cardNumbers, myId);
            if (errorCard === 0) {
                // 计算卡牌的总点数
                let unlimited = !!(args.flags['u'] || args.flags['unlimited']);
                const totalPoints = getPoints(cardNumbers, unlimited);
                sendMessage(msg, `成功出牌！出牌张数为${cardNumbers.length}。${unlimited ? '[Unlimited]' : ''}\n红法力值：${totalPoints.red}\n黑法力值：${totalPoints.black}\n通用法力值：${totalPoints.total}`)
            } else {
                sendMessage(msg, "有一张卡出现了问题。报错信息已转发给GM。");
                sendDM(findGM().userid, JSON.stringify(errorCard));
            }
        }
    } else {
        sendMessage(msg, "错误：" + badIdx + "不是一个合法的牌代码。")
    }
}
exports.playCard = playCard;

const revertCard = (msg) => {
    let myId = msg.authorId;
    if (isGM(myId)) {
        let revertResult = revertPlayRecord();
        if (revertResult) {
            sendMessage(msg, "悔牌成功。")
            sendDM(revertResult.userid, "您重新获得了手牌：" + numberArrToText(revertResult.playedCards), null, KMARKDOWN_TYPECODE);
        } else {
            sendMessage(msg, "悔牌记录为空，悔牌失败！");
        }
    } else {
        sendMessage(msg, "悔牌需要GM权限。");
    }
}

exports.revertCard = revertCard;