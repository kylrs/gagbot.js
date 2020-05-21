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
    const re = /^\S+(\s|$)+/;
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


// TODO: Add boolean, User, Emoji, Channel, Message, Role, flag types
