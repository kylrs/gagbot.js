/**
 * Abstract template for a bot Command + functionality for loading & detecting commands
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.1.0
 * @version v1.2.0
 */

const fs = require('fs');
const path = require('path');
const { Collection, MessageEmbed } = require('discord.js');
const ArgumentList = require('./ArgumentList.js');
const { checkUserCanExecuteCommand } = require('../Permissions');

module.exports = class Command {

    static #DEFAULT_OPTIONS = {
        prefixes : ['gb!'],
        allowLeadingWhitespace : true,
    };

    /**
     * Load commands from the filesystem
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @param {Client} client
     * @param {string} commandsDir
     */
    static loadCommands(client, commandsDir) {

        if (!fs.existsSync(commandsDir) || !fs.lstatSync(commandsDir).isDirectory()) return;

        if (!client.hasOwnProperty('commands')) client.commands = new Collection();

        fs.readdirSync(commandsDir)
            .filter((file) => file.endsWith('.js'))
            .forEach((file) => {
                const commandPath = path.resolve(path.join(commandsDir, file));
                const commandClass = require(commandPath);
                const command = new commandClass();
                client.commands.set(command.name, command);

                console.log(`  + command ${command.name}`);
            });
    }

    /**
     * Return the longest prefix that matches the given message.
     * If no prefix matches, return null.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @param {Message} message
     * @param {string[]} prefixes
     * @returns {null|string}
     */
    static matchPrefix(message, prefixes) {
        const matches = [];
        // Find all matching prefixes
        prefixes.forEach((prefix) => {
            if (message.content.startsWith(prefix)) {
                matches.push(prefix);
            }
        });

        if (matches.length === 0) return null;

        // Return the longest
        return matches.reduce((a, b) => a.length > b.length ? a : b);
    }

    /**
     * Take a Message and check if a command has been sent. If it has, execute it.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {object} options
     * @returns {Error|undefined}
     */
    static async dispatchCommand(client, message, options) {
        if (!client.hasOwnProperty('commands')) return;

        options = Object.assign(Command.#DEFAULT_OPTIONS, options || {});

        // Attempt to match a prefix, otherwise ignore the message
        const prefix = this.matchPrefix(message, options.prefixes);
        if (prefix === null) return;
        let tail = message.content.substring(prefix.length);

        if (options.allowLeadingWhitespace) {
            tail = tail.trimStart();
        }
        if (tail.length === 0) return;

        // Parse the name of the command
        let name = tail.split(/\s+/)[0];
        tail = tail.substring(name.length).trimStart();

        // Get the command from the client's Collection, if it exists
        if (!client.commands.has(name)) return;
        let command = client.commands.get(name);

        // If the command doesn't exist, fail silently
        if (!(await checkUserCanExecuteCommand(message.guild, message.author, command))) return;

        let error = null;

        // Parse the arguments
        let args = command.parseArgs(tail);

        // If the arguments are not invalid
        if (args instanceof Error) error = args;
        else if (!command.execute(client, message, args)) error = new Error(`Usage Error`);

        if (error) {
            message.channel.send(new MessageEmbed()
                .setTitle(error.message)
                .addFields(
                    { name: 'Usage', value: '`' + prefix + command.getUsage() + '`'},
                    { name: 'Description', value: command.description },
                )
                .setColor(0xff0000)
                .setThumbnail(`https://cdn.discordapp.com/emojis/708352247804854285.png`));
        }
    }


    /**
     * Command constructor. Prevent construction of abstract class.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     */
    constructor(name, description, permissionNode, permissionDefault, args) {
        if (new.target === Command) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }

        this.name = name;
        this.description = description;
        this.permissionNode = permissionNode;
        this.permissionDefault = permissionDefault;
        this.args = args;
    }

    /**
     * Parse an ArgumentList from a string using the args pattern from the command definition
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @param {string} tail
     * @returns {Error|ArgumentList}
     */
    parseArgs(tail) {
        let args = new ArgumentList();
        // Only parse args if they are required
        if (this.args) {
            if (tail.length === 0) return new Error(`Command '${this.name}' can't be called without args.`);

            // If required args specify keys use them, else use numbers [0, n)
            let names;
            if (this.args instanceof Object) {
                names = Object.keys(this.args);
            } else if (Array.isArray(this.args)) {
                names = this.args.keys();
            }

            // Iterate over the required arguments, attempting to match a string that can be parsed as the given type
            for (let name of names) {
                const type = this.args[name];
                const [match, rest] = type(tail);

                if (match === null) {
                    const next = tail.length > 0 ? tail.split(/\s+/)[0] : 'END';
                    return new Error(`Expected \`${name}\`:\`${type.name}\`, found '${next}'.`);
                }

                args.add(name, match, type);
                tail = rest;
            }

            if (tail.length > 0) return new Error(`Too many arguments!`);
        } else {
            // If no args are required, split by whitespace and assume all tokens are of type String
            tail.split(/\s+/)
                .forEach((arg, i) => args.add(i, arg, String));
        }

        return args;
    }

    /**
     * Execute the functionality of the command, given the specified args
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.2.0
     *
     * @returns {string}
     */
    getUsage() {
        let argString = '';

        Object.keys(this.args).forEach((key) => {
            argString += ' ';
            if (!/^\d+$/.test(key)) argString += key + ':';
            const type = this.args[key];
            argString += type.name;
        });

        return this.name + argString;
    }

    /**
     * Execute the functionality of the command, given the specified args
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @param {Client} client
     * @param {Message} message
     * @param {ArgumentList} args
     * @returns {Error|boolean}
     */
    execute(client, message, args) {
        return new Error('Cannot call the abstract Command.');
    }

};
