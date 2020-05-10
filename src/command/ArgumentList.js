/**
 * Describes a list of arguments and their types
 *
 * @author Kay <kylrs00@gmail.com>
 * @type {ArgumentList}
 */
module.exports = class ArgumentList {

    #args;
    #types;

    constructor() {
        this.#args = {};
        this.#types = {};
    }

    /**
     * Insert an argument and its type into to data structure
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
     * @param name
     * @returns {*}
     */
    arg(name) {
        return this.#args[name];
    }

    /**
     * Get an argument's type by name
     *
     * @param name
     * @returns {*}
     */
    type(name) {
        return this.#args[name];
    }

    /**
     * Return a Proxy of this ArgumentList, allowing use of [] indexing.
     *
     * @returns {ArgumentList}
     */
    indexable() {
        return new Proxy(this, {
            get: (target, name) => target.arg(name)
        });
    }

    /**
     * Return the array/object of argument values in JSON format
     *
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.#args);
    }
};