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
Mocha.Runner.prototype.hook = function (name, fn) {
    var suite = this.suite;
    var hooks = suite["_" + name];
    var self = this;

    function next (i) {
        var hook = hooks[i];
        if (!hook) {
            return fn();
        }
        self.currentRunnable = hook;

        hook.ctx.currentTest = self.test;

        self.emit("hook", hook);

        if (!hook.listeners("error").length) {
            hook.on("error", function (err) {
                self.failHook(hook, err);
            });
        }

        hook.run(function (err) {
            var testError = hook.error();
            if (testError) {
                self.fail(self.test, testError);
            }
            if (err) {
                if (err instanceof Pending) {
                    if (name === "beforeEach" || name === "afterEach") {
                        self.test.pending = true;
                    } else {
                        suite.tests.forEach(function (test) {
                            test.pending = true;
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
            self.emit("hook end", hook);
            delete hook.ctx.currentTest;
            next(++i);
        });
    }

    Mocha.Runner.immediately(function () {
        next(0);
    });
};