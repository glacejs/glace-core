"use strict";

var util = require("util");

var CONF = require("../config");

/**
 * Defines test chunk.
 * 
 * Contains actions and verifications, which will be executed separatly
 * from another chunks. This function is used to organize test
 * structure and to allocate independent test actions.
 *
 * @global
 * @function
 * @arg {string} [name] - Name of chunk.
 * @arg {object} [opts] - Chunk options.
 * @arg {number} [opts.retry] - Number of chunk retries on failure.
 * @arg {number} [opts.timeout] - Time limit to execute chunk, sec.
 * @arg {function} func - Callback function with test payload.
 *
 * @example <caption><b>Anonymous chunk</b></caption>
 *
 * test("My test", () => {
 *     chunk(() => {
 *         var a = 5;
 *         expect(a).to.be.equal(2);
 *     });
 * });
 *
 * @example <caption><b>Named chunk</b></caption>
 *
 * test("My test", () => {
 *     chunk("My chunk", () => {
 *         var a = 5;
 *         expect(a).to.be.equal(2);
 *     });
 * });
 *
 * @example <caption><b>Chunk with options</b></caption>
 *
 * test("My test", () => {
 *     chunk("My chunk", { retry: 2, timeout: 1 }, () => {
 *         var a = 5;
 *         expect(a).to.be.equal(2);
 *     });
 * });
 */
var chunk = (name, opts, func) => {

    if (name instanceof Function) {
        func = name;
        name = "";
        opts = {};
    }

    if (opts instanceof Function) {
        func = opts;
        opts = {};
    }

    if (name instanceof Object) {
        opts = name;
        name = "";
    }

    name = name || "";
    opts = opts || {};

    CONF.counters.chunkId++;
    const chunkId = CONF.counters.testId + "_" + CONF.counters.chunkId;
    if (CONF.counters.passedChunkIds.includes(chunkId)) return;

    it(name, _chunkCb(name, chunkId, opts, func));
};

/**
 * Chunk callback.
 * @ignore
 */
var _chunkCb = (name, chunkId, opts, func) => function () {
    CONF.test.curCase.addChunk(name);
    CONF.counters.curChunkId = chunkId;

    if (opts.retry) this.retries(opts.retry);
    if (opts.timeout) this.timeout(opts.timeout * 1000);

    var result = func();

    if (util.isObject(result) && util.isFunction(result.then)) {
        result = result.then(r => {
            if (r === false) CONF.test.curCase.skipChunk = name;
            return r;
        });
    } else {
        if (result === false) CONF.test.curCase.skipChunk = name;
    }

    return result;
};

module.exports = chunk;
