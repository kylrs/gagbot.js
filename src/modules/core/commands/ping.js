/**
 * Ping! Used to check that the bot is available.
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.0.0
 * @version v1.2.0
 */

const Command = require('../../../command/Command.js');

module.exports = class PingCommand extends Command {

    /**
     * PingCommand constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     */
    constructor() {
        super("ping", "Ping!", "gagbot:core:ping", true);
    }

    /**
     * Reply to the command with "Pong!".
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @returns {boolean}
     */
    execute(client, message, args) {
        message.channel.send('Pong!');
        return true;
    }
};