/**
 * Describes a list of arguments and their types
 *
 * @author Kay <kylrs00@gmail.com>
 * @license ISC - For more information, see the LICENSE.md file packaged with this file.
 * @since r20.0.0
 * @version v1.1.0
 */
module.exports = class ArgumentList {

    #args;
    #types;

    /**
     * ArgumentList constructor
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.0.0
     */
    constructor() {
        this.#args = {};
        this.#types = {};
    }

    /**
     * Insert an argument and its type into to data structure
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.0.0
     *
     * @param name
     * @param arg
     * @param type
     */
    add(name, arg, type) {
        this.#args[name] = arg;
        this.#types[name] = type;
    }

    /**
     * Get an argument's value by name
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @param name
     * @returns {*}
     */
    get(name) {
        return this.#args[name];
    }

    /**
     * Get an argument's type by name
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @param name
     * @returns {*}
     */
    typeOf(name) {
        return this.#args[name];
    }

    /**
     * Return the array/object of argument values in JSON format
     *
     * @author Kay <kylrs00@gmail.com>
     * @since r20.1.0
     *
     * @returns {string}
     */
    asString() {
        return JSON.stringify(this.#args, null, 4);
    }
};