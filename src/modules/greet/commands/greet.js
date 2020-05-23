/**
 * Send a greeting to a user in the current channel.
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

const Command = require('../../../command/Command.js');
const { user } = require('../../../command/arguments.js');

module.exports = class GreetCommand extends Command {

    /**
     * GreetCommand constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     */
    constructor() {
        super("greet", "Send a greeting to the given user.", "gagbot:greet:send", false, [user]);
    }

    /**
     * Get the greeting from the guild document and send it in the current channel.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @returns {boolean}
     */
    async execute(client, message, args) {

        // Get the user by ID
        const uid = args.get(0);
        if (!message.guild.members.cache.has(uid)) {
            message.channel.send('No such user.');
            return true;
        }
        const user = message.guild.members.cache.get(uid).user;

        client.emit('greet', message.guild, user, message.channel);

        return true;
    }
};