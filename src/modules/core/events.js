/**
 * Define `core` module events
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.0.0
 * @version v1.1.0
 */

const { MessageEmbed } = require('discord.js');
const Command = require('../../command/Command.js');
const config = require('../../../config.json');

module.exports = {
    /**
     * Log a message that the bot has logged in
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.0.0
     *
     * @param client
     */
    on_ready(client) {
        console.log(`Logged in as ${client.user.tag} to guilds:`);
        for (let guild of client.guilds.cache.values()) {
            console.log(`  > ${guild.name}`);
        }
    },

    /**
     * Handle incoming commands
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.0.0
     *
     * @param client
     * @param message
     */
    on_message(client, message) {
        if (message.author.bot) return;

        const res = Command.dispatchCommand(client, message, {
            prefixes: client.config.prefixes,
            allowLeadingWhitespace: true,
        });

        if (res instanceof Error) {
            console.error(res);

            // Send error in chat
            const embed = new MessageEmbed()
                .setTitle(config.errorMessage)
                .setColor(0xff0000)
                .setDescription(res.message);
            const dedEmoji = message.guild.emojis.cache.find(emoji => emoji.name === 'gagded');
            if (dedEmoji) embed.setThumbnail(`https://cdn.discordapp.com/emojis/${dedEmoji.id}.png`);
            message.channel.send(embed);
        }
    },
};