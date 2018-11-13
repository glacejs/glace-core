Plugins are used to outfit `glace-core` with [steps](tutorial-steps-architecture.html) for specific functionality which is missing in the core.
Currently `glace` ecosystem provides next plugins which are assembled in project [`glace-js`](https://glacejs.github.io/glace-js):
- [**glace-image**](https://glacejs.github.io/glace-image) - to process images & screenshots;
- [**glace-proxy**](https://glacejs.github.io/glace-proxy) - to manage http & mitm proxy servers;
- [**glace-testgen**](https://glacejs.github.io/glace-testgen) - to generate (auto)tests with ML;
- [**glace-video**](https://glacejs.github.io/glace-video) - to capture & process video;
- [**glace-web**](https://glacejs.github.io/glace-web) - to launch web tests in browser;
- [**glace-xvfb**](https://glacejs.github.io/glace-xvfb) - to launch tests in virtual display (headless);

### Core Extension Points

Main task of any plugin to provide additional **steps**, but it also can supply **config**, **help**, **fixtures**, which are involved in extension points in `glace-core`.

Configurating is a first stage in `glace-core`, all other happens after. And plugin configs also will be loaded right after core configuration in [glace-core/lib/config.js#L271](https://github.com/glacejs/glace-core/blob/1.8.9/lib/config.js#L271):

```javascript
if (args.pluginsDir) config.plugins.dir = path.join(U.cwd, args.pluginsDir);
config.plugins.disableDefault = U.defVal(args.disableDefaultPlugins, false);

plugins.getModules("config"); // HERE

config.tools = U.defVal(config.tools, {});
```

Plugin steps are loaded in [glace-core/lib/steps/index.js#L153](https://github.com/glacejs/glace-core/blob/1.8.9/lib/steps/index.js#L153):

```javascript
Steps.register(require("./timer"));
/* Load plugins steps */
Steps.register.apply(Steps, plugins.getModules("Steps")); // HERE

/**
 * Set up debug mode for glace.
```

Plugin helps are loaded in [glace-core/lib/help.js#L264](https://github.com/glacejs/glace-core/blob/1.8.9/lib/steps/index.js#L153):

```javascript
        });

    for (var help of plugins.getModules("pluginHelp")) { // HERE
        result = help(result, d);
    }
```

Plugin configs & helps can include options which are used as inside plugin as in a project, which involve core & plugins.
For example, CLI option `--global-proxy` is defined in `glace-proxy` plugin but isn't used inside the plugin, because the plugin doesn't know when
global proxy should be activated. But it's involved in `glace-js` which knows precisely when global proxy should start, [glace-js/lib/globals.js#L26](https://github.com/glacejs/glace-core/blob/1.8.9/lib/steps/index.js#L153):

```javascript
if (CONF.web.use && !CONF.cluster.slavesNum) fixtures.push(fxKillWebdriver);
if (CONF.xvfb.use) fixtures.push(fxXvfb);
if (CONF.proxy.global) fixtures.push(fxGlobalProxy); // HERE
if (CONF.proxy.http) fixtures.push(fxHttpProxy);
```

Fixtures are not loaded via an extension point. Cause they are global objects and wrappers over steps, they should be
initialized with fixtures import in plugin steps, like [glace-proxy/lib/steps.js#L22](https://github.com/glacejs/glace-core/blob/1.8.9/lib/steps/index.js#L153):

```javascript
var U = require("glace-utils");

require("./fixtures"); // HERE
var GlobalProxy = require("./globalProxy");
var HttpProxy = require("./httpProxy");
```

### Plugins Lazy Load

`glace-core` loads a found plugin by name and takes objects from a module, marked as [main in plugin `package.json`](https://github.com/glacejs/glace-proxy/blob/1.3.8/package.json#L5). This module includes all objects, which are provided by plugin.
In such case in order to avoid all objects initialisation on first request, like `steps` together with `config`, plugins
should use lazy load on demand, like in [glace-image/lib/index.js#L10](https://github.com/glacejs/glace-image/blob/1.2.8/lib/index.js#L10):

```javascript
Object.defineProperties(exports, {
    /**
     * @type {GlaceConfig}
     */
    config: {
        get: function() {
            config = config || require("./config");
            return config;
        },
    },
    /**
     * @type {pluginHelp}
     */
    pluginHelp: {
        get: function () {
            pluginHelp = pluginHelp || require("./pluginHelp");
            return pluginHelp;
        }
    },
    /**
     * @type {ImageSteps}
     */
    Steps: {
        get: function() {
            Steps = Steps || require("./steps");
            return Steps;
        },
    },
});
```

And commonly **lazy load** is a good practice to load required stuff when it's required only.

### Plugin Steps

Plugin steps are mixin objects and don't have a constructor. For example, [glace-proxy/lib/steps.js#L28](https://github.com/glacejs/glace-core/blob/1.8.9/lib/steps/index.js#L153):

```javascript
var ProxySteps = {
    __GlobalProxy: GlobalProxy,
    __HttpProxy: HttpProxy,

    registerProxy: function (opts) {
        /**
         * Helper to register proxy classes.
```

Steps designed in plugin should also follow [**STEPS-architecture**](tutorial-steps-architecture.html) and [can refer to steps and properties](https://github.com/glacejs/glace-image/blob/1.2.8/lib/steps.js#L89) defined
in other plugins or core under `Steps` instance.

_Approach to design & deliver steps together with other plugin stuff is named **STEPS-protocol**._

### Plugins Autodiscovery

`glace-core` automatically loads plugin if it's located in [npm-folders](https://docs.npmjs.com/files/folders) and its name starts with `glace-` prefix (exceptions are `glace-core`, `glace-js`, `glace-utils`).

### Register custom plugins with CLI

If plugin has name or location ineligible for autodiscovery, it can be loaded explicitly with **CLI** option `--plugins-dir </path/to/dir/of/plugins>`. Plugins inside the folder can be as a `.js` file as a folder within `index.js` and will be loaded by their names.

### Register custom plugins programmatically

If there is a wrapper over `glace-core` runner, any custom plugin can be registered programmatically there as well, like [glace-web/tests/run#L5](https://github.com/glacejs/glace-web/blob/1.3.8/tests/run#L5):

```javascript
var path = require("path");
var glace = require("glace-core");
glace.plugins.register(path.resolve(__dirname, "..", "lib")); // HERE
glace.run(process.exit);
```

### List found plugins

With **CLI** option `--list-plugins` it's possible to print all available plugins and their location, for example:

```
➜  glace-js git:(master) ✗ ./bin/glace --list-plugins
1. glace-image /home/user/projects/glace/glace-js/node_modules/glace-image
2. glace-proxy /home/user/projects/glace/glace-js/node_modules/glace-proxy
3. glace-testgen /home/user/projects/glace/glace-js/node_modules/glace-testgen
4. glace-video /home/user/projects/glace/glace-js/node_modules/glace-video
5. glace-web /home/user/projects/glace/glace-js/node_modules/glace-web
6. glace-xvfb /home/user/projects/glace/glace-js/node_modules/glace-xvfb
```
