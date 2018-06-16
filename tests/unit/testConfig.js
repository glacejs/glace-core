"use strict";

const U = require("glace-utils");

const plugins = require("../../lib/plugins");

const CONFIG_PATH = "../../lib/config";

let sandbox = sinon.createSandbox();
let log, exit;

suite("config", () => {

    beforeEach(() => {
        log = console.log;
        exit = process.exit;
        U.config.__selftest = true;
    });

    afterEach(() => {
        console.log = log;
        process.exit = exit;
        U.config.__selftest = false;
        sandbox.restore();
    });

    test("list plugins", () => {

        before(() => {
            U.config.args.listPlugins = true;
        });

        after(() => {
            U.config.args.listPlugins = false;
        });

        chunk("show warning if no plugins", () => {
            const log = console.log;
            const exit = process.exit;
            console.log = sinon.spy();
            process.exit = sinon.spy();
            sandbox.stub(plugins, "get").returns([]);
            sandbox.stub(plugins, "getModules");

            rewire(CONFIG_PATH);
            expect(console.log).to.be.calledOnce;
            expect(console.log.args[0][0]).to.include("No plugins are detected");
            expect(process.exit).to.be.calledOnce;

            console.log = log;
            process.exit = exit;
        });

        chunk("show plugins if plugins", () => {
            const log = console.log;
            const exit = process.exit;
            console.log = sinon.spy();
            process.exit = sinon.spy();
            sandbox.stub(plugins, "get").returns([{ name: "hello", path: "world"}]);
            sandbox.stub(plugins, "getModules");

            rewire(CONFIG_PATH);
            expect(console.log).to.be.calledOnce;
            expect(console.log.args[0][0]).to.include("hello");
            expect(console.log.args[0][1]).to.include("world");
            expect(process.exit).to.be.calledOnce;

            console.log = log;
            process.exit = exit;
        });
    });

    test("testDirs", () => {
        
        beforeEach(() => {
            delete U.config.args._;
            delete U.config.args.targets;
        });

        chunk("has default value", () => {
            const config = rewire(CONFIG_PATH);
            expect(config.testDirs).to.have.length(1);
            expect(config.testDirs[0]).to.endWith("tests");
        });

        chunk("set as cli argument", () => {
            U.config.args._ = ["mytests"];
            const config = rewire(CONFIG_PATH);
            expect(config.testDirs).to.have.length(1);
            expect(config.testDirs[0]).to.endWith("mytests");
        });

        chunk("set as cli option", () => {
            U.config.args.targets = ["mytests"];
            const config = rewire(CONFIG_PATH);
            expect(config.testDirs).to.have.length(1);
            expect(config.testDirs[0]).to.endWith("mytests");
        });
    });
});
