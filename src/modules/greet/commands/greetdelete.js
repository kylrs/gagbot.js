/**
 * Stop greeting users.
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

const Command = require('../../../command/Command.js');

module.exports = class GreetDeleteCommand extends Command {

    /**
     * GreetDeleteCommand constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     */
    constructor() {
        super("greetdelete", "Stop greeting users.", "gagbot:greet:delete", false);
    }

    /**
     * Delete all the greeting configuration for this guild.
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
            console.error(`Error while deleting greeting:\n  Couldn't find a guild document with {id: ${gid}}`);
            return true;
        }

        doc.data.greet = {};

        doc.markModified('data');
        await doc.save(function(err) {
            if (err) {
                message.channel.send(`***${client.config.errorMessage}***\n Something went wrong...`);
                console.error(`Error while deleting greeting:\n  Couldn't save the guild document.`);
            }

            message.channel.send('Greeting deleted.');
        });

        return true;
    }
};