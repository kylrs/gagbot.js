/**
 * Load modules from the filesystem and inject their commands, events, etc. into the Client
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.0.0
 * @version v1.0.0
 */

const fs = require('fs');
const path = require('path');
const Command = require('./command/Command.js');
const EventHandler = require('./EventHandler.js');

module.exports = class ModuleLoader {
    /**
     * ModuleLoader constructor
     *
     * @author Kay<kylrs00@gmail.com>
     * @since r20.0.0
     *
     * @param client
     */
    constructor(client) {
        this.client = client;
        this.modules = ['core', ...client.config.modules];
        this.path = "";
    }

    /**
     * Set the path from which to read modules
     *
     * @author Kay<kylrs00@gmail.com>
     * @since r20.0.0
     *
     * @param path
     * @returns {ModuleLoader}
     */
    usingPath(path) {
        this.path = path;
        return this;
    }

    /**
     * Load the modules from the filesystem
     *
     * @author Kay<kylrs00@gmail.com>
     * @since r20.0.0
     *
     * @param {function} callback
     * @returns {boolean} Evaluate truthiness of callback return value
     */
    loadModules(callback) {
        new EventHandler(this.client);

        for (let name of this.modules) {
            const modulePath = path.resolve(path.join(this.path, name));

            if (!fs.existsSync(modulePath) || !fs.lstatSync(modulePath).isDirectory()) {
                return Boolean(callback(new Error(`No such module '${name}'`)));
            }

            console.log(`Loading module '${name}'`);

            const commandsPath = path.join(modulePath, 'commands');
            Command.loadCommands(this.client, commandsPath);

            const eventsFile = path.join(modulePath, 'events.js');
            this.client.eventHandler.registerModule(eventsFile);
        }

        return Boolean(callback());
    }

};