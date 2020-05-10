/**
 * Ping!
 *
 * @author Kay <kylrs00@gmail.com>
 * @type {{name: string, description: string, execute(*, *): void}}
 */
module.exports = {
    name: 'ping',
    description: 'Ping!',
    execute(message, args) {
        message.channel.send('Pong.');
    },
};