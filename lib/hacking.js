"use strict";
/**
 * Contains hacks for test run.
 *
 * @module
 */

const util = require("util");

const _ = require("lodash");
const LOG = require("glace-utils").logger;
const Mocha = require("mocha");
const Pending = require("mocha/lib/pending");
const mochaUtils = require("mocha/lib/utils");
mochaUtils.isString = _.isString; // monkey patch mocha to define instance of `String` as string not as object

const CONF = require("./config");
const utils = require("./utils");

/**
 * Patches original `Mocha.Runner.prototype.uncaught` in order to process
 * uncaught exceptions flexible.
 * @ignore
 */
module.exports.suppressMochaUncaught = () => {
    Mocha.Runner.prototype.uncaught = function (err) {
        LOG.error(util.format("UNCAUGHT EXCEPTION", err));
        if (CONF.session.uncaughtException === "fail") {
            utils.accountError("Uncaught exception", err);
        }
    };
};

/**
 * Patches mocha runner to allow multiple independent `after`-calls.
 */
Mocha.Runner.prototype.hook = function(name, fn) {
    var suite = this.suite;
    var hooks = suite.getHooks(name);
    var self = this;

    function next(i) {
        var hook = hooks[i];
        if (!hook) {
            return fn();
        }
        self.currentRunnable = hook;

        if (name === "beforeAll") {
            hook.ctx.currentTest = hook.parent.tests[0];
        } else if (name === "afterAll") {
            hook.ctx.currentTest = hook.parent.tests[hook.parent.tests.length - 1];
        } else {
            hook.ctx.currentTest = self.test;
        }

        self.emit(Mocha.Runner.constants.EVENT_HOOK_BEGIN, hook);

        if (!hook.listeners("error").length) {
            hook.on("error", function(err) {
                self.failHook(hook, err);
            });
        }

        hook.run(function(err) {
            var testError = hook.error();
            if (testError) {
                self.fail(self.test, testError);
            }
            if (err) {
                if (err instanceof Pending) {
                    if (name === Mocha.Suite.constants.HOOK_TYPE_BEFORE_EACH ||
                        name === Mocha.Suite.constants.HOOK_TYPE_AFTER_EACH) {
                        self.test.pending = true;
                    } else {
                        suite.tests.forEach(function(test) {
                            test.pending = true;
                        });
                        suite.suites.forEach(function(suite) {
                            suite.pending = true;
                        });
                        // a pending hook won't be executed twice.
                        hook.pending = true;
                    }
                } else {
                    self.failHook(hook, err);

                    // stop executing hooks, notify callee of hook err
                    if (!name.startsWith("after")) return fn(err);
                }
            }
            self.emit(Mocha.Runner.constants.EVENT_HOOK_END, hook);
            delete hook.ctx.currentTest;
            next(++i);
        });
    }

    Mocha.Runner.immediately(function() {
        next(0);
    });
};
