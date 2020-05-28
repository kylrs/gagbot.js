/**
 * Parsing functions for bot command arguments
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.1.0
 * @version v1.2.1
 */

/**
 * Parse a continuous string of non-whitespace characters.
 *
 * @author Kay <kylrs00@gmail.com>
 * @since r20.1.0
 *
 * @param {string} input
 * @returns {[string|null, string]}
 */
module.exports.str = function str(input) {
    const re = /^(("((\\.)|[^\\"])*")|(\S+))(\s|$)+/;
    const match = input.match(re);

    if (match === null) return [null, input];

    const str = match[1].trim().replace(/(?<!\\)"/g, '');
    const rest = input.substring(match[0].length);
    return [str, rest];
};


/**
 * Parse a numeric value in any of the folowing formats:
 *   -123   - An integer, with optional sign [+-]
 *   1.23   - A decimal, with optional sign [+-]
 *   .23    - For decimals where |value| < 1, leading 0 is optional
 *   1.2e-3 - Scientific "E" notation
 *   1101_2 - An integer part and a base with which to interpret it
 *
 * @author Kay <kylrs00@gmail.com>
 * @since r20.1.0
 *
 * @param {string} input
 * @returns {[number|null, string]}
 */
module.exports.num = function num(input) {
    let num;
    const re = /^([A-Za-z0-9]+_\d+)|(^-?\d*\.?\d+([Ee][-+]?\d+)?)(\s|$)+/;
    const match = input.match(re);

    if (match === null) return [null, input];

    if (match[0].includes('_')) {
        // Specified base format
        let [int, base] = match[0].split('_');
        num = parseInt(int, parseInt(base, 10));
    } else {
        // Plain number format
        num = Number(match[0]);
    }

    const rest = input.substring(match[0].length);
    return [num, rest];
};


/**
 * Parse a boolean value in one of the following formats (case insensitive):
 *   "true" / "t" => true
 *   "false" / "f" => false
 *
 * @author Kay <kylrs00@gmail.com>
 * @since r20.1.0
 *
 * @param {string} input
 * @returns {[boolean|null, string]}
 */
module.exports.bool = function bool(input) {
    const re = /^((true)|(false)|t|f)(\s|$)+/i;
    const match = input.match(re);

    if (match === null) return [null, input];

    const bool = match[0].toUpperCase().startsWith('T');
    const rest = input.substring(match[0].length);
    return [bool, rest];
};


/**
 * Parse an arbitrary string of digits
 *
 * @author Kay <kylrs00@gmail.com>
 * @since r20.1.0
 *
 * @param {string} input
 * @returns {[boolean|null, string]}
 */
module.exports.id = function id(input) {
    const re = /^(\d+)(\s|$)+/;
    const match = input.match(re);

    if (match === null) return [null, input];

    const id = match[1];
    const rest = input.substring(match[0].length);
    return [id, rest];
};


/**
 * Parse a User ID as either a numerical ID or an ID of the form "<@!XXX...>"
 *
 * @author Kay <kylrs00@gmail.com>
 * @since r20.1.0
 *
 * @param {string} input
 * @returns {[string|null, string]}
 */
module.exports.user = function user(input) {
    let id, rest;

    // Try to parse a plain ID
    [id, rest] = module.exports.id(input);
    if (id !== null ) return [id, rest];

    // Try to parse an ID from a tag "<@!XXX...>"
    const re = /^<@!?(\d+)>(\s|$)+/;
    const match = input.match(re);

    if (match === null) return [null, input];

    id = match[1];
    rest = input.substring(match[0].length);
    return [id, rest];
};


/**
 * Parse a Role ID as either a numerical ID or an ID of the form "<@!XXX...>"
 *
 * @author Kay <kylrs00@gmail.com>
 * @since r20.1.0
 *
 * @param {string} input
 * @returns {[string|null, string]}
 */
module.exports.role = function role(input) {
    let id, rest;

    // Try to parse a plain ID
    [id, rest] = module.exports.id(input);
    if (id !== null ) return [id, rest];

    // Try to parse an ID from a tag "<@&XXX...>"
    const re = /^<@&?(\d+)>(\s|$)+/;
    const match = input.match(re);

    if (match === null) return [null, input];

    id = match[1];
    rest = input.substring(match[0].length);
    return [id, rest];
};


/**
 * Parse a Channel ID as either a numerical ID or an ID of the form "<#XXX...>"
 *
 * @author Kay <kylrs00@gmail.com>
 * @since r20.1.0
 *
 * @param {string} input
 * @returns {[string|null, string]}
 */
module.exports.channel = function channel(input) {
    let id, rest;

    // Try to parse a plain ID
    [id, rest] = module.exports.id(input);
    if (id !== null ) return [id, rest];

    // Try to parse an ID from a tag "<@&XXX...>"
    const re = /^<#(\d+)>(\s|$)+/;
    const match = input.match(re);

    if (match === null) return [null, input];

    id = match[1];
    rest = input.substring(match[0].length);
    return [id, rest];
};


/**
 * Parse an emoji as either a unicode emoji or a "<:custom_emoji:xxx>"
 *
 * @author Kay <kylrs00@gmail.com>
 * @since r20.1.0
 *
 * @param {string} input
 * @returns {[string|null, string]}
 */
module.exports.emoji = function emoji(input) {

    // Annoying emoji that don't play right if matched with unicode regex
    const emojiChars = {
        a: '🇦', b: '🇧', c: '🇨', d: '🇩', e: '🇪', f: '🇫', g: '🇬', h: '🇭', i: '🇮', j: '🇯', k: '🇰', l: '🇱', m: '🇲',
        n: '🇳', o: '🇴', p: '🇵', q: '🇶', r: '🇷', s: '🇸', t: '🇹', u: '🇺', v: '🇻', w: '🇼', x: '🇽', y: '🇾', z: '🇿',
        0: '0️⃣', '#': '#️⃣', '*': '*️⃣', '!': '❗', '?': '❓',
        1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣',
        6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣', 10: '🔟',
    };

    for (let emoji of Object.values(emojiChars)) {
        if (input.startsWith(emoji)) {
            const rest = input.substring(emoji.length);
            return [emoji, rest];
        }
    }

    // Discord custom emoji or regular unicode emoji
    const re = /^(<:[0-9A-Za-z_]*:\d+>)|(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])(\s|$)+/;
    const match = input.match(re);

    if (match !== null) {
        const emoji = match[0].trim();
        const rest = input.substring(match[0].length);
        return [emoji, rest];
    }

    return [null, input];
};


