/**
 * Define `greet` module events.
 *
 * Accept 'greet' events, triggering the server's greeting to be sent.
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

const { MessageEmbed } = require('discord.js');

module.exports = {

    /**
     * Create a document in the guilds collection when joining a new server
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Guild} guild
     * @param {User} user
     * @param {Channel} channel
     */
    async on_greet(client, guild, user, channel) {
        // Fetch the guild document from the database
        const doc = await client.db.guild.findOne({id: guild.id});
        if (!doc) {
            channel.send(`***${client.config.errorMessage}***\n Something went wrong...`);
            console.error(`Error while greeting user:\n  Couldn't find a guild document with {id: ${gid}}`);
            return true;
        }

        // Show a generic greeting if none is set.
        if (!doc.data.greet || !doc.data.greet.message) {
            channel.send(`Welcome to the server, ${user}!`);
            return true;
        }

        const msg = doc.data.greet.message.replace(/{{([^{}]+)}}/g, function (str, match) {
            switch(match) {
                case 'tag':
                    return user.toString();
                case 'name':
                    return user.name;
                case 'discriminator':
                    return user.discriminator;
                case 'username':
                    return user.username;
                default:
                    return 'ERR';
            }
        });

        const embed = new MessageEmbed()
            .setDescription(msg)
            .setThumbnail(user.displayAvatarURL({size: 256}))
            .setTimestamp()
            .setColor(0x65e7b7)
            .setFooter('https://github.com/kylrs/gagbot.js');

        // Send the greeting
        channel.send(embed);
    },

    /**
     * Send a greeting in the greeting channel when a new user joins.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {GuildMember} member
     */
    async on_guildMemberAdd(client, member) {

        const doc = await client.db.guild.findOne({id: member.guild.id});
        if (!doc) {
            message.channel.send(`***${client.config.errorMessage}***\n Something went wrong...`);
            console.error(`Error while greeting user:\n  Couldn't find a guild document with {id: ${gid}}`);
            return;
        }

        if (!doc.data.greet || !doc.data.greet.channel) {
            return;
        }

        const cid = doc.data.greet.channel;
        if (!member.guild.channels.cache.has(cid)) {
            console.error(`Invalid greeting channel!`);
        }

        const channel = member.guild.channels.cache.get(cid);

        client.emit('greet', member.guild, member.user, channel);
    },
};