let bot = require('./init/client');
let echoMenu = require('./commands/echo/echo.menu');

module.exports = () => {
    bot.messageSource.on('message', (e) => {
        bot.logger.debug(`received:`, e);
    });

    bot.addCommands(echoMenu);

    bot.connect();

    bot.logger.debug('system init success');
}
