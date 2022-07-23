const bot = require('./init/client');

const sendDM = (targetId, content, msgId=null, type=1) => {
    bot.API.userChat.create(targetId);
    if (msgId) {
        bot.API.directMessage.create(type, targetId, null, content);
    } else {
        bot.API.directMessage.create(type, targetId, null, content, msgId);
    }
}

exports.sendDM = sendDM;

const sendGroup = (targetId, content, msgId = null, type) => {
    if (msgId) {
        bot.API.message.create(type, targetId, content, msgId);
    } else {
        bot.API.message.create(type, targetId, content, msgId);
    }
}

exports.sendGroup = sendGroup;

const typeToCode = (typeStr) => {
    switch (typeStr) {
        case 'text':
            return 1;
        case 'kmarkdown':
            return 9;
        case 'card':
            return 10;
        default:
            return 1;
    }
}

const sendMessage = (msg, content, reply = true, type = 'text') => {
    if (msg.channelType === 'PERSON') {
        sendDM(msg.authorId, content, (reply ? msg.msgId : null), typeToCode(type));
    } else if (msg.channelType === 'GROUP') {
        sendGroup(msg.channelId, content, (reply ? msg.msgId : null), typeToCode(type));
    }
}

exports.sendMessage = sendMessage;
