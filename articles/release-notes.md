### v1.4.7

- [Fixed](https://github.com/glacejs/glace-core/commit/bc421999402d8e70a8892cad23ee798d2c255730) failed retry mechanism.

### v1.4.6

- [Added](https://github.com/glacejs/glace-core/commit/e714b34d4548e7f011aa5c411d47c22079eece42) feature to launch all retried tests in one session.

### v1.4.5

- [Implemented](https://github.com/glacejs/glace-core/commit/8b30c6d82db32e77c42626fa97d2becb332277c5) tests include to run.
- [Implemented](https://github.com/glacejs/glace-core/commit/9936d1897bbd6d17046028aff97730e0cdb2edc1) tests exclude from run.
- [Loaded](https://github.com/glacejs/glace-core/commit/b86ca1c929317dd63a6a5b55b52f56afca98e872) included and excluded tests from file.
- [Saved](https://github.com/glacejs/glace-core/commit/4fec3d8bddc1d84e2696339724173ad3c9f914ed) failed tests in JSON format.
- [Added](https://github.com/glacejs/glace-core/commit/0e05e77a502d20a6c682b615017a95dfea586b3f) CLI option to print errors immediately.

### v1.4.4

- Update dependencies.

### v1.4.3

- Update `glace-utils` to not kill parent process.

### v1.4.2

- [Added](https://github.com/glacejs/glace-core/commit/2f8260d309f8b92dc4dc9a147b18c10b2169d928) option to finish test run on first failure.

### v1.4.1

- [Added](https://github.com/glacejs/glace-core/commit/06fea5b70c1260d1e6cfe1d78f87e5368189c64d) ability to mark chunks as skipped.
- [Added](https://github.com/glacejs/glace-core/commit/b64defeef9adf32f97e33c31ad236807e0acc0d8) feature to print tests time duration in human-readable format.
- [Fixed](https://github.com/glacejs/glace-core/commit/a0563f0eeb51a9e242ef9e6b0396fdea9fc6bf38) bug with wrong exit code on non-test hook failure.

### v1.4.0

- [Fixed](https://github.com/glacejs/glace-core/commit/141cf47c1d454191356bad47b4974a982802a5cc) bug when glace returned incorrect exit code on test retry.

### v1.3.9

- [Fixed](https://github.com/glacejs/glace-core/commit/f845a22bcbbfcfa9be28e0d6406600552cd64d61) stdout in testrail check command.

### v1.3.8

- [Added](https://github.com/glacejs/glace-core/commit/369c3b45b36ef3c614c261cc4b2a82e1f7d178a9) CLI option to check TestRail cases consistency with implemented tests.

### v1.3.7

- [Added](https://github.com/glacejs/glace-core/commit/c881b35b93a46b4734396431e3fbe6756a07f994) ability to restart only failed params even if in retry before all test was failed.

### v1.3.6

- [Fixed](https://github.com/glacejs/glace-core/commit/f2560ceff37891d0e9c00ec10c71a12c6305bcbb) bug in testrail api.

### v1.3.5

- [Added](https://github.com/glacejs/glace-core/commit/0f49bbeea49466593d53dbd8538cf9eda7e07fb4) relevant step docs sorting with machine learning algorithms via [natural](https://github.com/NaturalNode/natural).

### v1.3.4

- [Added](https://github.com/glacejs/glace-core/commit/24f00ce365139e9c314420aeeb1e270902b5ca05) interactive mode.

### v1.3.3

- [Added](https://github.com/glacejs/glace-core/commit/530990e287f6a1ecd2748294565f18b6a61d11d3) multi-word search in docs of steps and fixtures.

### v1.3.2

- [Added](https://github.com/glacejs/glace-core/commit/3689acb6420be5743e9e0d477a065c1235217e51) full-text search in docs of steps and fixtures.

### v1.3.1

- [Fixed](https://github.com/glacejs/glace-core/commit/492da556d93e4a14a01450805b0a65c309a3ec1c) bug that custom steps class wasn't shown in CLI docs.

### v1.3.0

- [Used](https://github.com/glacejs/glace-core/commit/ceebad4930babef3bbfbe07f9e54d67742d4380c) docstring style for fixtures.

### v1.2.9

- [Used](https://github.com/glacejs/glace-core/commit/10a9888d390da03a195f7f9a08e899ed58da92c3) `js` syntax highlight in steps documentation in CLI.

### v1.2.8

- [Added](https://github.com/glacejs/glace-core/commit/cb0457158aa335e68d9a21f9d082c0fd1e19eb9b) ability to show steps documentation in `--list-steps`.

### v1.2.7

- [Added](https://github.com/glacejs/glace-core/commit/40c8b64472262b0485b9ce9690b2e0e4e072620d) CLI options `--list-steps [filter]`, `--list-tests [filter]`, `--list-fixtures [filter]`.

### v1.2.6

- [Decomposed](https://github.com/glacejs/glace-core/commit/66f2fc420a41c8e0a0a2a3342f69b26b44770082) global functions.
- [Added](https://github.com/glacejs/glace-core/commit/ae75ec65247fe64b74c6dec42d7220a31802d83a) option to enter to interactive debug mode on step failure.

### v1.2.5

- [Fixed](https://github.com/glacejs/glace-core/commit/c21f084aad0a893159ce83d64821ba6814695dfb) bug that option `--chunk-timeout no` leaded to default timeout `2000`.

### v1.2.4

- [Added](https://github.com/glacejs/glace-core/commit/d4e36f12b12ed7a59731e8bae8740d573c21fc46) custom path for log files.

### v1.2.3

- [Fixed](https://github.com/glacejs/glace-core/commit/f027e9dafd7970cc67fd10064703ee5fa66ce1db) bug that relative root conftest wasn't resolved correct.

### v1.2.2

- Fixed a bug that glace raised error if steps property didn't exist.

### v1.2.1

- [Added](https://github.com/glacejs/glace-core/commit/f215464034c0f2f06f6f5d73169bc4c62e7970d3) helpers for easy integration with [glace-testgen](https://glacejs.github.io/glace-testgen/) plugin.

### v1.2.0

- [Added](https://github.com/glacejs/glace-core/commit/da1b392f2136a9e00597223580209db572015e0c) feature to kill processes before tests run.

### v1.1.9

- [Fixed](https://github.com/glacejs/glace-core/commit/d563b0148bb99ce8fb2e5a48e8a7b3051ccd7db2) bug that on parametrized test failure failed params may be added to retry more that one time.

### v1.1.8

- [Added](https://github.com/glacejs/glace-core/commit/6c438348440c37a0419989b84ef8aad6d41f9570) step to enter to interactive debug mode.

### v1.1.7

- Patched `rewire` in order to add method `__reset__` to restore original module state.

### v1.1.6

- [Added](https://github.com/glacejs/glace-core/commit/3b7b4c137a060050cf91106e506b8510e95bc7ab) `rewire` and `sinon-chai`.

### v1.1.5

- [Fixed](https://github.com/glacejs/glace-core/commit/7ae470289765dc36aceafc37f3a93ebe39d029cc) bug that matcher `waitFor` didn't work correct with async predicates.

### v1.1.4

- [Added](https://github.com/glacejs/glace-core/commit/a9a8c8c9da158da35bd4c6099fe80b9392c3a2e0) chai matcher `waitFor`.

### v1.1.3

- [Expanded](https://github.com/glacejs/glace-core/commit/3a4d090f95b3ffb510ea8dd26ac56a8b8d27b196) test & chunk [options](tutorial-test-options.html).

### v1.1.2

- Updated `mocha` to latest version.
- Updated `glace-utils` to support config parents loading.

### v1.1.1

- [Fixed](https://github.com/glacejs/glace-core/commit/ebda01ce0fb6477c1ee32069cf65ff665f308d81) typo in tests loader method to scan test modules.
- [Added](https://github.com/glacejs/glace-core/commit/6999d5177c9dfb424b757f7d1c87d7106a0d1c21) feature to show tests summary time.
- [Added](https://github.com/glacejs/glace-core/commit/ca22c76bc2f8519ee2649b3f2ff1c3f8a35d5f01) feature to capture skipped tests in reporters.
- [Fixed](https://github.com/glacejs/glace-core/commit/43d1f7daa301abc22dcfc4be3824910e1e0c78d4) bug with disorder in plugins loader.

### v1.1.0

- Generate session ID on start.

### v1.0.9

- Show a number of executed chunks in report.
- Show link to xunit report if it is active.

### v1.0.8

- Supports `xunit` reporter, which may be activated with CLI option `--xunit`.

### v1.0.7

- Plugin reporters are registered on reporting system loading.
- CLI option `--chunk timeout <timeout>` sets time (sec) to execute for all hooks
and chunks. Default value is 180 sec.
- Test or scope option `{ chunkTimeout: <timeout> }` sets time (sec) to execute
for hooks and chunks inside test or scope and overrides global value.
