"use strict";

const _ = require("lodash");
const isPromise = require("is-promise");

const CONF = require("../config");

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
const chunk = (name, opts, func) => {

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

    CONF.chunk.id++;
    const chunkId = CONF.test.id + "_" + CONF.chunk.id;

    if (CONF.chunk.passedIds.includes(chunkId)) return;

    if (CONF.retry.id) {
        if (!_.flatMap(CONF.retry.chunkIds).includes(chunkId)) return;
    } else {
        CONF.retry.curChunkIds.push(chunkId);
    };

    it(name, _chunkCb(name, chunkId, opts, func));
};

/**
 * Chunk callback.
 * @ignore
 */
const _chunkCb = (name, chunkId, opts, func) => function () {
    expect(CONF.test.curCase).to.exist;
    CONF.test.curCase.addChunk(name);
    CONF.chunk.curId = chunkId;

    if (opts.retry) this.retries(opts.retry);
    if (opts.timeout) this.timeout(opts.timeout * 1000);

    let result = func();

    if (isPromise(result)) {
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