/**
 * Take a parsing function X, and return a parsing function that succeeds even if parsing X fails, without consuming input
 *
 * @author Kay <kylrs00@gmail.com>
 * @since r20.2.0
 *
 * @param {function(string):[any, string]} arg
 * @returns {function(string):[any, string]}
 */
module.exports.optional = function optional(arg) {
    const key = `?${arg.name}`;
    // Use an object property to give the function a dynamic name
    const wrapper = {
        [key]: function(input) {
            const [match, rest] = arg(input);
            if (match === null) return [undefined, input];
            return [match, rest];
        }
    };

    return wrapper[key];
};


/**
 * Take a list of parsing functions, and return a parsing function which will return the result of the first successful match of these functions
 *
 * @author Kay <kylrs00@gmail.com>
 * @since r20.2.0
 *
 * @param {function(string):[any, string]} args
 * @returns {function(string):[any, string]}
 */
module.exports.choice = function choice(...args) {
    const key = args.map((x) => x.name).join('|');
    // Use an object property to give the function a dynamic name
    const wrapper = {
        [key]: function(input) {
            for (let arg of Object.values(args)) {
                const [match, rest] = arg(input);
                if (match !== null) return [match, rest];
            }
            return [null, input];
        }
    };

    return wrapper[key];
};


/**
 * Take a string and return a parsing function that matches and consumes that exact string.
 *
 * @author Kay <kylrs00@gmail.com>
 * @since r20.2.0
 *
 * @param {string} arg
 * @returns {function(string):[any, string]}
 */
module.exports.i =
module.exports.ident = function ident(arg) {
    const key = `'${arg}'`;
    // Use an object property to give the function a dynamic name
    const wrapper = {
        [key]: function(input) {
            if (input.startsWith(arg)) {
                const rest = input.slice(arg.length).trim();
                return [arg, rest];
            }
            return [null, input];
        }
    };

    return wrapper[key];
};


/**
 * Return a parsing function that matches the input function one or more times
 *
 * @author Kay <kylrs00@gmail.com>
 * @since r20.2.0
 *
 * @param {function(string):[any, string]} arg
 * @returns {function(string):[any, string]}
 */
module.exports.some = function some(arg) {
    const key = `${arg.name}...`;
    // Use an object property to give the function a dynamic name
    const wrapper = {
        [key]: function(input) {
            const matches = [];
            let match, rest = input;

            do {
                [match, rest] = arg(rest);
                if (match === null) break;
                matches.push(match);
            } while (true);

            if (matches.length === 0) return [null, input];

            return [matches, rest.trimStart()];
        }
    };

    return wrapper[key];
};
