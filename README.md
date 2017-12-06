**Glace** (fr. *glacé* — ice, frozen) is a cold drink based on **coffee** with addition of **ice cream**.

![GlaceJS logo](glace.png)

`GlaceJS` core is a minimal testing framework based on [mocha](http://mochajs.org/) and extensible with [plugins](https://github.com/glacejs).

## How to install

```
npm i glace-core
```

Or from github:

```
git clone https://github.com/glacejs/glace-core
cd glace-core
npm i
```

## How to use

```
glace [options] [sequence-of-test-files-or-folders]
```

## CLI options

`Arguments`
- `--config [path], -c` - Path to JSON file with CLI arguments. Default is `cwd/config.json` (if it exists).

`Log`
- `--stdout-log` - Print log messages to stdout.
- `--log [path]` - Path to log file. Default is `cwd/glace.log`.
- `--log-level [level]` - Log level. Default is `debug`.

`Core`
- `--user-config [path]` - Path to JS file with configuration which will be merged with override default configuration. Default is `cwd/config.js` (if it exists).
- `--grep, -g` - Filter tests by name or name chunk.
- `--report [path]` - Path to reports folder. Default is `cwd/reports`.
- `--dont-clear-report` - Don't clear previous report on tests run.
- `--root-conftest <path>` - Path to root `conftest.js` which will be loaded before all.
- `--languages` - List of tested languages separated with comma.
- `--retry` - Number of times to retry failed test. Default is `0`.
- `--chunk-retry` - Number of times to retry failed chunk. Default is `0`.
- `--uncaught` - Strategy to process uncaught exceptions. Default value is `log`. Supported values are `log` just to log uncaught exceptions, `fail` to fail test if uncaught exception happened, `mocha` to use default `mocha` mechanism (unreliable).

`Plugins`
- `--plugins` - Show plugins only.
- `--plugins-dir [path]` - Path to custom plugins folder. By default it searches plugins inside folder, where `glace-core` is installed.
- `--disable-default-plugins` - Disable default plugins.

`TestRail`
- `--testrail` - Activate testrail reporter.
- `--testrail-host <host>` - TestRail host.
- `--testrail-user <user>` - TestRail username or email.
- `--testrail-token <token>` - TestRail token.
- `--testrail-project-id <id>` - TestRail project id.
- `--testrail-suite-id <id>` - TestRail suite id.
- `--testrail-run-name <name>` - TestRail run name.
- `--testrail-run-desc <description>` - TestRail run description.

`Options`
- `--version` - Show version number.
- `-h, --help` - Show help.