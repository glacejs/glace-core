"use strict";
/**
 * Contains global framework functions and helpers.
 *
 * @module
 */

var fs = require("fs");
var path = require("path");

var _ = require("lodash");
var chai = require("chai");
var chai_as_promised = require("chai-as-promised");
var U = require("glace-utils");
var LOG = U.logger;
chai.use(chai_as_promised);

require("./matcher");
var CONF = require("./config");
var hacking = require("./hacking");
var plugins = require("./plugins");
var TestCase = require("./testing").TestCase;
/**
 * Helper to set actual log file.
 *
 * @function
 */
var setLog = () => {
    var testName = CONF.curTestCase ? _.kebabCase(CONF.curTestCase.name) : "";
    var logFile = path.resolve(CONF.reportsDir, testName, "logs", "test.log");
    LOG.setFile(logFile);
};
setLog(); // Set log immediatelly.
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
global.sinon = require("sinon");
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
 * @see {@link module:steps/index|steps} to get more details about its methods.
 */
global.SS = new (require("./steps"));
/**
 * Execute tests scope.
 *
 * @global
 * @function
 * @arg {string} name - Scope name.
 * @arg {object} [opts] - Scope options.
 * @arg {?number} [opts.chunkTimeout] - Time to execute chunk or hook, sec.
 * @arg {function[]} [fixtures] - List of fixtures.
 * @arg {function} func - Function with test cases.
 * @example

scope("Some test scope", () => {
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
global.scope = (name, opts, fixtures, func) => {

    if (opts instanceof Function) {
        func = opts;
        opts = {};
        fixtures = [];
    };
    if (fixtures instanceof Function) {
        func = fixtures;
        fixtures = [];
    };
    opts = opts || {};
    fixtures = fixtures || {};

    describe(name, function () {
        if (opts.chunkTimeout) this.timeout(opts.chunkTimeout * 1000);
        U.wrap(fixtures, func)();
    });
};
/**
 * Executed sessions counter.
 * 
 * @type {Number}
 */
var sessNum = 0;
/**
 * Executes tests session.
 *
 * @global
 * @function
 * @arg {string} [name] - Session name. By default it includes start date time.
 * @arg {object} [ctx] - Session context. By default it's empty.
 * @arg {function} func - Function with test cases.
 * @example

session(() => {
    test("Test #1", () => {
        chunk("Chunk #1", () => {
            someFunc();
        });
        chunk("Chunk #2", () => {
            someFunc();
        });
    });
    test("Test #2", () => {
        chunk("Chunk #1", () => {
            someFunc();
        });
        chunk("Chunk #2", () => {
            someFunc();
        });
    });
});

 */
global.session = (name, ctx, fixtures, func) => {
    var defName = `Session ${new Date().toLocaleString()}`;

    if (name instanceof Function) {
        func = name;
        name = defName;
        ctx = {};
        fixtures = [];
    };
    if (ctx instanceof Function) {
        func = ctx;
        ctx = {};
        fixtures = [];
    };
    if (fixtures instanceof Function) {
        func = fixtures;
        fixtures = [];
    };
    name = name || defName;
    ctx = ctx || {};
    fixtures = fixtures || [];

    sessNum++;
    ctx.sessionNumber = sessNum;

    scope(name, () => {
        before(() => CONF.isRunPassed = true);
        U.wrap(fixtures, func)();
    });
};
/**
 * Basis for any test case.
 *
 * If test with the same was registered already, this test will be omitted
 * with corresponding error in log.
 *
 * If retries amount is specified and this test was failed, the test will be
 * added to queue in separated session with title containing `Retry` and its
 * number.
 *
 * @abstract
 * @function
 * @arg {string} name - Name of test case.
 * @arg {object} [opts] - Options.
 * @arg {boolean} [opts.skip=false] - Flag to skip test.
 * @arg {number} [opts.retry=0] - Number of retries on failure. May be managed
 *  in config.
 * @arg {?number} [opts.chunkTimeout=null] - Time to execute chunk or hook, sec.
 * @arg {function[]} [fixtures] - Involved fixtures list.
 * @arg {function} func - Test function.
 */
