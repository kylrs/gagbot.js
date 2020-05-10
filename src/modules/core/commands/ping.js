/**
 * Ping!
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.0.0
 * @version v1.0.0
 */
module.exports = {
    name: 'ping',
    description: 'Ping!',
    execute(message, args) {
        message.channel.send('Pong.');
    },
};