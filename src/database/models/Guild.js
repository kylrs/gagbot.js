/**
 * Define the Schema & init a model for Guild documents
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.1.0
 * @version v1.3.0
 */

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    id: String,
    name: String,
    prefix: {
        type: String,
        default: '!',
    },
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
schema.static('ensureDefaults', async function(guild, callback) {
    const doc = await this.findOne({id: guild.id});
    if (doc === null) {
        return this.create({id: guild.id, name: guild.name}, function(err, doc) {
            if (callback) callback(err, doc);
            else if (err) {
                console.error('An error occurred joining a guild:');
                console.error(err);
            }
        })
    }

    if (!doc.name) {
        doc.name = guild.name;
        doc.markModified('name');
    }

    if (!doc.prefix) {
        doc.prefix = '!';
        doc.markModified('prefix');
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

    doc.save(function(err) {
        if (callback) callback(err, doc);
        else if (err) {
            console.error('An error occurred joining a guild:');
            console.error(err);
        }
    });

});

const model = mongoose.model('Guild', schema);

module.exports = model;