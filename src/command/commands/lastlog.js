/**
 * Dump the last log item for the current guild in the source channel
 *
 * @author Kay <kylrs00@gmail.com>
 * @type {{name: string, description: string, execute(*, *, *): void}}
 */
module.exports = {
    name: 'lastlog',
    description: 'Dump the last log item for the current guild.',
    execute(message, args, db) {
        db.logs.find({guild: message.guild.id}).sort({timestamp: -1}).limit(1).exec(function(err, docs) {
            if (err) {
                console.error(err);
                return;
            }

            message.channel.send("```\n" + JSON.stringify(docs[0], null, 4) + "```");
        });
    },
};