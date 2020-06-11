/**
 * Handle logging events that occur in servers to the console, discord, and the database
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

const { MessageEmbed } = require('discord.js');

module.exports = class Logger {

    /**
     * Logger constructor.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param client
     */
    constructor(client) {
        this.client = client;
        this.client.db.logChannel = require('./LogChannel.js');
    }

    /**
     * Fetch the log channel
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Guild} guild
     * @param {string} type
     * @param {function(Error, Channel)} callback
     */
    async getLogChannel(guild, type, callback) {
        let channel = null, err = null;
        this.client.db.logChannel.findOne({guild: guild.id, logTypes: type}, function(err, doc) {
            if (err) callback(err, channel);
            else {
                if (doc) {
                    const cid = doc.channel;
                    const guildChannel = guild.channels.cache.get(cid);
                    if (!guildChannel) err = new Error(`Error fetching LogChannel:\nNo such channel ${cid} in guild ${guild.name}#${guild.id}.`)
                    else if (guildChannel.type !== "text") err = new Error(`Error fetching LogChannel:\nThe channel must be a text channel, but is a '${channel.type}' channel.`);
                    else channel = guildChannel;
                }

                callback(err, channel);
            }
        });
    }

    /**
     * Log a message for a specific guild
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Guild} guild
     * @param {string} type
     * @param {string} title
     * @param {string} message
     * @param {number} colour
     * @param {object} fields
     */
    async log(guild, type, title, message, colour, fields) {
        return this.getLogChannel(guild, type, function(err, channel) {
            if (err) {
                console.error(err);
                return;
            }

            if (channel) {
                const embed = new MessageEmbed().setTimestamp();

                if (title) embed.setTitle(title);
                if (message) embed.setDescription(message);
                if (colour) embed.setColor(colour);
                if (fields) {
                    Object.keys(fields).forEach(function(key) {
                        embed.addField(key, fields[key], true);
                    });
                }
                channel.send(embed);
            }
        });
    }

}