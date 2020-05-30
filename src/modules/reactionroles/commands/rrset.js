/**
 * Allow the creation and manipulation of RoleSet documents
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.1
 */

const Command = require('../../../command/Command.js');
const { choice, i, str, emoji, role, optional } = require('../../../command/arguments.js');
const GagEmbed = require('../../../responses/GagEmbed.js');
const ErrorEmbed = require('../../../responses/ErrorEmbed.js');


module.exports = class ReactionRoleSetCommand extends Command {

    /**
     * ReactionRoleSetCommand constructor.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     */
    constructor() {
        super('rrset', 'Modify rolesets.', 'gagbot:reactionroles:set', false, {
            'cmd': choice(i('add'), i('delete'), i('clear'), i('update'), i('list'), i('togglex')),
            'set': str,
            'react': optional(choice(emoji, str)),
            'role': optional(role),
        });
    }

    /**
     * Take a string, and if it looks like an emoji short-form, try to get that emoji from those available to the client.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param client
     * @param react
     * @returns {string|null}
     */
    getGaGBOTEmoji(client, react) {
        if (!/\$[a-z_]+/.test(react)) return null;
        const name = react.replace('$', '');
        const emoji = client.emojis.cache.find((emoji) => {
            console.log(emoji.name);
            return emoji.name === name;
        });
        if (emoji) return `<:${name}:${emoji.id}>`;
        return null;
    }

    /**
     * Find a RoleSet document for a specific guild and alias
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Guild} guild
     * @param {String} setName
     * @returns {Promise<Document|null>}
     */
    getRoleSet(client, guild, setName) {
        return client.db.roleset.findOne({ guild: guild.id, alias: setName });
    }

    /**
     * Create and return a RoleSet document for a specific guild and alias
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Guild} guild
     * @param {String} setName
     * @returns {Promise<Document|null>}
     */
    createRoleSet(client, guild, setName) {
        return client.db.roleset.create({ guild: guild.id, alias: setName });
    }

    /**
     * Create and return a RoleSet document for a specific guild and alias
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {Document} set
     * @param {function} successCallback
     * @returns {Promise<undefined>}
     */
    saveRoleSet(client, message, set, successCallback) {
        return set.save((err) => {
            if (err) {
                message.channel.send(new ErrorEmbed(client.config.errorMessage, 'Something went wrong saving the roleset.'));
                return;
            }

            if (successCallback) successCallback();
        });
    }

    /**
     * Delegate execution to the appropriate method for the specified sub-command
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @returns {Promise<boolean>}
     */
    async execute(client, message, args) {
        const set = await this.getRoleSet(client, message.guild, args.get('set'));

        if (set === null && args.get('cmd') !== 'add') {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `I couldn't find a roleset called \`${args.get('set')}\``));
        }

        switch(args.get('cmd')) {
            case 'add':
                return this.addChoice(client, message, args, set);
            case 'delete':
                return this.deleteChoice(client, message, args, set);
            case 'update':
                return this.updateChoice(client, message, args, set);
            case 'clear':
                return this.clearChoices(client, message, args, set);
            case 'list':
                return this.listChoices(client, message, args, set);
            case 'togglex':
                return this.toggleExclusive(client, message, args, set);

        }
    }

    /**
     * Add a react/role pair to the selected RoleSet document's `choices` field.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @param {Document} set
     */
    async addChoice(client, message, args, set) {

        if (!args.get('react') || !args.get('role')) return false;

        const setName = args.get('set');
        const role = args.get('role');
        let react = args.get('react');

        if(react.startsWith('$')) react = this.getGaGBOTEmoji(client, react);
        if(!react) {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `The string ${args.get('react')} is not a valid emoji.`));
            return true;
        }

        if (set === null) set = await this.createRoleSet(client, message.guild, setName);

        if (set.choices.has(react)) {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `The emoji ${react} is already in the roleset \`${setName}\``));
            return true;
        }

        const roleObj = message.guild.roles.cache.get(role);
        set.choices.set(react, role);
        set.markModified('choices');
        this.saveRoleSet(client, message, set, () => {
            message.channel.send(new GagEmbed(`\`${setName}\``, 'Added a new reaction role!')
                .addFields(
                    { name: 'React', value: react, inline: true },
                    { name: 'Role', value: roleObj, inline: true },
                ));
        });

        return true;
    }

    /**
     * Delete a react/role pair from the selected RoleSet document's `choices` field.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @param {Document} set
     */
    async deleteChoice(client, message, args, set) {
        if (!args.get('react')) return false;

        const react = args.get('react');

        if (!set.choices.has(react)) {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `The roleset \`${args.get('set')}\` doesn't contain the ${react} react.`));
            return true;
        }

        const oldRole = message.guild.roles.cache.get(set.choices.get(react));
        set.choices.delete(react);
        set.markModified('choices');
        this.saveRoleSet(client, message, set, () => {
            message.channel.send(new GagEmbed(`\`${args.get('set')}\``, 'Removed a reaction role!')
                .addFields(
                    { name: 'React', value: react, inline: true },
                    { name: 'Role', value: oldRole.toString(), inline: true }
                ));
        });

        return true;
    }

    /**
     * Update a react/role pair that already exists in the selected RoleSet document's `choices` field.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @param {Document} set
     */
    async updateChoice(client, message, args, set) {
        if (!args.get('react') || !args.get('role')) return false;

        let react = args.get('react');

        if(react.startsWith('$')) react = this.getGaGBOTEmoji(client, react);
        if(!react) {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `The string ${args.get('react')} is not a valid emoji.`));
            return true;
        }

        const role = args.get('role');

        if (!set.choices.has(react)) {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `The roleset \`${args.get('set')}\` doesn't contain the ${react} react.`));
            return true;
        }

        const oldRole = message.guild.roles.cache.get(set.choices.get(react));
        const newRole = message.guild.roles.cache.get(role);

        set.choices.set(react, role);
        set.markModified('choices');
        this.saveRoleSet(client, message, set, () => {
            message.channel.send(new GagEmbed(`\`${args.get('set')}\``, 'Updated a reaction role!')
                .addFields(
                    { name: 'React', value: react, inline: true },
                    { name: 'From', value: oldRole.toString(), inline: true },
                    { name: 'To', value: newRole.toString(), inline: true }
                ));
        });

        return true;
    }

    /**
     * Clear all react/role pairs from the selected RoleSet document's `choices` field.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @param {Document} set
     */
    async clearChoices(client, message, args, set) {
        set.choices.clear();

        set.markModified('choices');
        this.saveRoleSet(client, message, set, () => {
            message.channel.send(new GagEmbed(`\`${args.get('set')}\``, 'Cleared all reaction roles.'));
        });

        return true;
    }

    /**
     * List all react/role pairs in the selected RoleSet document's `choices` field.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @param {Document} set
     */
    async listChoices(client, message, args, set) {
        let msg = '';
        if (set.choices.size === 0) {
            msg += 'No reaction roles to show.'
        } else {
            set.choices.forEach((role, react) => {
                const roleObj = message.guild.roles.cache.get(role) || '`deleted_role`';
                msg += `${react} grants ${roleObj}\n`;
            });
        }

        message.channel.send(new GagEmbed('`' + set.alias + '`', msg));

        return true;
    }

    /**
     * Toggle whether more than one reaction can exist for a given user at a time
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @param {Document} set
     */
    async toggleExclusive(client, message, args, set) {
        set.exclusive = !set.exclusive;

        set.markModified('choices');
        this.saveRoleSet(client, message, set, () => {
            let state = set.exclusive ? 'now' : 'no longer';
            message.channel.send(new GagEmbed(`\`${args.get('set')}\``, `The role set is ${state} exclusive.`));
        });

        return true;
    }

};