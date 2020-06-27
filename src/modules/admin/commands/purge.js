/**
 * Bulk delete recent messages
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.0.0
 * @version v1.0.1
 */

const Command = require('../../../command/Command.js');
const { choice, sequence, num, id, i, optional, channel, except, user } = require('../../../command/arguments.js');
const ErrorEmbed = require('../../../responses/ErrorEmbed.js');
const GagEmbed = require('../../../responses/GagEmbed.js');
const { MessageEmbed } = require('discord.js');

module.exports = class PurgeCommand extends Command {

    /**
     * PurgeCommand constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     */
    constructor() {
        super("purge", "Bulk delete recent messages", "gagbot:admin:purge", false,
            {
                "channel": optional(except(channel, num)),
                "since": choice(
                    num,
                    sequence(i('since'), id)
                ),
                "from": optional(sequence(i('from'), user))
            }
        );
    }

    /**
     * Bulk delete recent messages, either all messages since a certain message, or a certain number of messages
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
        let channel = message.channel;
        if (args.get('channel')) {
            const cid = args.get('channel');
            if (message.guild.channels.cache.has(cid)) {
                channel = message.guild.channels.cache.get(cid);
            }
        }

        if (channel.type !== 'text') {
            await message.channel.send(new ErrorEmbed(client.config.errorMessage, 'I can only delete messages in text channels!'));
            return true;
        }

        const sinceArg = args.get('since');
        let query = {};
        if (typeof sinceArg === 'number') {
            // Get N most recent messages
            // If !purge was sent in the selected channel, also delete it.
            const count = message.channel === channel ? sinceArg + 1 : sinceArg;
            query = { limit: count };
        }
        else {
            // Get all messages since the given message
            const mid = sinceArg[1];
            query = { after: mid, limit: 100 };
        }

        channel.messages.fetch(query)
            .then(async (messages) => {
                if (args.get('from')) {
                    const uid = args.get('from')[1];
                    const fromUser = await message.guild.members.fetch(uid);
                    if (fromUser) messages = messages.filter((m) => m.author.id === uid);
                    else {
                        await message.channel.send(new ErrorEmbed(
                            client.config.errorMessage,
                            `No user exists with the ID \`${uid}\``
                        ));
                    }
                }
                await this.bulkDelete(message.channel, channel, messages);
            })
            .catch((err) => {
                console.error(err);
                message.channel.send(new ErrorEmbed(
                    client.config.errorMessage,
                    `Failed to fetch messages :/`
                ));
            });

        return true;
    }

    /**
     * Send a message to confirm deletion, and then delete all given messages
     *
     * @param {TextChannel} sourceChannel
     * @param {TextChannel} targetChannel
     * @param {Collection<Snowflake, Message>} messages
     * @returns {Promise<void>}
     */
    async bulkDelete(sourceChannel, targetChannel, messages) {
        const embed = new GagEmbed('Purging Messages...', '', {
            'Messages': messages.size,
            'Channel': sourceChannel.toString(),
        });
        let remaining = messages.size;
        sourceChannel.send(embed)
            .then((message) => {
                messages.forEach(async (msg) => {
                    msg.delete().then(() => {
                        remaining--;
                        if (remaining === 0) {
                            message.delete();
                        }
                    });
                });
            });
    }
};