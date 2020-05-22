/**
 * Define the Schema & init a model for Guild documents
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.1.0
 * @version v1.0.0
 */

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: String,
  permissions: {
    roles: {
      type: Map,
      of: {
        type: Map,
        of: Boolean,
        default: new Map(),
      },
      default: new Map(),
    }
  },
});

const model = mongoose.model('Guild', schema);

module.exports = model;