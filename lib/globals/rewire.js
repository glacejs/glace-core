"use strict";

var path = require("path");
var _rewire = require("rewire");

/**
 * `rewire` is great lib for monkey patching, but it should be a bit patched too :)
 *
 * @global
 */
var rewire = filename => {

    var _ = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    var stack = new Error().stack.slice(1);
    Error.prepareStackTrace = _;
    var callerPath = stack[0].getFileName();

    var callerDir = path.dirname(callerPath);
    filename = path.resolve(callerDir, filename);

    var mod = _rewire(filename);

    var cache = {};

    var set = mod.__set__;
    mod.__set__ = function (name, stub) {

        if (!Object.keys(cache).includes(name)) {
            cache[name] = this.__get__(name);
        };

        set.call(this, name, stub);
    };

    mod.__reset__ = function () {
        for (var [k, v] of Object.entries(cache)) {
            this.__set__(k, v);
        };
        cache = {};
    };

    return mod;
};

module.exports = rewire;
