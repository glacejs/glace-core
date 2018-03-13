/* global beforeEach afterEach */

"use strict";

/**
 * Contains global framework functions and helpers.
 *
 * @module
 */

var chai = require("chai");
var chai_as_promised = require("chai-as-promised");
var sinon = require("sinon");
var sinon_chai = require("sinon-chai");

chai.use(chai_as_promised);
chai.use(sinon_chai);

require("../matcher");
var CONF = require("../config");
var plugins = require("../plugins");
var Steps = require("../steps");
/**
 * `chaijs` `expect` function.
 *
 * @global
 * @function
 * @arg {*} actualValue - Some actual value which should be checked.
 * @see {@link http://chaijs.com/|chaijs} to get more details about
 *  `expect` usage.
 * @example

expect(1).to.be.equal(1);
expect(2).to.be.gte(0);

 */
global.expect = chai.expect;
/**
 * `SinonJS` is pretty nice lib for mocking.
 *
 * @global
 */
global.sinon = sinon;

global.rewire = require("./rewire");

/**
 * `GlaceJS` config.
 *
 * @global
 * @see {@link module:config|config} to get more details about its options.
 */
global.CONF = CONF;
/**
 * Atomic steps collection.
 *
 * @global
 * @type {Steps}
 * @see {@link module:steps/index|steps} to get more details about its methods.
 */
global.SS = Steps.getInstance();

global.scope = require("./scope");
global.session = require("./session");
global.test = require("./test");
global.chunk = require("./chunk");
global.forEachLanguage = require("./forEachLanguage");

/**
 * Executes before each test chunk.
 *
 * @global
 * @function
 * @arg {string} name - Name of test case.
 * @arg {function} func - Hook function.
 * @example

test("Some test", () => {
    beforeChunk(() => {
        someFunc();
    });
    chunk("Chunk #1", () => {
        someFunc();
    });
    chunk("Chunk #2", () => {
        someFunc();
    });
});

 */
global.beforeChunk = beforeEach;
/**
 * Executes after each test chunk.
 *
 * @global
 * @function
 * @arg {string} name - Name of test case.
 * @arg {function} func - Hook function.
 * @example

test("Some test", () => {
    afterChunk(() => {
        someFunc();
    });
    chunk("Chunk #1", () => {
        someFunc();
    });
    chunk("Chunk #2", () => {
        someFunc();
    });
});

 */
global.afterChunk = afterEach;

/* Load globals from plugins */
plugins.getModules("globals");