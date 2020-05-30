/**
 * Bind a RoleSet to a specific message
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

const Command = require('../../../command/Command.js');
const { str, channel, id } = require('../../../command/arguments.js');
const GagEmbed = require('../../../responses/GagEmbed.js');
const ErrorEmbed = require('../../../responses/ErrorEmbed.js');

module.exports = class ReactionRoleBindCommand extends Command {

    /**
     * ReactionRoleBindCommand constructor.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     */
    constructor() {
        super('rrbind', 'Bind a roleset to a message.', 'gagbot:reactionroles:bind', false, {
            'set': str,
            'channel': channel,
            'message': id,
        });
    }

    /**
     * Bind the specified roleset to the specified message.
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

        const setName = args.get('set');
        const set = await client.db.roleset.findOne({guild: message.guild.id, alias: setName});
        if (set === null) {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `I couldn't find a roleset named \`${setName}\`.`));
            return true;
        } else if (set.message) {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `This roleset is already bound to the message \`${set.message}\`.`));
            return true;
        }

        const channelID = args.get('channel');
        const channel = message.guild.channels.cache.get(channelID);
        if (!channel) {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `I couldn't find a channel with the ID \`${channelID}\`.`));
            return true;
        } else if (channel.type !== 'text') {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `I can only create react menus in text channels.`));
            return true;
        }

        const messageID = args.get('message');
        const reactMessage = await channel.messages.fetch(messageID);
        if (reactMessage === null) {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `I couldn't find a message with the ID \`${messageID}\`.`));
            return true;
        } else if (reactMessage.reactions.cache.size > 0) {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `This message already has reactions. You must clear existing reactions before binding a roleset to the message.`));
            return true;
        }

        set.channel = channelID;
        set.message = messageID;
        set.save((err) => {
            if (err) {
                message.channel.send(new ErrorEmbed(client.config.errorMessage, `Something went wrong saving the changes to the roleset.`));
                console.error(err);
                return;
            }

            message.channel.send(new GagEmbed(`\`${set.alias}\``, `Bound to message.`)
                .addFields(
                    { name: 'Message', value: messageID, inline: true },
                    { name: 'Channel', value: channel.toString(), inline: true }
                ));

            client.emit('roleSetUpdate', set._id);
        });

        return true;
    }

};