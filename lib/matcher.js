"use strict";
/**
 * Matchers.
 *
 * @module
 */

var _ = require("lodash");
var Assertion = require("chai").Assertion;
var U = require("glace-utils");
/**
 * Checks expectation corresponds to condition.
 *
 * @method
 * @arg {string} cond - conditions for assertion.
 * @arg {string} [msg] - message to throw in case of wrong conditions.
 * @example

 await SS.checkBalance({ "to be not equal": 100 })

 Steps.prototype.checkBalance = async function (condition) {
    var currBalance = await this.getBalance();

    expect(currBalance).correspond(condition, "Invalid user balance");
};
 */
Assertion.prototype.correspond = function (cond, msg) {
    var matchers, expVal;

    if (msg) this.__flags.message = msg;

    if (typeof(cond) === "object") {
        if (Object.keys(cond).length !== 1) {
            throw new Error("Condition should contain only one key-value pair");
        }
        matchers = Object.keys(cond)[0];
        expVal = Object.values(cond)[0];
    } else if (typeof(cond) === "string") {
        matchers = cond;
    } else {
        throw new Error("Condition should be string or object only");
    }
    matchers = _.filter(_.split(matchers, " "));

    var predicate = this;
    for (var matcher of matchers) {
        predicate = predicate[matcher];
        if (!predicate) throw new TypeError(`Undefined matcher '${matcher}'`);
    }
    if (expVal) predicate.call(this, expVal);
    return this;
};
/**
 * Checks expectation corresponds to condition during timeout.
 * 
 * @arg {string|object} cond - Condition for assertion.
 * @arg {number} [timeout=1] - Timeout to wait for matching.
 * @arg {string} [msg] - Error message.
 * @throws {Error} If condition wasn't matched during timeout.
 */
Assertion.prototype.waitFor = async function (cond, timeout, msg) {
    var err = null;
    var predicate = async () => {
        try {
            return await new Assertion(
                await this.__flags.object(),
                this.__flags.message).correspond(cond, msg);
        } catch (e) {
            err = e;
            return false;
        }
    };

    var result = await U.waitFor(predicate, { timeout: timeout });
    if (result) return this;

    if (err) {
        throw err;
    } else {
        throw new Error("Unexpected matcher error");
    }
};
