const KBotify = require("kbotify");
const auth = require('../configs/auth');

console.log("auth:", auth);

module.exports = new KBotify.KBotify({
    mode: 'webhook',
    token: auth.khltoken,
    port: auth.khlport,
    verifyToken: auth.khlverify,
    key: auth.khlkey,
    ignoreDecryptError: true,
});
