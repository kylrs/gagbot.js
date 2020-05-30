/**
 * Define the Schema & init a model for RoleSet documents
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
    message: String,
    alias: String,
    exclusive: {
        type: Boolean,
        default: false,
    },
    choices: {
        type: Map,
        of: String,
        default: new Map(),
    },
});

const model = mongoose.model('RoleSet', schema);

module.exports = model;