/**
 * Read command definitions from the filesystem and inject them into the discord Client object.
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.0.0
 * @version v1.0.0
 */

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = class CommandLoader {

    /**
     * CommandLoader constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.0.0
     *
     * @param client
     */
    constructor(client) {
        this.client = client;
        this.path = '.';

        this.client.commands = new Collection();
    }

    /**
     * Set the path from which to load command files
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.0.0
     *
     * @param path
     * @returns {CommandLoader}
     */
    usingPath(path) {
        this.path = path;
        return this;
    }

    /**
     * Load commands from the filesystem
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.0.0
     */
    loadCommands() {

        if (!fs.existsSync(this.path) || !fs.lstatSync(this.path).isDirectory()) return;

        fs.readdirSync(this.path)
          .filter((file) => file.endsWith('.js'))
          .forEach((file) => {
              const modulePath = path.resolve(path.join(this.path, file));
              const command = require(modulePath);
              this.client.commands.set(command.name, command);

              console.log(`  + command ${command.name}`);
          });
    }
};