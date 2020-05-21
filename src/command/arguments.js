/**
 * Parsing functions for bot command arguments
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.1.0
 * @version v1.1.0
 */

/**
 * Parse a continuous string of non-whitespace characters.
 *
 * TODO: Allow delimited strings (allowing whitespace)
 *
 * @author Kay <kylrs00@gmail.com>
 * @since r20.1.0
 *
 * @param {string} input
 * @returns {[string|null, string]}
 */
module.exports.str = function str(input) {
    const re = /^("((\\.)|[^\\"])")|(\S+)(\s|$)+/;
    const match = input.match(re);

    if (match === null) return [null, input];

    const str = match[0].trim();
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
    const re = /([A-Za-z0-9]+_\d+)|(^-?\d*\.?\d+([Ee][-+]?\d+)?)(\s|$)+/;
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
    const re = /((true)|(false)|t|f)(\s|$)+/i;
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
    const re = /(\d+)(\s|$)+/;
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
    const re = /<@!(\d+)>(\s|$)+/;
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
    const re = /<@&(\d+)>(\s|$)+/;
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
    const re = /<#(\d+)>(\s|$)+/;
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

    const re = /(<:[0-9A-Za-z_]+:\d+>)|(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])(\s|$)+/;
    const match = input.match(re);

    if (match === null) return [null, input];

    const emoji = match[0].trim();
    const rest = input.substring(match[0].length);
    return [emoji, rest];
};
