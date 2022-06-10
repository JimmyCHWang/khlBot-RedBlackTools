const KBotify = require('kbotify');

let echoKmd = require('./echo.kmd.app');

class EchoMenu extends KBotify.MenuCommand {
    code = 'echo';
    trigger = 'echo';
    help = '如需测试KMarkDown请发送".echo kmd"';

    intro = '复读菜单';
    menu = new KBotify.Card().addText('一些卡片里需要展示的东西').toString();
    useCardMenu = true; // 使用卡片菜单
}

const echoMenu = new EchoMenu(echoKmd);

module.exports = echoMenu;
