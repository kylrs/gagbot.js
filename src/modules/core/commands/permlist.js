/**
 * List all defined permissions for a given role.
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.1.0
 * @version v1.0.0
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


        client.db.guilds.findOne({ id: guild.id }, function(err, doc) {
            if (err) {
                message.channel.send('A database error occurred :/');
                return;
            }

            const roles = doc.permissions.roles;
            if (rid in roles) {
                let msg = "```diff\n";
                const perms = roles[rid];
                const sorted = Object.keys(perms).sort();
                const maxWidth = Math.max(...sorted.map((x) => x.length));
                sorted.forEach(function(key) {
                    const allowed = perms[key];
                    const symbol = allowed ? '+' : '-';
                    const name = key.padEnd(maxWidth, " ");
                    msg += `${symbol} ${name} : ${allowed}\n`;
                });
                msg += "```";
                message.channel.send(msg);
            } else {
                message.channel.send('No perms set.');
            }
        });

        return true;
    }
};