var baseTest = (names => {
    return (name, opts, fixtures, func) => {

        if (names.includes(name)) {
            LOG.warn(`Test case '${name}' is added already.`,
                     `Test case with the same name will be omitted.`);
            return;
        };

        if (opts instanceof Function) {
            func = opts;
            opts = {};
            fixtures = [];
        };
        if (fixtures instanceof Function) {
            func = fixtures;
            fixtures = [];
        };
        opts = opts || {};
        fixtures = fixtures || [];

        opts.skip = U.defVal(opts.skip, false);
        opts.retry = U.defVal(opts.retry, CONF.testRetries, 0);
        opts.chunkTimeout = U.defVal(opts.chunkTimeout);

        if (opts.skip) {
            LOG.warn(`Test '${name}' is marked as skipped and will be omitted`);
            return;
        };
        names.push(name);

        var testCase = new TestCase(name);
        var retries = opts.retry;

        CONF.testCases.push(testCase);

        var testFunc = ctxs => {
            ctxs = ctxs || [{}];

            scope(name, { chunkTimeout: opts.chunkTimeout }, () => {

                before(() => {
                    testCase.reset();
                    testCase.start();
                    CONF.curTestCase = testCase;
                    setLog(); // Current test case is started, need to reinit log
                });

                U.wrap(fixtures, () => {
                    for (var ctx of ctxs) func(ctx);
                })();

                after(() => {
                    if (testCase.errors.length) {
                        testCase.end(TestCase.FAILED);
                    } else {
                        testCase.end(TestCase.PASSED);
                    };

                    CONF.curTestCase = null;
                    setLog(); // Current test case is finished, need to reinit log

                    if (testCase.status !== TestCase.FAILED || retries <= 0) {
                        return;
                    };
                    retries--;

                    var retryNum = opts.retry - retries;
                    var sessName = `Retry #${retryNum}`;
                    /* Hack to pass mocha grep */
                    var mochaRunner = hacking.getRunner();
                    if (mochaRunner._grep !== mochaRunner._defaultGrep) {
                        sessName += " - " + mochaRunner._grep.source;
                    };
                    var sessCtx = { retryNumber: retryNum };

                    session(sessName, sessCtx, null, () => {
                        testFunc(testCase.failedParams);
                    });
                });
            });
        };
        testFunc();
    };
})([]);
/**
 * Executes test case.
 *
 * @global
 * @function
 * @arg {string} name - Name of test case.
 * @arg {object} [opts] - Options.
 * @arg {boolean} [opts.video=true] - Flag to involve video fixture.
 * @arg {boolean} [opts.skip=false] - Flag to skip test.
 * @arg {number} [opts.retry=0] - Number of retries on failure. May be managed
 *  in config.
 * @arg {function[]} [fixtures] - Involved fixtures list.
 * @arg {function} func - Test function.
 * @example

test("Some test", () => {
    chunk("Some chunk", () => {
        someFunc();
    });
});

 */
global.test = (name, opts, fixtures, func) => {

    if (opts instanceof Function) {
        func = opts;
        opts = {};
        fixtures = [];
    };
    if (fixtures instanceof Function) {
        func = fixtures;
        fixtures = [];
    };
    opts = opts || {};
    fixtures = fixtures || [];

    baseTest(name, opts, fixtures, ctx => {
        func(ctx);
    });
};
/**
 * Executes test chunk.
 * 
 * Contains actions and verifications, which will be executed separatly
 * from another chunks. This function is used to organize test
 * structure and to allocate independent test actions.
 *
 * @global
 * @function
 * @arg {string} [name] - Name of test case.
 * @arg {function} func - Step function.
 * @example

test("Some test", () => {
    chunk("Some chunk", () => {
        someFunc();
    });
});

 */
global.chunk = (name, func) => {
    if (name instanceof Function) {
        func = name;
        name = "";
    };
    it(name, func);
};
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
/**
 * Iterates test chunks through all languages specifed in config.
 *
 * It's applicable for multilingual application. If list of languages is
 * specified, it will be used firstly. Otherwise from configuration.
 *
 * @global
 * @function
 * @arg {object} [ctx] - Test case context.
 * @arg {object} [opts] - Options.
 * @arg {?string[]} [opts.languages] - List of tested languages.
 * @arg {function[]} [fixtures] - Involved fixtures list.
 * @arg {function} func - Function with test steps.
 * @example

test("Some test", ctx => {
    forEachLanguage(ctx, lang => {
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
});

 */
global.forEachLanguage = (ctx, opts, fixtures, func) => {

    if (ctx instanceof Function) {
        func = ctx;
        ctx = {};
        opts = {};
        fixtures = [];
    };
    if (opts instanceof Function) {
        func = opts;
        opts = {};
        fixtures = [];
    };
    if (fixtures instanceof Function) {
        func = fixtures;
        fixtures = [];
    };
    ctx = ctx || {};
    opts = opts || {};
    fixtures = fixtures || [];

    var languages = ctx.language ? [ctx.language]
                                 : (opts.languages || CONF.languages);
    languages.forEach(lang => {

        scope(`for language "${lang}"`, () => {
            before(() => {
                if (CONF.curTestCase) {
                    CONF.curTestCase.testParams.language = lang;
                };
            });
            U.wrap(fixtures, () => func(lang))();
        });
    });
};
/* Load globals from plugins */
plugins.getModules("globals");
