/**
 * Define the Schema & init a model for ActivityLog documents
 * Records the most recent actions of each user in the guild
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    guild: String,
    user: String,
    lastMessageID: String,
    lastMessageTimestamp: Number,
});

const model = mongoose.model('ActivityLog', schema);

module.exports = model;