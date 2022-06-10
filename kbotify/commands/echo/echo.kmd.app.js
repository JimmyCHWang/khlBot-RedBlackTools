const KBotify = require("kbotify");

class EchoKmd extends KBotify.AppCommand {
    code = 'kmd'; // 只是用作标记
    trigger = 'kmd'; // 用于触发的文字
    help = '`.echo kmd 内容`'; // 帮助文字
    intro = '复读你所说的文字, 并用kmarkdown格式返回。';
    func = async (session) => {
        if (!session.args.length) {
            return session.reply(this.help);
        }
        return session.quote(`${session.args}`);
    };
}

const echoKmd = new EchoKmd();

module.exports = echoKmd;
