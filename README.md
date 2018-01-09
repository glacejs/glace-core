[![Build Status](https://travis-ci.org/glacejs/glace-core.svg?branch=master)](https://travis-ci.org/glacejs/glace-core)
 | [Source Code](https://github.com/glacejs/glace-core)
 | [Release Notes](tutorial-release-notes.html)

**Glace** (fr. *glacé* — ice, frozen) is a cold drink based on **coffee** with addition of **ice cream**.

![GlaceJS logo](glace.png)

`GlaceJS` is a quick-start functional testing framework based on [mocha](http://mochajs.org/) and extensible with [plugins](https://github.com/glacejs).

## Features

- Cross-platform
- Based on [STEPS-architecture](tutorial-steps-architecture.html) and [STEPS-protocol](tutorial-steps-protocol.html)
- May be extended with plugins implemented STEPS-protocol
- Oriented to complex functional scenarios
- Indepentently executed chunks inside a test
- Parameterization inside and outside of test
- Mechanism to retry failed tests
- Mechanism to retry failed chunks
- Mechanism to process uncaught exceptions (`mocha` mechanism is [unreliable](tutorial-mocha-uncaught.html) but supported)
- [Fixtures](tutorial-test-fixtures.html) support similar to [pytest fixtures](https://docs.pytest.org/en/latest/fixture.html)
- Test & chunk [options](tutorial-test-options.html)
- Multiple reporting system
- Stdout reporter in-box
- [TestRail](http://www.gurock.com/testrail/) reporter in-box
- Easy to provide [custom reporter](https://github.com/glacejs/glace-core/blob/master/tests/integration/testCustomReporter.js)
- May read `CLI` arguments from `JSON` file
- May be extended with custom `JavaScript` config
- May be used as platform for own testing frameworks development

## How to install

```
npm i glace-core
```

For development:

```
git clone https://github.com/glacejs/glace-core
cd glace-core
npm i
gulp test-unit  // launch unit tests
gulp test-all  // launch all integration tests
gulp --tasks  // show all tasks
```

## How to use

```
glace [options] [sequence-of-test-files-or-folders]
```

## CLI options

`Common`
- `--version` - Show version number.
- `-h, --help` - Show help.

`Arguments`
- `--config [path], -c` - Path to JSON file with CLI arguments. Default is `cwd/config.json` (if it exists).

**Note!** All options below may be set via `.json` file (see option `--config` above).

`Log`
- `--stdout-log` - Print log messages to stdout.
- `--log [path]` - Path to log file. Default is `cwd/glace.log`.
- `--log-level [level]` - Log level. Default is `debug`.

`Core`
- `--user-config [path]` - Path to JS file with configuration which will be merged with override default configuration. Default is `cwd/config.js` (if it exists).
- `--session-name [name]` - Tests run session name. Default value includes word `session` and datetime.
- `--grep <pattern>, -g` - Filter tests by name or name chunk.
- `--report [path]` - Path to reports folder. Default is `cwd/reports`.
- `--dont-clear-report` - Don't clear previous report on tests run.
- `--root-conftest <path>` - Path to root `conftest.js` which will be loaded before all.
- `--languages <sequence>` - List of tested languages separated with comma.
- `--retry [times]` - Number of times to retry failed test. Default is `0`.
- `--chunk-retry [times]` - Number of times to retry failed chunk. Default is `0`.
- `--chunk-timeout [sec]` - Time to execute chunk or hook, sec. Default is `180`.
- `--uncaught [type]` - Strategy to process uncaught exceptions. Default value is `log`. Supported values are `log` just to log uncaught exceptions, `fail` to fail test if uncaught exception happened, `mocha` to use default `mocha` mechanism ([unreliable](tutorial-mocha-uncaught.html)).

`Plugins`
- `--plugins` - Show plugins only.
- `--plugins-dir [path]` - Path to custom plugins folder. By default it searches plugins inside folder, where `glace-core` is installed.
- `--disable-default-plugins` - Disable default plugins.

`xUnit`
- `--xunit` - Activate xUnit reporter.
- `--xunit-path [path]` - Path to xUnit report. Default is `cwd/xunit.xml`.
- `--xunit-suite-name [name]` - Tests suite name in xUnit report. By default it's the same as session name.

`TestRail`
- `--testrail` - Activate testrail reporter.
- `--testrail-host <host>` - TestRail host.
- `--testrail-user <user>` - TestRail username or email.
- `--testrail-token <token>` - TestRail token.
- `--testrail-project-id <id>` - TestRail project id.
- `--testrail-suite-id <id>` - TestRail suite id.
- `--testrail-run-name <name>` - TestRail run name.
- `--testrail-run-desc <description>` - TestRail run description.

## Quick start

1. Make sure that you have installed `glace-core`

1. Create file `my-test.js` with next content:

    ```javascript
    "use strict";

    test("#1", () => {
        chunk(() => {
            console.log("hello world");
        });
    });

    test("#2", () => {
        chunk(() => {
            throw new Error("BOOM!");
        });
    });
    ```

1. Launch terminal, navigate to folder with file `my-test.js` and execute command:

    ```
    glace my-test.js
    ```

    After that tests will be executed.

1. In current work directory create file `config.json` with next content:

    ```javascript
    {
        "grep": "#1",
        "xunit": true
    }
    ```

1. Launch `glace` again:

    ```
    glace my-test.js
    ```

    `glace` CLI options will be read from `config.json`.

## Test examples

See [integration tests](https://github.com/glacejs/glace-core/tree/master/tests/e2e) in order to explore examples.

## Frameworks platform

`GlaceJS` may be used as platform for own testing frameworks development. [Simple example](https://github.com/glacejs/glace-core/blob/master/tests/e2e/ownApp):

```javascript
require("colors");

require("glace-core").run().then(errCode => {
    if (!errCode) {
        console.log("It's passed! 🙂".green.bold);
    } else {
        console.log("It's failed! 🙁".red.bold);
    };
    process.exit(errCode);
});
```

## Guidelines

### How to retry tests or chunks

In order to retry failed tests or chunks you may pass CLI options `--retry` or
`--chunk-retry` to affect all tests or chunks or to specify `retry` option
for concrete [test or chunk](tutorial-test-options.html).

### How to use fixtures

In order to avoid copy/paste with `before` and `after` hooks in tests you may use fixtures...

[Read more ➤](tutorial-test-fixtures.html)
