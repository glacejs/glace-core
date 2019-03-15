"use strict";

/**
 * Contains global framework functions and helpers.
 *
 * @module
 */

var util = require("util");

var chai = require("chai");
var sinon = require("sinon");

chai.use(require("chai-as-promised"));
chai.use(require("chai-datetime"));
chai.use(require("chai-fs"));
chai.use(require("chai-string"));
chai.use(require("sinon-chai"));

require("../matcher");
var CONF = require("../config");
var plugins = require("../plugins");
var Steps = require("../steps");
var ScopeType = require("../testing").ScopeType;

if (CONF.report.deepErrors) {
    chai.config.truncateThreshold = 0;
}

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
 * Allure helper.
 *
 * @global
 */
global.allure = require("../allure");
/**
 * Steps collection.
 *
 * @global
 * @type {Steps}
 * @see {@link module:steps/index|steps} to get more details about its methods.
 */
global.$ = Steps.getInstance();

global.scope = require("./scope");

/**
 * Creates tests suite.
 *
 * @global
 * @function
 * @arg {string} name - Suite name.
 * @arg {function[]} [fixtures] - List of fixtures.
 * @arg {object} [opts] - Suite options.
 * @arg {number} [opts.chunkRetry] - Number of chunk retries on failure.
 * @arg {number} [opts.chunkTimeout] - Time to execute chunk or hook, sec.
 * @arg {function} func - Callback function with test cases.
 * @example

suite("Some test suite", () => {
    test("Some test name", () => {
        before(() => {
            someFunc();
        });
        chunk("chunk #1", () => {
            someFunc();
        });
        chunk("chunk #2", () => {
            someFunc();
        });
    });
});

 */
global.suite = (name, fixtures, opts, func) => {
    scope(new ScopeType(name).setType("suite"), fixtures, opts, func);
};

global.session = require("./session");
global.test = require("./test");
global.jaki = global.jaki_chunk = global.chunk = require("./chunk");
global.forEachLanguage = require("./forEachLanguage");

/**
 * Global function, existing in `glace` tests, which create `before` hook.
 *
 * `before` hook executes before all chunks in test or all tests in <a href="#scope">scope</a> /
 * <a href="#suite">suite</a> / <a href="#session">session</a>.
 *
 * @global
 * @function before
 * @arg {function} func - Hook function. Can be `async` too.
 *
 * @example <caption><b>before chunks</b></caption>
 *
 * test("my test", () => {
 *
 *     before(() => {
 *         doSomeThing();
 *     });
 *
 *     chunk("first chunk", () => {
 *         doSomeThingAgain();
 *     });
 *
 *     chunk("second chunk", () => {
 *         andDoSomeThingAgain();
 *     });
 * });
 *
 * @example <caption><b>before tests</b></caption>
 *
 * suite("my suite", () => {
 *
 *     before(async () => {
 *         await db.connect();
 *     });
 *
 *     test("first", () => {
 *         chunk(async () => {
 *             await db.query("select * from users");
 *         });
 *     });
 *
 *     test("second", () => {
 *         chunk(async () => {
 *             await db.query("select * from products");
 *         });
 *     });
 * });
 */

/**
 * Global function, existing in `glace` tests, which create `after` hook.
 *
 * `after` hook executes after all chunks in test or all tests in <a href="#scope">scope</a> /
 * <a href="#suite">suite</a> / <a href="#session">session</a>.
 *
 * @global
 * @function after
 * @arg {function} func - Hook function. Can be `async` too.
 *
 * @example <caption><b>after chunks</b></caption>
 *
 * test("my test", () => {
 *
 *     after(() => {
 *         doSomeThing();
 *     });
 *
 *     chunk("first chunk", () => {
 *         doSomeThingAgain();
 *     });
 *
 *     chunk("second chunk", () => {
 *         andDoSomeThingAgain();
 *     });
 * });
 *
 * @example <caption><b>after tests</b></caption>
 *
 * suite("my suite", () => {
 *
 *     after(async () => {
 *         await db.connect();
 *     });
 *
 *     test("first", () => {
 *         chunk(async () => {
 *             await db.query("select * from users");
 *         });
 *     });
 *
 *     test("second", () => {
 *         chunk(async () => {
 *             await db.query("select * from products");
 *         });
 *     });
 * });
 */

/**
 * Global function, existing in `glace` tests, which creates `beforeChunk` hook.
 *
 * `beforeChunk` hook executes before each chunk in test.
 *
 * @global
 * @function
 * @arg {function} func - Hook function.
 *
 * @example
 *
 * test("Some test", () => {
 *
 *     beforeChunk(() => {
 *         someFunc();
 *     });
 *
 *     chunk("Chunk #1", () => {
 *         someFunc();
 *     });
 *
 *     chunk("Chunk #2", () => {
 *         someFunc();
 *     });
 * });
 */
global.beforeChunk = beforeEach;

/**
 * Global function, existing in `glace` tests, which creates `afterChunk` hook.
 *
 * `afterChunk` hook executes after each chunk in test.
 *
 * @global
 * @function
 * @arg {function} func - Hook function.
 *
 * @example
 *
 * test("Some test", () => {
 *
 *     afterChunk(() => {
 *         someFunc();
 *     });
 *
 *     chunk("Chunk #1", () => {
 *         someFunc();
 *     });
 *
 *     chunk("Chunk #2", () => {
 *         someFunc();
 *     });
 * });
 */
global.afterChunk = afterEach;

/* Load globals from plugins */
plugins.getModules("globals");
