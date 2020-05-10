/**
 * Define `core` module events
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.0.0
 * @version v1.0.0
 */

const { MessageEmbed } = require('discord.js');
const CommandParser = require('../../command/CommandParser.js');
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

        try {
            // Attempt to parse the message as a command. Ignore it if nothing was parsed
            const parsed = new CommandParser({
                prefixes: client.config.prefixes,
                allowLeadingWhitespace: true,
            }).parseMessage(client, message);

            if (parsed === null) return;
            if (parsed instanceof Error) throw parsed;
            const {command, args} = parsed;
            command.execute(message, args, client.db);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : err.toString();

            console.error(err);

            // Send error in chat
            const embed = new MessageEmbed()
                .setTitle(config.errorMessage)
                .setColor(0xff0000)
                .setDescription(msg);
            const dedEmoji = message.guild.emojis.cache.find(emoji => emoji.name === 'gagded');
            if (dedEmoji) embed.setThumbnail(`https://cdn.discordapp.com/emojis/${dedEmoji.id}.png`);
            message.channel.send(embed);
        }
    },
};