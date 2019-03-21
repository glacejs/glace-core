"use strict";

const plugins = rehire("../../lib/plugins");

suite("plugins module", () => {

    afterChunk(() => {
        plugins.__reset__();
    });

    test(".get()", () => {

        chunk("gets found plugins", () => {
            plugins.__set__("systemPlugins", ["plugin-1", "plugin-2"]);
            plugins.__set__("getNames", () => []);
            plugins.__set__("customPlugins", []);

            expect(plugins.get()).to.be.eql(["plugin-1", "plugin-2"]);
        });

        chunk("loads system plugins if they are not", () => {
            const findPlugins = sinon.stub().returns(["plugin-1", "plugin-2"]),
                getPluginsFromDir = sinon.spy(o => o),
                loadPlugins = sinon.spy(o => o);

            plugins.__set__("findPlugins", findPlugins);
            plugins.__set__("getPluginsFromDir", getPluginsFromDir);
            plugins.__set__("loadPlugins", loadPlugins);
            plugins.__set__("getNames", () => []);
            plugins.__set__("customPlugins", []);

            expect(plugins.get()).to.be.eql(["plugin-1", "plugin-2"]);
        });

        chunk("filters system plugins if they match custom", () => {
            plugins.__set__("systemPlugins", [{ name: "plugin-1" }, { name: "plugin-2" }]);
            plugins.__set__("getNames", () => ["plugin-2"]);
            plugins.__set__("customPlugins", []);

            expect(plugins.get()).to.be.eql([{ name: "plugin-1" }]);
        });

        chunk("concats custom plugins with system", () => {
            plugins.__set__("systemPlugins", ["plugin-1", "plugin-2"]);
            plugins.__set__("getNames", () => []);
            plugins.__set__("customPlugins", ["plugin-3"]);

            expect(plugins.get()).to.be.eql(["plugin-1", "plugin-2", "plugin-3"]);
        });
    });

    test("findPlugins()", () => {
        let findPlugins, conf;

        beforeChunk(() => {
            findPlugins = plugins.__get__("findPlugins");
            conf = { plugins: {}};
            plugins.__set__("CONF", conf);
        });

        chunk("does nothing if default plugins are disabled", () => {
            conf.plugins.disableDefault = true;
            expect(findPlugins(["plugin-1"])).to.be.eql(["plugin-1"]);
        });

        chunk("does nothing if plugin dirs don't exist", () => {
            plugins.__set__("fs", { existsSync: () => false });
            expect(findPlugins(["plugin-1"])).to.be.eql(["plugin-1"]);
        });

        chunk("finds glace plugins", () => {
            plugins.__set__("dirsToSearchPlugins", () => ["/path/to/custom"]);
            plugins.__set__("fs", { existsSync: () => true, readdirSync: () => ["glace-2", "glace-3", "glace-3"] });

            const foundPlugins = findPlugins([
                { name: "glace-1", path: "/path/to/plugin/1" },
                { name: "glace-2", path: "/path/to/plugin/2" },
            ]);

            expect(foundPlugins.map(p => p.name)).to.be.eql(["glace-1", "glace-2", "glace-3"]);
            expect(foundPlugins[1].path).to.be.equal("/path/to/custom/glace-2");
        });
    });

    test("getPluginsFromDir()", () => {
        let getPluginsFromDir, conf;

        beforeChunk(() => {
            getPluginsFromDir = plugins.__get__("getPluginsFromDir");

            conf = { plugins: {}};
            plugins.__set__("CONF", conf);
        });

        chunk("does nothing if no plugins dir", () => {
            conf.plugins.dir = null;
            expect(getPluginsFromDir(["plugin-1"])).to.be.eql(["plugin-1"]);
        });

        chunk("throw error if plugin dir is not a dir", () => {
            conf.plugins.dir = "/path/to/custom";

            plugins.__set__("fs", { existsSync: () => true, statSync: () => { return { isDirectory: () => false }; } });
            expect(() => getPluginsFromDir([])).to.throw("isn't a folder");
        });

        chunk("throw error if plugin dir doesn't exist", () => {
            conf.plugins.dir = "/path/to/custom";

            plugins.__set__("fs", { existsSync: () => false });
            expect(() => getPluginsFromDir([])).to.throw("doesn't exist");
        });

        chunk("gets plugins from custom dir", () => {
            conf.plugins.dir = "/path/to/custom";

            plugins.__set__("fs", {
                existsSync: () => true,
                statSync: () => { return { isDirectory: () => true }; },
                readdirSync: () => ["plugin-2", "plugin-3"],
            });

            const gotPlugins = getPluginsFromDir([
                { name: "plugin-1", path: "/path/to/plugin/1" },
                { name: "plugin-2", path: "/path/to/plugin/2" },
            ]);

            expect(gotPlugins.map(p => p.name)).to.be.eql(["plugin-1", "plugin-2", "plugin-3"]);
            expect(gotPlugins[1].path).to.be.equal("/path/to/custom/plugin-2");
        });
    });

    test("loadPlugins()", () => {
        let loadPlugins, logger;

        beforeChunk(() => {
            loadPlugins = plugins.__get__("loadPlugins");

            logger = { error: sinon.stub() };
            plugins.__set__("LOG", logger);
        });

        chunk("loads plugins", () => {
            plugins.__set__("require", () => Object());

            const loadedPlugins = loadPlugins([{ name: "plugin", path: "/path/to/plugin" }]);
            expect(loadedPlugins).to.have.length(1);
            expect(loadedPlugins[0].module).to.exist;
            expect(() => loadedPlugins[0].name = "glace-plugin").to.throw("read only property");
        });

        chunk("throws error if plugin can't be loaded", () => {
            plugins.__set__("require", () => { throw Error(); });

            const loadedPlugins = loadPlugins([{ name: "plugin", path: "/path/to/plugin" }]);
            expect(loadedPlugins).to.have.length(0);
            expect(logger.error).to.be.calledOnce;
            expect(logger.error.args[0][0]).to.startWith("Can't load plugin");
        });
    });

    test(".getModules()", () => {

        chunk(() => {
            plugins.__set__("get", () => [
                { module: { config: "module-1" }},
                { module: { config: "module-2" }},
                { module: {}},
            ]);

            expect(plugins.getModules("config")).to.be.eql(["module-1", "module-2"]);
        });
    });

    test(".clearCache()", () => {

        chunk(() => {
            plugins.__set__("systemPlugins", ["plugin-1"]);
            expect(plugins.__get__("systemPlugins")).to.be.eql(["plugin-1"]);
            plugins.clearCache();
            expect(plugins.__get__("systemPlugins")).to.be.null;
        });
    });

    test(".register()", () => {
        let require_, logger;

        beforeChunk(() => {
            require_ = sinon.stub();
            require_.resolve = sinon.stub();
            plugins.__set__("require", require_);

            logger = { warn: sinon.stub() };
            plugins.__set__("LOG", logger);
        });

        chunk("does nothing if plugin is registered already", () => {
            plugins.__set__("getNames", () => ["my-plugin"]);
            plugins.register("my-plugin");

            expect(plugins.__get__("customPlugins")).to.have.length(0);

            expect(logger.warn.args[0][0]).to.endWith("is registered already");
        });

        chunk("registers plugin", () => {
            plugins.__set__("getNames", () => []);
            plugins.register("my-plugin");

            const customPlugins = plugins.__get__("customPlugins");
            expect(customPlugins).to.have.length(1);
            expect(customPlugins[0].name).to.be.equal("my-plugin");

            expect(require_.args[0][0]).to.be.equal("my-plugin");
            expect(require_.resolve.args[0][0]).to.be.equal("my-plugin");
        });
    });

    test(".remove()", () => {
        let logger;

        beforeChunk(() => {
            logger = { warn: sinon.stub() };
            plugins.__set__("LOG", logger);
        });

        chunk("does nothing if plugin isn't registered yet", () => {
            plugins.__set__("customPlugins", []);
            plugins.remove("my-plugin");
            expect(plugins.__get__("customPlugins")).to.have.length(0);
            expect(logger.warn.args[0][0]).to.endWith("isn't registered yet");
        });

        chunk("removes plugins from list of registered", () => {
            plugins.__set__("customPlugins", [{ name: "my-plugin" }]);
            plugins.remove("my-plugin");
            expect(plugins.__get__("customPlugins")).to.have.length(0);
        });
    });

    test(".getNames()", () => {

        chunk("get custom plugin names", () => {
            plugins.__set__("customPlugins", [{ name: "plugin-1" }, { name: "plugin-2" }]);
            expect(plugins.getNames({ type: "custom" })).to.be.eql(["plugin-1", "plugin-2"]);
        });

        chunk("get system plugin names", () => {
            plugins.__set__("systemPlugins", [{ name: "plugin-1" }, { name: "plugin-2" }]);
            expect(plugins.getNames({ type: "system" })).to.be.eql(["plugin-1", "plugin-2"]);
        });

        chunk("gets empty list if system plugins are absent", () => {
            plugins.__set__("systemPlugins", null);
            expect(plugins.getNames({ type: "system" })).to.be.eql([]);
        });

        chunk("gets all plugin names", () => {
            plugins.__set__("customPlugins", [{ name: "plugin-1" }]);
            plugins.__set__("systemPlugins", [{ name: "plugin-2" }]);
            expect(plugins.getNames()).to.be.eql(["plugin-1", "plugin-2"]);
        });

        chunk("gets custom plugins names if system plugins are absent", () => {
            plugins.__set__("customPlugins", [{ name: "plugin-1" }, { name: "plugin-2" }]);
            plugins.__set__("systemPlugins", null);
            expect(plugins.getNames()).to.be.eql(["plugin-1", "plugin-2"]);
        });
    });

    test("dirsToSearchPlugins()", () => {
        let dirsToSearchPlugins, require_, u;

        beforeChunk(() => {
            dirsToSearchPlugins = plugins.__get__("dirsToSearchPlugins");

            require_ = {};
            plugins.__set__("require", require_);

            u = { cwd: "/path/to/plugins" };
            plugins.__set__("U", u);

            plugins.__set__("module", { paths: ["/path/to/plugins"]});
        });

        chunk("gets dir to search plugins", () => {
            expect(dirsToSearchPlugins()).to.be.eql(["/path/to/plugins"]);
        });

        chunk("excludes require.main module from search", () => {
            require_.main = { filename: "/path/to/bin/index.js" };
            expect(dirsToSearchPlugins()).to.be.eql(["/path/to/bin", "/path/to/plugins"]);
        });

        chunk("exclude current work directory from search", () => {
            u.cwd = "/path/to/cwd";
            expect(dirsToSearchPlugins()).to.be.eql(["/path/to/cwd", "/path/to/plugins"]);
        });

        chunk("does not inject main dir", () => {
            require_.main = { filename: "/path/to/plugins/index.js" };
            plugins.__set__("module", { paths: ["/path/to/plugins"]});
            expect(dirsToSearchPlugins()).to.be.eql(["/path/to/plugins"]);
        });
    });
});
