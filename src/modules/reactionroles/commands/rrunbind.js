/**
 * Unbind a RoleSet from the currently bound message.
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

const Command = require('../../../command/Command.js');
const { str } = require('../../../command/arguments.js');
const GagEmbed = require('../../../responses/GagEmbed.js');
const ErrorEmbed = require('../../../responses/ErrorEmbed.js');

module.exports = class ReactionRoleUnBindCommand extends Command {

    /**
     * ReactionRoleUnBindCommand constructor.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     */
    constructor() {
        super('rrunbind', 'Unbind a roleset from it\'s bound message.', 'gagbot:reactionroles:bind', false, { 'set': str });
    }

    /**
     * Unbind a RoleSet from it's bound message.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @returns {Promise<boolean>}
     */
    async execute(client, message, args) {

        const setName = args.get('set');
        const set = await client.db.roleset.findOne({guild: message.guild.id, alias: setName});
        if (set === null) {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `I couldn't find a roleset named \`${setName}\`.`));
            return true;
        } else if (!set.message) {
            message.channel.send(new ErrorEmbed(client.config.errorMessage, `This roleset is not bound a message.`));
            return true;
        }

        set.channel = null;
        set.message = null;
        set.save((err) => {
            if (err) {
                message.channel.send(new ErrorEmbed(client.config.errorMessage, `Something went wrong saving the changes to the roleset.`));
                console.error(err);
                return;
            }

            message.reactions.removeAll();
            message.channel.send(new GagEmbed(`\`${set.alias}\``, `Unbound the roleset.`));
        });

        return true;
    }

};