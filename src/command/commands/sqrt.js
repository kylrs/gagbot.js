/**
 * Echo the square root of a given number
 *
 * @author Kay <kylrs00@gmail.com>
 * @type {{args: [NumberConstructor], name: string, description: string, execute(*, *): void}}
 */
module.exports = {
    name: 'sqrt',
    description: 'Take a number and return its square root.',
    args: [Number],
    execute(message, args) {
        message.channel.send(Math.sqrt(args[0]));
    },
};