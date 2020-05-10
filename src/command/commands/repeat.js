/**
 * Take a string and repeat it a given number of times.
 *
 * @author Kay <kylrs00@gmail.com>
 * @type {{args: {str: StringConstructor, num: NumberConstructor}, name: string, description: string, execute(*, *): void}}
 */
module.exports = {
    name: 'repeat',
    description: 'Take a `str` and repeat it `num` times',
    args: {"str" : String, "num" : Number},
    execute(message, args) {
        for (let i = 0; i < args["num"]; i++)
            message.channel.send(`${i}: ${args["str"]}`);
    },
};