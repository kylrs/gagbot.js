/**
 * Bot entry point
 *
 *
 * @license ISC
 * @author Kay <kylrs00@gmail.com>
 *
 */

'use strict';

const path = require('path');
const DataStore = require('nedb');
const config = require('../config.json');
const { Client, MessageEmbed } = require('discord.js');
const CommandLoader = require('./command/CommandLoader.js');
const CommandParser = require('./command/CommandParser.js');


// Load NeDB database files
const db = {
    guilds: new DataStore({
        filename: path.join(config.datastore, 'guilds.db'),
        autoload: true,
    }),
    logs: new DataStore({
        filename: path.join(config.datastore, 'logs.db'),
        autoload: true,
    }),
};

// Instantiate the bot
const client = new Client();

// Load commands from filesystem
new CommandLoader(client)
    .usingPath('src/command/commands')
    .loadCommands();


client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag} to guilds:`);
    for (let guild of client.guilds.cache.values()) {
        console.log(` - ${guild.name}`);
    }
});


/**
 * Handle incoming commands
 */
client.on('message', (msg) => {
    if (msg.author.bot) return;

    try {
        // Attempt to parse the message as a command. Ignore it if nothing was parsed
        const parsed = new CommandParser().parseMessage(client, msg);
        if (parsed === null) return;
        if (parsed instanceof Error) throw parsed;
        const {command, args} = parsed;
        command.execute(msg, args, db);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : err.toString();

        // Log error to database
        db.logs.insert({
            message: message,
            cause: 'command',
            detail: `${msg.author.tag}: ${msg.content}`,
            guild: msg.guild.id,
            timestamp: new Date().getTime(),
        });

        // Send error in chat
        const embed = new MessageEmbed()
            .setTitle(config.errorMessage)
            .setColor(0xff0000)
            .setDescription(message);
        const dedEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === 'gagded');
        if (dedEmoji) embed.setThumbnail(`https://cdn.discordapp.com/emojis/${dedEmoji.id}.png`);
        msg.channel.send(embed);
    }
});

// Connect to Discord
client.login(config.token);