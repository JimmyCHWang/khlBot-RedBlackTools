const {isGM, findUser, reset, join, findGM, numberOfPlayers, playerNames, leave} = require('../../db/user');
const {sendMessage} = require("../sendMsg");
const {discardAllCardsByOwner} = require("../../db/deck");
const {numberArrToText} = require("./printCard");

const resetUser = (msg) => {
    const myId = msg.authorId;
    if (isGM(myId)) {
        reset();
        sendMessage(msg, "已完成重置。", true);
    } else {
        sendMessage(msg, "您不是GM，没有操作权限！", true);
    }
}

exports.resetUser = resetUser;

const joinUser = (msg) => {
    const myId = msg.authorId;
    if (!findGM()) {
        sendMessage(msg, 'GM还未加入，请GM先加入游戏！');
        return;
    }
    if (findUser(myId)) {
        sendMessage(msg, "您已经加入过了！", true);
    } else {
        if (join(msg.author.username, myId, 0)) {
            sendMessage(msg, "加入成功！用户名：" + msg.author.username, true)
        } else {
            sendMessage(msg, "加入不成功，请管理员查看log！");
        }
    }
}

exports.joinUser = joinUser;

const joinGM = (msg, args) => {
    const myId = msg.authorId;
    if (findUser(myId)) {
        sendMessage(msg, "您已经加入过了！", true);
    } else {
        if (args.params[1] === process.env.GM_KEY) {
            if (join(msg.author.username, myId, 1)) {
                sendMessage(msg, "您已注册为GM！", true);
            } else {
                sendMessage(msg, "加入不成功！", true)
            }
        } else {
            sendMessage(msg, "缺少或不合法的GM_KEY参数！", true);
        }
    }
}

exports.joinGM = joinGM;

const leaveGame = (msg) => {
    const myId = msg.authorId;
    if (findUser(myId)) {
        const result = discardAllCardsByOwner(myId);
        leave(myId);
        let message = "您已退出游戏！";
        if (result.length > 0) {
            message += "以下牌被舍弃：" + numberArrToText(result)
        }
        sendMessage(msg, message);
    } else {
        sendMessage(msg, "您未加入过游戏！");
    }
}

exports.leave = leaveGame;

const getGM = (msg) => {
    const GMinfo = findGM();
    if (GMinfo) {
        sendMessage(msg, "(met)" + GMinfo.userid + "(met)", true, 'kmarkdown')
    } else {
        sendMessage(msg, "当前系统没有GM！");
    }
}

exports.getGM = getGM;

const allUsers = (msg) => {
    if (numberOfPlayers() === 0) {
        sendMessage(msg, "当前没有玩家在游戏中！");
    } else {
        let message = "GM:" + findUser(findGM().userid).name + "\n";
        message += '玩家列表：' + playerNames().join(", ");
        sendMessage(msg, message);
    }
}
exports.allUsers = allUsers;

const whoami = (msg) => {
    const myId = msg.authorId;
    let myInfo = findUser(myId);
    if (myInfo) {
        let myName = myInfo.name;
        let myRole = myInfo.role === 0 ? '玩家' : (myInfo.role === 1 ? 'GM' : '错误')
        sendMessage(msg, "名称：" + myName + '\n权限：'+myRole);
    } else {
        sendMessage(msg, "您不在游戏中！");
    }
}
exports.whoami = whoami;
