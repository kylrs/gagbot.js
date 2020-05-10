/**
 * Handles the parsing of commands and their arguments
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.0.0
 * @version v1.0.0
 */

const ArgumentList = require('./ArgumentList.js');

module.exports = class CommandParser {

    static #DEFAULT_OPTIONS = {
        prefixes : ['gb!'],
        allowLeadingWhitespace : true,
    };

    /**
     * CommandParser constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.0.0
     *
     * @param options
     */
    constructor(options) {
        this.options = Object.assign(CommandParser.#DEFAULT_OPTIONS, options || {});
    }

    /**
     * Return the longest prefix that matches the given message.
     * If no prefix matches, return null.
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.0.0
     *
     * @param message
     * @returns {null|string}
     */
    matchPrefix(message) {
        const matches = [];
        // Find all matching prefixes
        const isCommand = this.options.prefixes.forEach((prefix) => {
            if (message.content.startsWith(prefix)) {
                matches.push(prefix);
            }
        });

        if (matches.length === 0) return null;

        // Return the longest
        return matches.reduce((a, b) => a.length > b.length ? a : b);
    }

    /**
     * Take a chat message and
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.0.0
     *
     * @param client
     * @param message
     * @returns object|Error
     */
    parseMessage(client, message) {
        if (!client.hasOwnProperty('commands')) return null;

        // Attempt to match a prefix, otherwise ignore the message
        const prefix = this.matchPrefix(message);
        if (prefix === null) return null;
        let tail = message.content.substring(prefix.length);

        if (this.options.allowLeadingWhitespace) {
            tail = tail.trimStart();
        }
        if (tail.length === 0) return null;

        // Parse the name of the command
        let name = tail.split(/\s+/)[0];
        tail = tail.substring(name.length).trimStart();
        if (!client.commands.has(name)) return null;
        let command = client.commands.get(name);

        // Parse the arguments
        let args = this.parseArgs(tail, command);
        if (args instanceof Error) return args;

        return {
            name: name,
            command: command,
            args: args
        };
    }

    /**
     * Parse an ArgumentList from a string using the args pattern from the command definition
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.0.0
     *
     * @param tail
     * @param command
     * @returns {Error|ArgumentList}
     */
    parseArgs(tail, command) {
        let args = new ArgumentList();
        // Only parse args if they are required
        if (command.args) {
            if (tail.length === 0) return new Error(`Command '${command.name}' can't be called without args.`);

            // If required args specify keys use them, else use numbers [0, n)
            let names;
            if (command.args instanceof Object) {
                names = Object.keys(command.args);
            } else if (Array.isArray(command.args)) {
                names = command.args.keys();
            }

            // Iterate over the required arguments, attempting to match a string that can be parsed as the given type
            for (let name of names) {
                const type = command.args[name];
                let re, match;
                switch(type) {
                    // TODO: Add boolean, User, Emoji, Channel, Message, Role, flag types
                    /**
                     * Parse a numeric value in any of the folowing formats:
                     *   -123   - An integer, with optional sign [+-]
                     *   1.23   - A decimal, with optional sign [+-]
                     *   .23    - For decimals where |value| < 1, leading 0 is optional
                     *   1.2e-3 - Scientific "E" notation
                     *   1101_2 - An integer part and a base with which to interpret it
                     */
                    case Number:
                        let num;
                        re = /([A-Za-z0-9]+_\d+)|(^-?\d*\.?\d+([Ee][-+]?\d+)?)(\s|$)+/;
                        match = tail.match(re);
                        if (match === null) {
                            let next = tail.split(/\s+/)[0];
                            return new Error(`Expected \`${name}\`:\`Number\`. Got "${next}"`);
                        }

                        if (match[0].includes('_')) {
                            // Specified base format
                            let [int, base] = match[0].split('_');
                            num = parseInt(int, parseInt(base, 10));
                        } else {
                            // Plain number format
                            num = Number(match[0]);
                        }

                        args.add(name, num, Number);
                        tail = tail.substring(match[0].length);
                        break;

                    /**
                     * Parse a continuous string of non-whitespace characters.
                     *
                     * TODO: Allow delimited strings (allowing whitespace)
                     */
                    case String:
                    default:
                        re = /^\S+(\s|$)+/;
                        match = tail.match(re);
                        if (match === null) {
                            let next = tail.split(/\s+/)[0];
                            return new Error(`Expected \`${name}\`:\`String\`. Got "${next}"`);
                        }

                        let str = match[0].trim();
                        args.add(name, str, String);
                        tail = tail.substring(match[0].length);
                }
            }
        } else {
            // If no args are required, split by whitespace and assume all tokens are of type String
            tail.split(/\w+/)
                .forEach((arg) => args.add(arg, String));
        }

        return args.indexable();
    }

};