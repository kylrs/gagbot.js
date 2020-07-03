/**
 * Kick inactive users
 *
 * @author Kay <kylrs00@gmail.com>
 * @author Fergus Bentley <fergusbentley@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.1.0
 */

const Command = require('../../../command/Command.js');
const { num, i, optional, str, choice } = require('../../../command/arguments.js');
const GagEmbed = require('../../../responses/GagEmbed.js');
const { MessageEmbed } = require('discord.js');
const PasteBin = require('pastebin-js');

module.exports = class PruneCommand extends Command {

    /**
     * PruneCommand constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     */
    constructor() {
        super("prune", "Kick inactive users", "gagbot:admin:prune", false,
            {
                'count': num,
                'period': choice(i('days'), i('weeks'), i('months'), i('day'), i('week'), i('month')),
                'dry': optional(i('dry')),
                'reason': optional(str)
            }
        );
    }

    /**
     * Kick users who have been inactive for a given number of days.
     *
     * @author Kay <kylrs00@gmail.com>
     * @author Fergus Bentley <fergusbentley@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @returns {boolean}
     */
    async execute(client, message, args) {
        const count = args.get('count');
        const p = args.get('period')[0]
        const days = count * ((p === 'm') ? 30 : ((p === 'w') ? 7 : 1));
        let timeInactive = days * 8.64e+7;
        let inactiveCutoff = Date.now() - timeInactive;

        client.db.activityLog.find({ guild: message.guild.id })
            .then((logs) => {
                const lastMessage = {};
                logs.forEach((log) => lastMessage[log.user] = log.lastMessageTimestamp);
                message.guild.members.fetch()
                    .then(async (members) => {
                        const toKick = [];
                        let kickList = '';
                        let kickListFull = '';
                        let unlisted = 0;

                        [...members.values()]
                            .filter((member) => {
                                const lastActivity = (lastMessage[member.user.id] ?? 0);
                                return lastActivity < inactiveCutoff && member.manageable;
                            })
                            .sort((a, b) => {
                                return (lastMessage[b.user.id] ?? 0) - (lastMessage[a.user.id] ?? 0);
                            })
                            .forEach((member) => {
                                toKick.push(member);
                                const lastActivity = (lastMessage[member.user.id] ?? 0);
                                const lastSeen = lastActivity > 0 ? new Date(lastActivity).toUTCString() : 'Never';
                                const userTag = `${member.user.username}#${member.user.discriminator}`;
                                kickListFull += `[${lastSeen}] ${userTag}\n`;
                                if (kickList.length < 2000) kickList += `\`${userTag}\` last seen \`${lastSeen}\`\n`;
                                else unlisted++;
                            });

                        if (toKick.length === 0) {
                            message.channel.send(new GagEmbed('Pruning Members.', 'There are no inactive members to kick!'));
                            return true;
                        }

                        if (unlisted > 0) {
                            const pastebin = new PasteBin({
                                api_dev_key: process.env.PASTEBIN_DEV_KEY,
                                api_user_name: process.env.PASTEBIN_USER_NAME,
                                api_user_password: process.env.PASTEBIN_USER_PASSWORD,
                            });
                            const paste = await pastebin.createPaste({
                                text: kickListFull, 
                                title: `Members to Prune (${message.author.username}#${message.author.discriminator}) ${new Date().toUTCString()}`,
                                format: null,
                                privacy: 1,
                                expiration: '10M',
                            });
                            kickList += `**And \`${unlisted}\` more users. [View the full list here](${paste})**\n`
                        }

                        const embedContent = 
                            `This action will kick \`${toKick.length}\` members:\n`
                            + kickList + '\n'
                            + `***React ✅ to kick these users, or 🚫 to cancel pruning.***`;

                        const filter = (reaction, user) => {
                            return ['🚫', '✅'].includes(reaction.emoji.name) && user.id === message.author.id;
                        };

                        message.channel.send(new GagEmbed('Pruning Members', embedContent))
                            .then((message) => {
                                message.react('🚫')
                                    .then(() => message.react('✅'))
                                    .then(() => {
                                        message.awaitReactions(filter, {max: 1, time: 60000, errors: ['time'] })
                                            .then((collected) => {
                                                const reaction = collected.first();

                                                if (reaction.emoji.name === '🚫') {
                                                    message.channel.send(new MessageEmbed().setTitle('Prune cancelled.').setColor(0xfc687e));
                                                } else {
                                                    toKick.forEach(async (member) => member.kick());
                                                    message.channel.send(new MessageEmbed().setTitle(`Kicking \`${toKick.length}\` members.`).setColor(0x92fc68));
                                                }
                                            })
                                            .catch(() => {
                                                const embed = new MessageEmbed(message.embeds[0]);
                                                embed.setDescription('***Prune Cancelled***');
                                                message.edit(embed);
                                                message.reactions.removeAll();
                                            });
                                    });
                            });
                        
                    });
            });



        return true;
    }

};