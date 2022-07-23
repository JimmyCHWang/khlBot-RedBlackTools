let bot = require('./init/client');
const { printCard, printPoints} = require("./commands/printCard");

const getArgs = require('../utils/getArgs');
const {joinGM, joinUser, allUsers, leave, resetUser, getGM, whoami} = require("./commands/user");
const {resetDeck, stock, pickStock, setOrderCard, showMyHand, playCard, initialStock, drawCard, showAllOrderCard,
    revertCard
} = require("./commands/deck");
const {sendMessage} = require("./sendMsg");

module.exports = () => {
    bot.messageSource.on('message', (e) => {
        bot.logger.debug(`received:`, e);
    });

    bot.message.on('text', (msg) => {
        let content = msg.content;
        let subCommand = "";
        if (content.startsWith('.')) {
            subCommand = content.substring(1);
        } else if (content.startsWith('。')) {
            subCommand = content.substring(1);
        }
        if (subCommand) {
            const func = subCommand.split(' ');
            if (func.length === 0) return;
            const args = getArgs(func);
            console.log(args);
            switch (args.params[0]) {
                case 'card':
                case '卡牌':
                    printCard(msg, args);
                    break;
                case 'points':
                case '点数':
                    printPoints(msg, args);
                    break;
                case '加入':
                case 'join':
                    if (args.flags['GM']) {
                        joinGM(msg, args);
                    } else {
                        joinUser(msg);
                    }
                    break;
                case '所有玩家':
                case 'allUsers':
                    allUsers(msg);
                    break;
                case '退出':
                case 'leave':
                    leave(msg);
                    break;
                case '重置用户':
                case 'resetUser':
                    resetUser(msg);
                    break;
                case '查询GM':
                case 'whoisGM':
                    getGM(msg);
                    break;
                case '我是谁':
                case 'whoami':
                    whoami(msg);
                    break;
                case '重置牌堆':
                case 'resetDeck':
                    resetDeck(msg);
                    break;
                case 'initStock':
                case '初始配牌':
                    initialStock(msg);
                    break;
                case '配牌':
                case 'stock':
                    stock(msg);
                    break;
                case '选择':
                case 'pick':
                    pickStock(msg, args);
                    break;
                case 'orderCard':
                case '顺序牌':
                    setOrderCard(msg, args);
                    break;
                case 'showOrder':
                case '查看顺序':
                    showAllOrderCard(msg);
                    break
                case 'myHand':
                case '我的手牌':
                    showMyHand(msg, args);
                    break;
                case 'play':
                case '打出':
                case '打牌':
                    playCard(msg, args);
                    break;
                case 'draw':
                case '抽牌':
                case '抽卡':
                    drawCard(msg, args);
                    break;
                case 'revertPlay':
                case '悔牌':
                    revertCard(msg);
                    break;
                default:
                    sendMessage(msg, "未知命令。");
            }
        }
    })

    bot.connect();

    bot.logger.debug('system init success');
}
