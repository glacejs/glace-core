"use strict";

/**
 * Contains global framework functions and helpers.
 *
 * @module
 */

var util = require("util");

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

var stubObject = (obj, returns, processed) => {
    processed = processed || [];
    processed.push(obj);

    for (var prop in obj) {

        if (prop.startsWith("__") || ["prototype", "constructor"].includes(prop)) {
            continue;
        }

        if (util.isFunction(obj[prop])) {
            obj[prop] = sinon.stub();

            if (returns) {
                if (util.isObject(returns)) {
                    if (prop in returns) obj[prop].returns(returns[prop]);
                } else {
                    obj[prop].returns(returns);
                }
            }
        }

        if (util.isObject(obj[prop]) && !processed.includes(obj[prop])) {
            obj[prop] = stubObject(obj[prop], returns, processed);
        }
    }
    return obj;
};
/**
 * Stubs object with its properties recursively.
 *
 * @global
 * @arg {object} obj - Object to stub.
 * @arg {object|number|string} returns - Returned values.
 * @return {object} Object with stubbed functions.
 */
global.stubObject = stubObject;

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
global.$ = global.$$ = global.SS = Steps.getInstance();

global.scope = require("./scope");
global.suite = (name, opts, fixtures, func) => {
    if (!CONF.testSuites.includes(name)) CONF.testSuites.push(name);
    scope(name, opts, fixtures, func);
};
global.session = require("./session").session;
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
