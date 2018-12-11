[![Build Status](https://travis-ci.org/glacejs/glace-core.svg?branch=master)](https://travis-ci.org/glacejs/glace-core)
 | [Source Code](https://github.com/glacejs/glace-core)
 | [Release Notes](tutorial-release-notes.html)

**Glace** (fr. *glacé* — ice, frozen) is a cold drink based on **coffee** with addition of **ice cream**.

<img src="glace.png" alt="GlaceJS logo" style="width: 250px; height: 250px;"/>

`glace-core` is a quick-start functional & unit testing framework based on [mochajs](http://mochajs.org/) and can be extented with its [plugins](https://github.com/glacejs/).

## Why it is

- Firstly it's **R&D** project for [me](https://www.linkedin.com/in/sergei-chipiga-05b29661) to dive deeply to programming and software architecture.
- Current testing frameworks like [mochajs](http://mochajs.org/) or [jasminejs](https://jasmine.github.io/) look cool for unit testing but are **not flexible for complex** functional scenarios.

## Quick start

1. Make sure you have installed `node >= v8.9` & `npm >= v5.5`.

1. Install `glace-core` globally `npm i -g glace-core` or locally `npm i glace-core`.

1. Create file `tests.js` with next content:

    ```javascript
    "use strict";

    test("My first test", () => {
        chunk(() => {
            console.log("hello world");
        });
    });

    test("My second test", () => {
        chunk(() => {
            throw new Error("BOOM!");
        });
    });
    ```

1. Launch tests with command `glace tests.js` if you installed `glace-core` globally or with `./node_modules/glace-core/bin/glace tests.js` if locally and get the result.

    <img src="quick-start-report.png" alt="glace-core report" />

## Features

- Cross-platform: can be launched easily in **linux**, **macos**, **windows**.
- Concept is based on [STEPS-architecture](tutorial-steps-architecture.html).
- Plugins system based on [STEPS-protocol](tutorial-steps-protocol.html).
- [Parameterization](tutorial-parameterization.html) inside and outside of test
- Mechanism to launch tests in parallel workers.
- Mechanism to [retry](tutorial-retry.html) failed tests
- Mechanism to [retry](tutorial-retry.html) failed chunks
- Mechanism to process uncaught exceptions (`mocha` mechanism is [unreliable](tutorial-mocha-uncaught.html) but supported)
- [Fixtures](tutorial-test-fixtures.html) support similar to [pytest fixtures](https://docs.pytest.org/en/latest/fixture.html)
- [Conftest](tutorial-tests-loading.html) and [preloads](tutorial-tests-loading.html) support
- Test & chunk [options](tutorial-test-options.html)
- Multiple reporting [system](tutorial-reports.html)
- Stdout reporter in-box.
- [Allure](http://allure.qatools.ru/) reporter in-box.
- [TestRail](http://www.gurock.com/testrail/) reporter in-box,
- Easy to provide [custom reporter](https://github.com/glacejs/glace-core/blob/master/tests/e2e/testCustomReporter.js)
- May read `CLI` arguments from `JSON` file
- May be extended with custom `JavaScript` config
- May be used as platform for own testing frameworks development

## Reserved functions

- [test](tutorial-common-used-funcs.html#test) - testcase definition;
- [chunk](tutorial-common-used-funcs.html#chunk) - part of test executed independently;
- [before](tutorial-common-used-funcs.html#before) - hook executed before chunks;
- [after](tutorial-common-used-funcs.html#after) - hook executed after chunks;
- [beforeChunk](tutorial-common-used-funcs.html#before-chunk) - hook executed before each chunk;
- [afterChunk](tutorial-common-used-funcs.html#after-chunk) - hook executed after each chunk;
- [$](tutorial-common-used-funcs.html#steps) - namespace of steps;
- [CONF](tutorial-common-used-funcs.html#config) - configuration;
- [fixtures](tutorial-common-used-funcs.html#fixtures) - modular & reusable blocks of test;
- [iterators](tutorial-common-used-funcs.html#iterators) - cycles for tests, chunks and other blocks;
- [suite](tutorial-common-used-funcs.html#suite) - groups tests to suites for visual output mostly;
- [scope](tutorial-common-used-funcs.html#scope) - groups tests or chunks for visual or logical output, is used inside iterators also;
- [session](tutorial-common-used-funcs.html#session) - first root suite, created by framework, not need to reuse by default.

## CLI options

`Common`
- `--version` - Show version.
- `-h, --help` - Show help.

`Arguments`
- `--config [path], -c` - Path to JSON file with CLI arguments. Default is `<cwd>/config.json` if it exists.

**Note!** All options below may be set via `json` file (see option `--config` above).

`Log`
- `--stdout-log` - Print log messages to stdout.
- `--log [path]` - Path to log file. Default is `<cwd>/glace.log`.
- `--log-level [level]` - Log level. Supported values are `error`, `warn`, `info`, `verbose`, `debug`, `silly`. Default is `debug`.

`Core`
- `--user-config [path]` - Path to JS file with configuration which will be merged with override default configuration.
Default is `<cwd>/config.js` if it exists.
- `--session-name [name]` - Tests run session name. Default value includes word `session` and datetime.
- `--grep <pattern>, -g` - Filter tests by part of name (powered by `mocha`).
- `--include <sequence>` - **1)** Sequence of test name parts separated by ` | ` in order to choose tests for run, **case-insensitive**.
For example, `--include "my first test | my second test"` includes these ones in run only.
**2)** Path to json file with test names or test ids in order to choose them for run. For example, it can be path to file with failed tests,
which is generated `glace-core` if some tests were failed.
- `--exclude <sequence>` - **1)** Sequence of test name parts separated by ` | ` in order to exclude tests from run, **case-insensitive**.
For example, `--exclude "my first test | my second test"` excludes these ones from run.
**2)** Path to json file with test names or test ids in order to exclude them from run.
- `--precise-match` - Precise tests inclusion or exclusion matching (check full test name equivalence, not substring matching).
- `--report [path]` - Path to report folder. Default is `<cwd>/report`.
- `--dont-clear-report` - Don't clear folder of previous report before tests run.
- `--dont-check-names` - Don't check test names uniqueness (_usually useful in unit testing_).
By default test names should be human-readable and unique among other tests in run.
- `--failed-tests-path [path]` - Path to save failed tests in **json** format. Default is `<cwd>/report/failed-tests.json`.
If there are failed tests in run, `glace-core` puts its info to json file, which can be used then with `--include` option to rerun failed tests only.
- `--root-conftest <path>` - Path to root `conftest.js` which will be loaded before tests but after preloads.
- `--languages <sequence>` - List of tested languages separated with comma. For example, `--languages "ru, en, ee"`.
- `--retry [times]` - Number of times to retry failed test. Default is `0`.
- `--chunk-retry [times]` - Number of times to retry failed chunk (powered by `mocha`). Default is `0`.
- `--chunk-timeout [sec]` - Time to execute chunk or hook, **sec**. Default is `180`.
- `--uncaught [type]` - Strategy to process uncaught exceptions. Default value is `log`. Supported values are `log` just to log uncaught exceptions, `fail` to fail test if uncaught exception happened, `mocha` to use default `mocha` mechanism ([unreliable](tutorial-mocha-uncaught.html)).
- `--kill-procs <sequence>` - List of process names separated with comma, which will be killed before tests run, **case-sensitive**.
For example, `--kill-procs "java, chrome, selenium"`.
- `--debug-on-fail` - Enter to interactive debug mode on step failure. **Incompatible with `--slaves` option**.
- `--exit-on-fail` - Finish tests run on first failure.
- `--errors-now` - Print error message immediately when it happened.
- `--interactive, -i` - Launch interactive mode to execute steps manually in terminal. **Incompatible with `--slaves` option**.
- `--slaves <number|auto>` - Split tests by slaves and execute them concurrently in separated processes. If it is `auto`, slaves amount will be equal to processor cores amount.

`Plugins`
- `--list-plugins` - List found plugins and exit.
- `--plugins-dir [path]` - Path to custom plugins folder.
- `--disable-default-plugins` - Disable default (autodiscovered) plugins.

`xUnit`
- `--xunit` - Activate xUnit reporter.
- `--xunit-path [path]` - Path to xUnit report. Default is `<cwd>/report/xunit.xml`.
- `--xunit-suite-name [name]` - Tests suite name in xUnit report. By default it's the same as session name.

`Allure`
- `--allure` - Activate [Allure](https://docs.qameta.io/allure/) reporter.
- `--allure-dir [path]` - Path to allure reports folder. Default is `<cwd>/report/allure`.

`TestRail`
- `--testrail` - Activate [TestRail](https://www.gurock.com/testrail) reporter.
- `--testrail-host <host>` - TestRail host.
- `--testrail-user <user>` - TestRail username or email.
- `--testrail-token <token>` - TestRail token.
- `--testrail-project-id <id>` - TestRail project id.
- `--testrail-suite-id <id>` - TestRail suite id.
- `--testrail-run-name <name>` - TestRail run name.
- `--testrail-run-desc <description>` - TestRail run description.

`Tools`
- `--testrail-check` - Check TestRail cases consistency with implemented tests. 
- `--list-steps [filter]` - List available steps and exit. If `filter` is omitted, list all steps.
- `--list-tests [filter]` - List collected tests and exit. If `filter` is omitted, list all tests.
- `--list-fixtures [filter]` - List available fixtures and exit. If `filter` is omitted, list all fixtures.

## Examples

There are [e2e tests](https://github.com/glacejs/glace-core/tree/master/tests/e2e) in order to explore `glace-core` examples.

## Quality

`glace-core` is highly reliable framework. And it's ready to provide confirmation:
- release <a href="allure-report/index.html" target="_blank">tests report</a>
- release <a href="tests-cover/lcov-report/index.html" target="_blank">code coverage</a>
