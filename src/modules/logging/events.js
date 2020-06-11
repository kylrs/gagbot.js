/**
 * Define `logging` module events
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

const Logger = require('./Logger.js');

module.exports = {
    /**
     * Initialise the logger
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     */
    async on_ready(client) {
        client.logger = new Logger(client);
    },


      ////////////////////
     // MESSAGE events //
    ////////////////////

    /**
     * Log when a user edits a message
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} before
     * @param {Message} after
     */
    async on_messageUpdate(client, before, after) {
        const user = before.author;
        if (user.bot) return;
        await client.logger.log(
            before.guild,
            'message',
            `\`${user.username}#${user.discriminator}\` edited their message.`,
            `**Before**\n\`\`\`\n${before.content}\n\`\`\`\n` +
            `**After**\n\`\`\`\n${after.content}\n\`\`\``,
            0x30649c,
            {
                'Channel': before.channel.toString(),
                'Timestamp': `\`${new Date().toLocaleString()}\``,
            },
        );
    },

    /**
     * Log when a user deletes a message
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} message
     */
    async on_messageDelete(client, message) {
        const user = message.author;
        await client.logger.log(
            message.guild,
            'message',
            `Message from \`${user.username}#${user.discriminator}\` was deleted.`,
            `\`\`\`\n${message.content}\n\`\`\`\n`,
            0x9c3730,
            {
              'Channel': message.channel.toString(),
              'Timestamp': `\`${new Date().toLocaleString()}\``,
            },
        );
    },


      //////////////////
     // VOICE events //
    //////////////////

    /**
     * Log when a joins, leaves, or moves to a different voice channel
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {VoiceState} before
     * @param {VoiceState} after
     */
    async on_voiceStateUpdate(client, before, after) {
        if (before.member.bot || after.member.bot) return;

        let msg = '';
        let colour = undefined;
        const fields = {};

        if (before.channel) {
            if (!after.channel) {
                msg = 'Left voice chat.';
                fields['Channel'] = before.channel.toString();
                colour = 0xff4d64;
            } else if (before.channelID !== after.channelID) {
                msg = 'Changed channels.';
                fields['From'] = before.channel.toString();
                fields['To'] = after.channel.toString();
                colour = 0x4d8bff;
            }
        } else if (after) {
            msg = 'Joined voice chat.';
            fields['Channel'] = after.channel.toString();
            colour = 0x4dff9d;
        }

        if (msg.length) {
            fields['User'] = before.member.user.toString();
            fields['Timestamp'] = `\`${new Date().toLocaleString()}\``;

            await client.logger.log(
                before.guild,
                'voice',
                `Voice State update for \`${before.member.user.username}#${before.member.user.discriminator}\``,
                msg, colour, fields,
            );
        }
    },


      ///////////////////
     // MEMBER events //
    ///////////////////

    /**
     * Log when a user joins a guild
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {GuildMember} member
     */
    async on_guildMemberAdd(client, member) {
        const user = member.user;
        await client.logger.log(
            member.guild,
            'member',
            `\`${user.username}#${user.discriminator}\` joined the server.`,
            '',
            0x009900,
            { 'Timestamp': `\`${new Date().toLocaleString()}\`` },
        );
    },

    /**
     * Log when a user leaves a guild
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {GuildMember} member
     */
    async on_guildMemberRemove(client, member) {
        const user = member.user;
        await client.logger.log(
            member.guild,
            'member',
            '',
            `\`${user.username}#${user.discriminator}\` left the server.`,
            0x990000,
            { 'Timestamp': `\`${new Date().toLocaleString()}\`` },
        );
    },
};