"use strict";
/**
 * `GlaceJS` xunit reporter.
 *
 * @module
 */

const fs = require("fs");
const path = require("path");

require("colors");
const escape = require("mocha").utils.escape;
const fse = require("fs-extra");

const CONF = require("../config");
const TestCase = require("../testing").TestCase;

let stream;

module.exports = {

    start: () => {
        if (fs.existsSync(CONF.xunit.path)) {
            fs.unlinkSync(CONF.xunit.path);
        }
    },

    end: () => {
        fse.mkdirsSync(path.dirname(CONF.xunit.path));
        stream = fs.createWriteStream(CONF.xunit.path);

        write(tag("testsuite", {
            name: CONF.xunit.suiteName,
            tests: CONF.test.cases.length,
            failures: CONF.test.cases.filter(t => t.status === TestCase.FAILED).length,
            errors: CONF.test.cases.filter(t => t.status === TestCase.FAILED).length,
            skipped: CONF.test.cases.filter(t => t.status === TestCase.SKIPPED).length,
            timestamp: new Date().toUTCString(),
            time: (CONF.test.cases.map(t => t.duration).reduce((a, b) => a + b, 0) / 1000) || 0
        }, false));
      
        CONF.test.cases.forEach(t => writeTest(t));
        write("</testsuite>");

        console.log();
        const reportMsg = "xUnit report is " + CONF.xunit.path;
        console.log(Array(reportMsg.length + 1).join("-").yellow);
        console.log(reportMsg.yellow);
    },

    done: () => new Promise(resolve => stream.end(resolve)),
};
/**
 * Writes a line.
 *
 * @arg {string} line - Report text line.
 */
const write = line => {
    stream.write(line + "\n");
};
/**
 * Writes a test.
 *
 * @arg {TestCase} test - Test case.
 */
const writeTest = test => {
    const attrs = {
        classname: test.name,
        name: test.name,
        time: (test.duration / 1000) || 0
    };

    if (test.status === TestCase.FAILED) {
        const err = test.errors.join("\n");
        write(tag("testcase", attrs, false, tag("failure", {}, false, escape(err))));
    } else if (test.status === TestCase.SKIPPED) {
        write(tag("testcase", attrs, false, tag("skipped", {}, true)));
    } else {
        write(tag("testcase", attrs, true));
    }
};
/**
 * HTML tag helper. (copied from mochajs)
 *
 * @ignore
 * @param name
 * @param attrs
 * @param close
 * @param content
 * @return {string}
 */
function tag (name, attrs, close, content) {
    const end = close ? "/>" : ">";
    const pairs = [];
    let tag;

    for (const key in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, key)) {
            pairs.push(key + "=\"" + escape(attrs[key]) + "\"");
        }
    }

    tag = "<" + name + (pairs.length ? " " + pairs.join(" ") : "") + end;
    if (content) {
        tag += content + "</" + name + end;
    }
    return tag;
}
