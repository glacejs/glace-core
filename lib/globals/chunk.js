"use strict";

const _ = require("lodash");
const isPromise = require("is-promise");

const CONF = require("../config");

/**
 * Global function, existing in `glace` tests, which creates test chunk.
 *
 * `chunk` is independently executed part of `test`. It means that even if
 * first chunk is failed, other will be executed in any case. `test` should
 * contain as minimum one `chunk`.
 *
 * @global
 * @function
 * @arg {string} [name=null] - Name of chunk.
 * @arg {object} [opts] - Chunk options.
 * @arg {?number} [opts.retry=null] - Number of chunk retries on failure. Overrides
 * [config](GlaceConfig.html#test-chunk-retry) and [test](#test-chunk-retry) settings.
 * @arg {?number} [opts.timeout=null] - Time limit to execute chunk, **sec**. Overrides
 * [config](GlaceConfig.html#test-chunk-timeout) and [test](#test-chunk-timeout) settings.
 * @arg {function} func - Callback function with test payload. Can be `async` too.
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
 *
 * @example <caption><b>Several chunks in test</b></caption>
 *
 * test("My test", () => {
 *     chunk("first chunk", () => {
 *         expect(2).to.be.equal(3);
 *     });
 *     chunk("second chunk", () => {
 *         expect(3).to.be.equal(3);
 *     });
 * });
 *
 * @example <caption><b>Async chunk</b></caption>
 *
 * test("My test", () => {
 *     chunk(async () => {
 *         await Promise.resolve("done!");
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
    expect(CONF.test.curCase, "Oops! Chunk is used outside of test").to.exist;
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
