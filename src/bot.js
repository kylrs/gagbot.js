/**
 * Bot entry point
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.0.0
 * @version v1.1.0
 */

'use strict';

const mongoose = require('mongoose');
const { Client } = require('discord.js');
const ModuleLoader = require('./ModuleLoader.js');

// Load config from .json files & environment variables
const defaultConfig = require('../config.default.json');
let config;
try {
    config = Object.assign(defaultConfig, require('../config.json'));
}
catch {
    console.log('!! Failed to load config.json. Using default configuration. !!');
    config = defaultConfig;
}
require('dotenv').config();
config.token = process.env.DISCORD_TOKEN;

// Instantiate the bot
const client = new Client();
client.config = config;

// Connect to MongoDB and insert models into client object
client.db = {};
mongoose.connect(process.env.MONGO_DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
const mdb = mongoose.connection;
mdb.on('error', console.error.bind(console, 'Database Connection Error:'));
mdb.once('open', function() {
    client.db.guild = require('./database/models/Guild.js');

    loadModules();
});

// Load modules from the filesystem
function loadModules() {
    new ModuleLoader(client).usingPath('src/modules').loadModules(function(err) {
        if (err) {
            console.error(err);
            return false;
        }

        console.log('All modules loaded successfully.');

        login();
    });
}

// Connect to discord!
function login() {
    client.login(config.token);
}