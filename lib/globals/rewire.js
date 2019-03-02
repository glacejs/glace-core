"use strict";

const path = require("path");
const _rewire = require("rewire");

const getCallerPath = () => {
    const _ = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    const stack = new Error().stack.slice(1);
    Error.prepareStackTrace = _;
    return stack[0].getFileName();
};

/**
 * `rewire` is great lib for monkey patching, but it should be a bit patched too :)
 *
 * @global
 */
module.exports = filename => {

    if (filename.startsWith(".")) {
        const callerPath = getCallerPath();
        const callerDir = callerPath ? path.dirname(callerPath) : process.cwd();
        filename = path.resolve(callerDir, filename);
    }

    const mod = _rewire(filename);

    let cache = {};

    const set = mod.__set__;
    mod.__set__ = function (name, stub) {

        if (!Object.keys(cache).includes(name)) {
            cache[name] = this.__get__(name);
        }

        set.call(this, name, stub);
    };

    mod.__reset__ = function () {
        for (const [k, v] of Object.entries(cache)) {
            this.__set__(k, v);
        }
        cache = {};
    };

    return mod;
};
