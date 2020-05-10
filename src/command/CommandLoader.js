/**
 * Read command definitions from the filesystem and inject them into the discord Client object.
 *
 * @author Kay <kylrs00@gmail.com>
 * @type {CommandLoader}
 */

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = class CommandLoader {
    constructor(client) {
        this.client = client;
        this.path = '.';

        this.client.commands = new Collection();
    }

    usingPath(path) {
        this.path = path;
        return this;
    }

    loadCommands() {
        fs.readdirSync(this.path)
          .filter((file) => file.endsWith('.js'))
          .forEach((file) => {
              const modulePath = path.resolve(path.join(this.path, file));
              const command = require(modulePath);
              this.client.commands.set(command.name, command);
          });
    }
};