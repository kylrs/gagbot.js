/**
 * Set what types of event are logged where.
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

const Command = require('../../../command/Command.js');
const { channel, optional, some, choice, i } = require('../../../command/arguments.js');
const GagEmbed = require('../../../responses/GagEmbed.js');
const ErrorEmbed = require('../../../responses/ErrorEmbed.js');

module.exports = class LogChannelCommand extends Command {

    /**
     * LogChannelCommand constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     */
    constructor() {
        super("log", "Set which events to log in which channel.", "gagbot:logging:channel", false, {
            'cmd': choice(i('set'), i('list'), i('check'), i('delete')),
            'channel': optional(channel),
            'types': optional(some(choice(i('message'), i('voice'), i('member'), i('error')))),
        });
    }

    /**
     * Create/Update a LogChannel document for this guild and the chosen channel & types.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @returns {boolean}
     */
    async execute(client, message, args) {

        switch(args.get('cmd')) {
            case 'set':
                this.updateLogChannel(client, message, args);
                break;
            case 'check':
                this.getLogChannel(client, message, args);
                break;
            case 'list':
                this.listLogChannels(client, message, args);
                break;
            case 'delete':
                this.deleteLogChannel(client, message, args);
                break;
        }


        return true;
    }

    /**
     * Create/Update a LogChannel document for this guild and the chosen channel & types.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @returns {boolean}
     */
    async updateLogChannel(client, message, args) {

        if (!args.get('channel') || !args.get('types')) return false;

        const channelID = args.get('channel');
        let types = args.get('types');

        await client.db.logChannel.updateOne(
            { guild: message.guild.id, channel: channelID },
            { logTypes: types },
            { upsert: true },
            function(err) {
                if (err) {
                    console.error(err);
                    return;
                }
                message.channel.send(new GagEmbed('Updated LogChannel', '').addFields([
                    { name: 'Channel', value: `<#${channelID}>`, inline: true },
                    { name: 'Types', value: types.map(x => `\`${x}\``).join(', ') || 'None', inline: true }
                ]));
            }
        );
    }

    /**
     * Create/Update a LogChannel document for this guild and the chosen channel & types.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @returns {boolean}
     */
    async getLogChannel(client, message, args) {
        if (!args.get('channel') || args.get('types')) return false;

        const channelID = args.get('channel');

        client.db.logChannel.findOne({guild: message.guild.id, channel: channelID}, function(err, doc) {
            if (err) {
                console.error(err);
                message.channel.send(new ErrorEmbed(client.config.errorMessage, 'An error occurred fetching the log channel.'));
                return;
            }

            const typeString = doc ? (doc.logTypes.map(x => `\`${x}\``).join(', ') || 'None') : 'None';
            message.channel.send(new GagEmbed('Log Channel', '').addFields([
                { name: 'Channel', value: `<#${channelID}>`, inline: true },
                { name: 'Types', value: typeString, inline: true }
            ]));
        });
    }

    /**
     * Create/Update a LogChannel document for this guild and the chosen channel & types.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @returns {boolean}
     */
    async listLogChannels(client, message, args) {
        if (args.get('channel') || args.get('types')) return false;

        client.db.logChannel.find({guild: message.guild.id}, function(err, docs) {
            if (err) {
                console.error(err);
                message.channel.send(new ErrorEmbed(client.config.errorMessage, 'An error occurred fetching the log channels.'));
                return;
            }

            if (docs.length) {
                let msg = '';
                docs.forEach(function(doc) {
                    if (doc.logTypes.length)
                        msg += `<#${doc.channel}> :: ${doc.logTypes.map(x => `\`${x}\``).join(', ')}\n`;
                });

                if (msg.length) {
                    message.channel.send(msg);
                    return;
                }
            }

            message.channel.send(new ErrorEmbed(client.config.errorMessage, 'There are no log channels for this server.'));

        });
    }

    /**
     * Remove a LogChannel document, and stop logging to the specified channel
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @returns {boolean}
     */
    async deleteLogChannel(client, message, args) {
        if (!args.get('channel') || args.get('types')) return false;

        const cid = args.get('channel');

        await client.db.logChannel.deleteOne({ guild: message.guild.id, channel: cid }, function(err, res) {
            if (err) {
                console.error(err);
                message.channel.send(new ErrorEmbed(client.config.errorMessage, 'An unexpected error occurred deleting the log channel.'));
                return;
            }

            if (res.n === 0) {
                message.channel.send(new ErrorEmbed(client.config.errorMessage, `<#${cid}> is not configured to log any events.`))
            }
            else {
                message.channel.send(new GagEmbed('LogChannel Deleted', `<#${cid}> will no longer log any events.`))
            }
        });

        return true;
    }

};
