/**
 * Clear all permission nodes for a given role
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.1.0
 * @version v1.0.0
 */

const Command = require('../../../command/Command.js');
const { role:roleID } = require('../../../command/arguments.js');

module.exports = class PermClearCommand extends Command {

    /**
     * PermClearCommand constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     */
    constructor() {
        super(
            "permclear",
            "Clear all permission nodes for a role",
            "gagbot:permission:set", false,
            {
                "roleID": roleID,
            });
    }

    /**
     * Update the database guild document to reflect the request.
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

        const guild = message.guild;
        const rid = args.get("roleID");

        if (guild.roles.fetch(rid) === null) {
            message.channel.send(`Invalid role ID \`${rid}\`.`);
            return false;
        }

        const node = args.get("node");

        if (!/(([a-z]+)|\*)(:(([a-z]+)|\*))*/i.test(node)) {
            message.channel.send(`Invalid permission node \`${node}\`.`);
            return false;
        }

        client.db.guilds.update(
            { id: guild.id },
            { $unset: {[`permissions.roles.${rid}`] : true} },
            { upsert: true },
            function(err) {
                if (err) {
                    message.channel.send('A database error occurred :/');
                    console.error(err);
                    return;
                }

                message.channel.send('Permissions cleared.');
            }
        );

    }
};