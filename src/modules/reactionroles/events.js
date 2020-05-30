/**
 * Define `reactionroles` module events.
 *
 * On client ready, load RoleSet documents from the db
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

module.exports = {

    /**
     * When the client loads:
     * - Insert RoleSet model into client's db object
     * - For each guild, cache reaction menu messages
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     */
    async on_ready(client) {
        client.db.roleset = require('./RoleSet.js');

        for (let guild of client.guilds.cache.values()) {
            const rolesets = await client.db.roleset.find({guild: guild.id});
            for (let set of rolesets) {
                if (set.channel && set.message) {
                    const channel = guild.channels.cache.get(set.channel);
                    if (channel && channel.type === 'text') channel.messages.fetch(set.message);
                }
            }

        }
    },

    /**
     * When a user reacts to a message, if it's a react menu, grant the corresponding role
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {MessageReaction} reaction
     * @param {User} user
     */
    async on_messageReactionAdd(client, reaction, user) {
        if (user.bot) return;

        const message = reaction.message;
        const set = await client.db.roleset.findOne({guild: message.guild.id, message: message.id});
        const react = reaction.emoji.toString();
        if (!set) return;
        if (!set.choices.has(react)) {
            reaction.remove();
            return;
        }

        if (set.exclusive) {
            message.reactions.cache.forEach((mr) => {
                if (mr.emoji.toString() !== react) mr.users.remove(user.id);
            });
        }

        const roleID = set.choices.get(react);
        const role = getRoleFromID(message.guild, roleID);
        if (!role) return;

        const member = message.guild.members.resolve(user);
        member.roles.add(role).catch(console.error);
    },

    /**
     * When a user removes a reaction to a message, if it's a react menu, revoke the corresponding role
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {MessageReaction} reaction
     * @param {User} user
     */
    async on_messageReactionRemove(client, reaction, user) {
        if (user.bot) return;

        const message = reaction.message;
        const set = await client.db.roleset.findOne({guild: message.guild.id, message: message.id});
        const react = reaction.emoji.toString();
        if (!set) return;
        if (!set.choices.has(react)) return;

        const roleID = set.choices.get(react);
        const role = getRoleFromID(message.guild, roleID);
        if (!role) return;

        const member = message.guild.members.resolve(user);
        member.roles.remove(role).catch(console.error);
    },

    /**
     * When a roleset is updated, ensure that a bound message
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {string} id
     * @param {function} callback
     */
    async on_roleSetUpdate(client, id, callback) {
        let error = null;
        const set = await client.db.roleset.findOne({_id: id});
        if (!set) error = new Error(`No such roleset with _id \`${id}\`.`);
        else {
            if (!set.message || !set.channel) error = new Error('This set is not bound to a message. Use `rrbind` first.');
            else {
                const guild = client.guilds.cache.get(set.guild);
                const channel = guild.channels.cache.get(set.channel);
                const message = channel.messages.cache.get(set.message);

                message.reactions.cache.forEach((mr) => {
                    if (!set.choices.has(mr.emoji.toString())) mr.remove();
                });

                set.choices.forEach((role, react) => {
                    if (react.startsWith('<')) {
                        react = react.substring(react.lastIndexOf(':') + 1, react.length - 1);
                    }
                    message.react(react);
                });
            }
        }

        if (callback) callback(error);
    },

};

/**
 * Attempt to fetch a role by ID. If the role doesn't exist, log an error and return null.
 *
 * @param {Guild} guild
 * @param {String} id
 * @returns {Role|null}
 */
function getRoleFromID(guild, id) {
    if (!guild.roles.cache.has(id)) {
        console.error(`No such role '${id}' in guild '${guild.id}'.`);
        return null;
    }

    return guild.roles.cache.get(id);
}