/**
 * Grant a "member" role to a user. Designed to facilitate waiting-room channels.
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

const Command = require('../../../command/Command.js');
const { user } = require('../../../command/arguments.js');

module.exports = class AddMemberCommand extends Command {

    /**
     * AddMemberCommand constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     */
    constructor() {
        super("am", "Set the greeting channel.", "gagbot:greet:addmember", false, [user]);
    }

    /**
     * Grant the "memberRole" to the tagged user
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
        const guild = message.guild;

        // Get the user
        const uid = args.get(0);
        if (!guild.members.cache.has(uid)) {
            message.channel.send('No such member.');
            return true;
        }
        const member = guild.members.cache.get(uid);

        // Get the guild doc
        const doc = await client.db.guild.findOne({id: guild.id});
        if (!doc) {
            message.channel.send(`***${client.config.errorMessage}***\n Something went wrong...`);
            console.error(`Error while adding member role:\n  Couldn't find a guild document with {id: ${gid}}`);
            return true;
        }

        // If no memberRole is set, don't set a role.
        if (!doc.data.greet || !doc.data.greet.role) {
            message.channel.send('Command not configured.');
            return true;
        }

        // Get the role
        const rid = doc.data.greet.role;
        if (!guild.roles.cache.has(rid)) {
            message.channel.send(`***${client.config.errorMessage}***\n Something went wrong...`);
            console.error(`Error while adding member role:\n No such role.`);
            return true;
        }
        const role = guild.roles.cache.get(rid);

        member.roles.add(role).then(function() {
            message.channel.send(`Added role ${role} to ${member}!`);
        }).catch(function(err) {
            message.channel.send(`***${client.config.errorMessage}***\n Something went wrong...`);
            console.error(`Error while adding member role:\n${err}`);
        });

        return true;
    }
};