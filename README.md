[![Build Status](https://travis-ci.org/glacejs/glace-core.svg?branch=master)](https://travis-ci.org/glacejs/glace-core)
 | [Source Code](https://github.com/glacejs/glace-core)
 | [Release Notes](tutorial-release-notes.html)

**Glace** (fr. *glacé* — ice, frozen) is a cold drink based on **coffee** with addition of **ice cream**.

<img src="glace.png" alt="GlaceJS logo" style="width: 250px; height: 250px;"/>

## Annotation

`GlaceJS` is a quick-start functional testing framework based on [mocha](http://mochajs.org/) and extensible with [plugins](https://github.com/glacejs).

## Why it is

- Firstly it's **R&D** project for [me](https://www.linkedin.com/in/sergei-chipiga-05b29661) to dive deeply to programming and software architecture.
- Current testing frameworks like [mocha](http://mochajs.org/) or [jasmine](https://jasmine.github.io/) look cool for unit testing but are **not flexible for complex** functional scenarios.

## Features

- Cross-platform
- Based on [STEPS-architecture](tutorial-steps-architecture.html) and [STEPS-protocol](tutorial-steps-protocol.html)
- May be extended with plugins implemented STEPS-protocol
- Oriented to complex functional [scenarios](tutorial-concepts.html)
- Indepentently executed [chunks](tutorial-concepts.html) inside a test
- [Parameterization](tutorial-parameterization.html) inside and outside of test
- Mechanism to [retry](tutorial-retry.html) failed tests
- Mechanism to [retry](tutorial-retry.html) failed chunks
- Mechanism to process uncaught exceptions (`mocha` mechanism is [unreliable](tutorial-mocha-uncaught.html) but supported)
- [Fixtures](tutorial-test-fixtures.html) support similar to [pytest fixtures](https://docs.pytest.org/en/latest/fixture.html)
- [Conftest](tutorial-tests-loading.html) and [preloads](tutorial-tests-loading.html) support
- Test & chunk [options](tutorial-test-options.html)
- Multiple reporting [system](tutorial-reports.html)
- Stdout reporter in-box
- [TestRail](http://www.gurock.com/testrail/) reporter in-box
- Easy to provide [custom reporter](https://github.com/glacejs/glace-core/blob/master/tests/e2e/testCustomReporter.js)
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
```

## How to use

```
glace [options] [sequence-of-test-files-or-folders]
```

[How `glace` loads tests ➤](tutorial-tests-loading.html)

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
- `--include <sequence>` - Sequence of test name chunks separated by ` | ` in order to choose tests for run.
- `--exclude <sequence>` - Sequence of test name chunks separated by ` | ` in order to exclude tests from run.
- `--precise` - Precise tests inclusion or exclusion (not substring pattern).
- `--report [path]` - Path to reports folder. Default is `cwd/reports`.
- `--dont-clear-report` - Don't clear previous report on tests run.
- `--failed-tests-path [path]` - Path to save failed tests in JSON format. Default is `cwd/failed-tests.json`.
- `--root-conftest <path>` - Path to root `conftest.js` which will be loaded before all.
- `--languages <sequence>` - List of tested languages separated with comma.
- `--retry [times]` - Number of times to retry failed test. Default is `0`.
- `--chunk-retry [times]` - Number of times to retry failed chunk. Default is `0`.
- `--chunk-timeout [sec]` - Time to execute chunk or hook, sec. Default is `180`.
- `--uncaught [type]` - Strategy to process uncaught exceptions. Default value is `log`. Supported values are `log` just to log uncaught exceptions, `fail` to fail test if uncaught exception happened, `mocha` to use default `mocha` mechanism ([unreliable](tutorial-mocha-uncaught.html)).
- `--kill-procs <sequence>` - List of process names separated with comma, which will be killed before tests run.
- `--debug-on-fail` - Enter to interactive debug mode on step failure.
- `--exit-on-fail` - Finish test run on first failure.
- `--errors-now` - Print error message immediately when it happened.
- `--interactive, -i` - Launch interactive mode to execute steps manually in terminal.

`Plugins`
- `--plugins` - Show plugins only.
- `--plugins-dir [path]` - Path to custom plugins folder. By default it searches plugins inside folder, where `glace-core` is installed.
- `--disable-default-plugins` - Disable default plugins.

`xUnit`
- `--xunit` - Activate xUnit reporter.
- `--xunit-path [path]` - Path to xUnit report. Default is `cwd/xunit.xml`.
- `--xunit-suite-name [name]` - Tests suite name in xUnit report. By default it's the same as session name.

`TestRail`
- `--testrail` - Activate TestRail reporter.
- `--testrail-host <host>` - TestRail host.
- `--testrail-user <user>` - TestRail username or email.
- `--testrail-token <token>` - TestRail token.
- `--testrail-project-id <id>` - TestRail project id.
- `--testrail-suite-id <id>` - TestRail suite id.
- `--testrail-run-name <name>` - TestRail run name.
- `--testrail-run-desc <description>` - TestRail run description.

`Tools`
- `--testrail-check` - Check TestRail cases consistency with implemented tests. 
- `--list-steps [filter]` - Only list available steps.
- `--list-tests [filter]` - Only list collected tests.
- `--list-fixtures [filter]` - Only list available fixtures.

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

1. It is a **good style** to use only [Steps](Steps.html) inside chunks via its global instance [SS](global.html#SS) and follow to [STEPS](tutorial-steps-architecture.html) methodology.

    ```javascript
    test("my test", () => {
        chunk(async () => {
            await SS.pause(1, "sleep a bit");
        });
    });
    ```

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
