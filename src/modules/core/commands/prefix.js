/**
 * Set the prefix used to execute bot commands from text chat.
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

const { MessageEmbed } = require('discord.js');
const Command = require('../../../command/Command.js');
const { optional, str } = require('../../../command/arguments.js');

module.exports = class PrefixCommand extends Command {

    /**
     * PrefixCommand constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     */
    constructor() {
        super("prefix", "Set the prefix used to summon GaGBOT.", "gagbot:core:prefix", false, [optional(str)]);
    }

    /**
     * (Optionally) Update the guild db doc & client prefix fields, and print the prefix.
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
        // If a new prefix is specified
        if (args.get(0)) {
            const newPrefix = args.get(0);
            // Save to db
            const doc = await client.db.guild.findOne({ id: message.guild.id });
            doc.prefix = newPrefix;
            doc.markModified('prefix');
            await doc.save((err) => {
                if (err) {
                    message.channel.send(`An error occurred saving the new prefix.`);
                    console.error(err);
                    return;
                }
                // If successfully saved to db, cache in the client
                client.prefixes[message.guild.id] = newPrefix;
                this.sendSummons(client, message);
            });
        } else {
            this.sendSummons(client, message);
        }

        return true;
    }

    /**
     * Send an Embed containing instructions on how to summon the bot
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} message
     */
    sendSummons(client, message) {
        message.channel.send(new MessageEmbed()
            .setTitle('Command Prefix')
            .setDescription('You can summon me using either:')
            .addFields(
                { name: 'Prefix', value: '`' + client.prefixes[message.guild.id] + '`', inline: true},
                { name: 'Mention', value: '`@' + client.user.tag + '`', inline: true}
            )
            .setColor(0xEBC634)
            .setThumbnail('https://cdn.discordapp.com/emojis/708352151558029322.png'));
    }
};