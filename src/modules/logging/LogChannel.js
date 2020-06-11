/**
 * Define the Schema & init a model for LogChannel documents
 * Records which types of message to log in which channel, for a certain guild
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.2.0
 * @version v1.0.0
 */

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    guild: String,
    channel: String,
    logTypes: [String],
});

const model = mongoose.model('LogChannel', schema);

module.exports = model;