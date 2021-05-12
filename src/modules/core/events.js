/**
 * Define `core` module events
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.0.0
 * @version v1.6.0
 */

const { MessageEmbed } = require('discord.js');
const Command = require('../../command/Command.js');

module.exports = {
    /**
     * Log a message that the bot has logged in
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.0.0
     *
     * @param client
     */
    async on_ready(client) {
        console.log(`Logged in as ${client.user.tag} to guilds:`);
        for (let guild of client.guilds.cache.values()) {
            client.db.guild.ensureDefaults(guild, function(err, doc) {
                if (err) {
                    console.error(err);
                    return;
                }

                client.prefixes = client.prefixes ?? {};
                client.prefixes[guild.id] = doc.prefix;
                console.log(`  > ${guild.name}`);
            });
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
    async on_message(client, message) {
        if (message.author.bot) return;

        const res = await Command.dispatchCommand(client, message, null);

        if (res instanceof Error) {
            console.error(res);

            // Send error in chat
            const embed = new MessageEmbed()
                .setTitle(client.config.errorMessage)
                .setColor(0xff0000)
                .setDescription(res.message);
            const dedEmoji = message.guild.emojis.cache.find(emoji => emoji.name === 'gagded');
            if (dedEmoji) embed.setThumbnail(`https://cdn.discordapp.com/emojis/${dedEmoji.id}.png`);
            message.channel.send(embed);
        }
    },

    /**
     * Create a document in the guilds collection when joining a new server
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @param client
     * @param guild
     */
    async on_guildCreate(client, guild) {
        console.log(`Joining a new guild, ${guild.name}`);
        await client.db.guild.ensureDefaults(guild);
    },

    /**
     * Log client errors
     * 
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     * 
     * @param client
     * @param error
     */
    async on_error(client, error) {
        console.error(error)
        const guild = await client.guilds.cache.get(process.env.ROOT_GUILD_ID)
        if (guild === null) return
        let title = 'An unhandled client error has occurred.'
        if (error.code) title += ` \`${error.code}\``
        client.logger.log(guild, 'error', title, error.message, 0xff0000)
    }
};
