/**
 * Bot entry point
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.0.0
 * @version v1.0.0
 */

'use strict';

const path = require('path');
const DataStore = require('nedb');
const { Client } = require('discord.js');
const ModuleLoader = require('./ModuleLoader.js');

const defaultConfig = require('../config.default.json');
let config;
try {
    config = Object.assign(defaultConfig, require('../config.json'));
}
catch {
    config = defaultConfig;
}
require('dotenv').config();
config.token = process.env.DISCORD_TOKEN;

// Instantiate the bot
const client = new Client();
client.config = config;

// Load NeDB database files
client.db = {
    guilds: new DataStore({
        filename: path.join(config.datastore, 'guilds.db'),
        autoload: true,
    }),
    logs: new DataStore({
        filename: path.join(config.datastore, 'logs.db'),
        autoload: true,
    }),
};

// Load modules from filesystem
new ModuleLoader(client).usingPath('src/modules').loadModules(function(err) {
    if (err) {
        console.error(err);
        return false;
    }

    console.log('All modules loaded successfully.');
    // Connect to Discord
    client.login(config.token);
});