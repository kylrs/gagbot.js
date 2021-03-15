/**
 * Update the react menu bound to a roleset, to make sure all reacts are present, and there are no extra reacts.
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

module.exports = class ReactionRoleUpdateCommand extends Command {

    /**
     * ReactionRoleUpdateCommand constructor.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     */
    constructor() {
        super('rrupdate', 'Ensure all the correct roles are on the react menu for a given roleset.', 'gagbot:reactionroles:bind', false, { 'set': str });
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

        client.emit('roleSetUpdate', set.id, (err) => {
            if (err) {
                message.channel.send(new ErrorEmbed(client.config.errorMessage, err.message));
                console.error(err);
                return;
            }

            message.channel.send(new GagEmbed(`\`${set.alias}\``, `Updated the reactions.`));
        });

        return true;
    }

};
