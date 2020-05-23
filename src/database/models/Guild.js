/**
 * Define the Schema & init a model for Guild documents
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.1.0
 * @version v1.2.0
 */

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    id: String,
    name: String,
    permissions: {
        roles: {
            type: Map,
            of: {
                type: Map,
                of: Boolean,
            },
            default: new Map(),
        }
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
    }
});

/**
 * Ensure that the guild document has all the right fields
 */
schema.static('ensureDefaults', async function(guild) {
    const doc = await this.findOne({id: guild.id});
    if (doc === null) {
        return this.create({id: guild.id, name: guild.name}, function(err) {
            if (err) {
                console.error('An error occurred joining a guild:');
                console.error(err);
            }
        })
    }

    if (!doc.name) {
        doc.name = guild.name;
        doc.markModified('name');
    }

    if (!doc.permissions.roles) {
        doc.permissions.roles = new Map();
        doc.markModified('permissions.roles');
    }

    if (!doc.permissions.users) {
        doc.permissions.users = new Map();
        doc.markModified('permissions.users');
    }

    if (!doc.data) {
        doc.data = {};
        doc.markModified('data');
    }

    return doc.save();

});

const model = mongoose.model('Guild', schema);

module.exports = model;