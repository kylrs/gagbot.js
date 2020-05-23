/**
 * Set the greeting sent to new users on join.
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

const Command = require('../../../command/Command.js');
const { str } = require('../../../command/arguments.js');

module.exports = class GreetMessageCommand extends Command {

    /**
     * GreetMessageCommand constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     */
    constructor() {
        super("greetmessage", "Set the greeting message.", "gagbot:greet:set", false, [str]);
    }

    /**
     * Set the guild's greeting message in the database.
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
        const gid = message.guild.id;

        const doc = await client.db.guild.findOne({id: gid});
        if (!doc) {
            message.channel.send(`***${client.config.errorMessage}***\n Something went wrong...`);
            console.error(`Error while setting greeting:\n  Couldn't find a guild document with {id: ${gid}}`);
            return true;
        }

        if (!doc.data.greet) doc.data.greet = {};

        doc.data.greet.message = args.get(0);
        doc.markModified('data');
        await doc.save(function(err) {
            if (err) {
                message.channel.send(`***${client.config.errorMessage}***\n Something went wrong...`);
                console.error(`Error while setting greeting:\n  Couldn't save the guild document.`);
            }

            message.channel.send('Greeting set.');
        });

        return true;
    }
};