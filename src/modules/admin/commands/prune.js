/**
 * Kick inactive users
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

const Command = require('../../../command/Command.js');
const { num, i, optional, str, choice } = require('../../../command/arguments.js');
const ErrorEmbed = require('../../../responses/ErrorEmbed.js');
const GagEmbed = require('../../../responses/GagEmbed.js');
const { MessageEmbed } = require('discord.js');

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
                    .then((members) => {
                        const toKick = [];
                        let kickList = '';

                        members.forEach((member) => {
                            const lastActivity = (lastMessage[member.user.id] ?? 0);
                            if (lastActivity < inactiveCutoff && member.manageable) {
                                toKick.push(member);
                                kickList += `\`${member.user.username}#${member.user.discriminator}\` last seen \`${lastActivity > 0 ? new Date(lastActivity).toUTCString() : 'Never'}\`\n`
                            }
                        });

                        if (toKick.length === 0) {
                            message.channel.send(new GagEmbed('Pruning Members.', 'There are no inactive members to kick!'));
                        }
                        else {
                            const filter = (reaction, user) => {
                                return ['🚫', '✅'].includes(reaction.emoji.name) && user.id === message.author.id;
                            };

                            message.channel.send(new GagEmbed('Pruning Members', `This action will kick \`${toKick.length}\` members: \n${kickList}\n***React ✅ to kick these users, or 🚫 to cancel pruning.***`))
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
                                                });
                                        });
                                });
                        }
                    });
            });



        return true;
    }

};