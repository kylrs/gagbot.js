/**
 * List all defined permissions for a role under a certain node.
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.1.0
 * @version v1.0.0
 */

const Command = require('../../../command/Command.js');
const { role:roleID, str } = require('../../../command/arguments.js');

module.exports = class PermCheckCommand extends Command {

    /**
     * PermCheckCommand constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     */
    constructor() {
        super(
            "permcheck",
            "List all permissions for a role, under a certain node.",
            "gagbot:permission:list", false,
            {
                "roleID": roleID,
                "node": str,
            });
    }

    /**
     * Query the database guild document for all perms set for a role under a certain node
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
            const sorted = [...perms.keys()].filter((x) => x.startsWith(node)).sort();
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