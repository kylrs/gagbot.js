/**
 * Define `admin` module events
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

module.exports = {

    /**
     * Init the ActivityLog collection on startup
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     */
    async on_ready(client) {
        client.db.activityLog = require('./ActivityLog.js');
    },

    /**
     * Update user's lastMessageTimestamp when a user sends a message
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @param {Client} client
     * @param {Message} message
     */
    async on_message(client, message) {
        client.db.activityLog.findOneAndUpdate(
            {
                guild: message.guild.id,
                user: message.author.id,
            },
            {
                lastMessage: message.id,
                lastMessageTimestamp: message.createdTimestamp,
            },
            { upsert: true, useFindAndModify: false }
        ).catch((err) => {
            console.error(err);
        })
    },
};