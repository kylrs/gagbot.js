/**
 * AFK - Used to update settings related to voice channel activity timeout (AFK)
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

const Command = require('../../../command/Command');
const GagEmbed = require('../../../responses/GagEmbed')
const ErrorEmbed = require('../../../responses/ErrorEmbed')
const { id, optional, channel } = require('../../../command/arguments')

module.exports = class AFKCommand extends Command {

    /**
     * AFKCommand constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     */
    constructor() {
        super(
            "tafk",
            "Toggle whether or not to move inactive voice users to the AFK channel.",
            "gagbot:voice:toggleafk",
            true,
            {
                channel: optional(id)
            }
        );
    }

    /**
     * Toggle AFK timeout
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @returns {boolean}
     */
    execute(client, message, args) {
        const guild = message.guild;
        if (guild.afkChannel) {
            this.disableAFK(client, guild, message)
        } else {
            this.enableAFK(client, guild, message, args)
        }
        return true;
    }

    /**
     * Disable the AFK channel
     * 
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     * 
     * @param {Client} client
     * @param {Guild} guild 
     * @param {Message} message 
     */
    disableAFK(client, guild, message) {
        const channel = guild.afkChannel;
        const msg = `AFK **disabled** by ${message.author}.`;
        guild.setAFKChannel(null, msg)
            .then(updated => {
                const embed = new GagEmbed('Disabled AFK Channel.', msg)
                    .addField('Channel', `${channel}`)
                    .setColor(0xde2137)
                message.channel.send(embed)
            })
            .catch(err => {
                console.error(err);
                message.channel.send(new ErrorEmbed(client.config.errorMessage, 'Something went wrong disabling AFK.'));
            })
    }

    /**
     * Enable the AFK channel
     * 
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     * 
     * @param {Client} client
     * @param {Guild} guild 
     * @param {Message} message 
     * @param {ArgumentList} args 
     */
    enableAFK(client, guild, message, args) {
        let channel;
        if (args.get('channel')) {
            channel = this.resolveChannelFromArgs(client, guild, message, args)
        }
        else {
            channel = this.findAFKChannel(guild, message)
        }
        if (channel === null) return true;
        else if (channel === undefined) {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `No AFK channel found.`));
            return true;
        }
        const msg = `AFK **enabled** by ${message.author}.`;
        guild.setAFKChannel(channel, msg)
            .then(updated => {
                message.channel.send(new GagEmbed('Enabled AFK Channel.', msg)
                    .addField('Channel', `${channel}`)
                    .setColor(0x49d13d))
            })
            .catch(err => {
                console.error(err);
                message.channel.send(new ErrorEmbed(client.config.errorMessage, 'Something went wrong enabling AFK.'));
            })
    }

    /**
     * Get the voice channel specified by ID in command args
     * 
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     * 
     * @param {Client} client
     * @param {Guild} guild 
     * @param {Message} message 
     * @param {ArgumentList} args 
     * 
     * @returns the channel with the given ID, or null if the channel is invalid
     */
    resolveChannelFromArgs(client, guild, message, args) {
        const cid = args.get('channel');
        const channels = guild.channels.cache;
        if (!channels.has(cid)) {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `No such channel ${cid}.`));
            return null;
        }
        const channel = channels.get(cid)
        if (channel.type !== 'voice') {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `Channel ${cid} is not a voice channel.`));
            return null;
        }
        return channel;
    }

    findAFKChannel(guild, message) {
        const channels = guild.channels.cache
            .filter(channel => {
                return channel.type === 'voice'
                    && /afk/i.test(channel.name)
            });
        if (channels.size === 0) return null;
        return channels.values().next().value
    }
};