/**
 * Register events from modules
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.0.0
 * @version v1.1.1
 */

const fs = require('fs');

module.exports = class EventHandler {
    /**
     * EventHandler constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.0.0
     *
     * @param client
     */
    constructor(client) {
        this.client = client;
        client.eventHandler = this;
    }

    /**
     * Read a module's events.js from the filesystem and register all defined events with the client
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.0.0
     *
     * @param file
     */
    registerModule(file) {

        if (!fs.existsSync(file) || !fs.lstatSync(file).isFile()) return;

        const module = require(file);
        for (let field of Object.keys(module)) {
            if (!field.startsWith('on_')) continue;
            const event = field.substring(3);

            // Register the event
            this.client.on(event, async (...args) => await module[field](this.client, ...args));

            console.log(`  + event '${event}'`);
        }

    }

};