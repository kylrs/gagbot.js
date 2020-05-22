/**
 * List all defined permissions for a given role.
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.1.0
 * @version v1.1.0
 */

const Command = require('../../../command/Command.js');
const { role:roleID } = require('../../../command/arguments.js');

module.exports = class PermListCommand extends Command {

    /**
     * PermListCommand constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     */
    constructor() {
        super(
            "permlist",
            "List all permissions for a given role.",
            "gagbot:permission:list", false,
            {
                "roleID": roleID,
            });
    }

    /**
     * Query the database guild document for all perms set for a role
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

        client.db.guild.findOne({ id: guild.id }, function(err, doc) {
            if (err) {
                message.channel.send('A database error occurred :/');
                return;
            }

            if (!doc) {
                message.channel.send('No perms set.');
                return true;
            }

            if (!doc.permissions.roles.has(rid)) {
                message.channel.send('No perms set.');
                return true;
            }

            const perms = doc.permissions.roles.get(rid);
            const sorted = [...perms.keys()].sort();
            const maxWidth = Math.max(...sorted.map((x) => x.length));

            let msg = "";
            sorted.forEach(function(node) {
                const allowed = perms.get(node);
                const symbol = allowed ? '+' : '-';
                const name = node.padEnd(maxWidth, " ");
                msg += `${symbol} ${name} : ${allowed}\n`;
            });
            if (!msg.length) msg = "No perms set.";
            else msg = "```diff\n" + msg + "```";
            message.channel.send(msg);

        });

        return true;
    }
};