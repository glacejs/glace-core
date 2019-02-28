### v1.9.7

- Updated dependencies to latest versions.

### v1.9.6

- [Added](https://github.com/glacejs/glace-core/commit/f765a2bdcc4be3723571acec8452e8e355524ea9) entry points to override test comments in testrail report.

### v1.9.5

- [Added](https://github.com/glacejs/glace-core/commit/8c691af6147d5f9337de53a8dc48884ecc934fd0) function to print function doc in interactive mode.

### v1.9.4

- [Fixed](https://github.com/glacejs/glace-core/commit/d897137de3507600a67ee1dab1fb4ab0803087f9) bug to use scope in session.

### v1.9.3

- [Skipped](https://github.com/glacejs/glace-core/commit/4758ff08f21b36ca76a07d849dabca69403bdc85) processesing of mocha
root suite in reporter.

### v1.9.2

- [Moved](https://github.com/glacejs/glace-core/commit/89305c1c5750f06682b5ca7be3c6c3791afce6c0) fixtures before options in arguments, enhanced arguments usage.

### v1.9.1

- [Enhanced](https://github.com/glacejs/glace-core/commit/e72bf8071a53e8272dcd02ad0129662dcba8ef26) fixtures usage.

### v1.9.0

- [Enhanced](https://github.com/glacejs/glace-core/commit/04967ccf5c598fde726fd663451daa495c480301) `retry` mode to involve
all hooks in tests session.

### v1.8.9

- [Updated](https://github.com/glacejs/glace-core/commit/5b2a1105e009461eb3cabbddec0b1aeec76435d3) log message format.

### v1.8.8

- Updated dependencies to latest versions.

### v1.8.7

- [Match](https://github.com/glacejs/glace-core/commit/1efd04a12f1192eca738b5f47e80851c538a1248) retries with allure report.

### v1.8.6

- [Fixed](https://github.com/glacejs/glace-core/commit/97ad29ba1eb38f878b17d300e6926a0cd0b2bd1a) bug that in scope default fixtures were initialized as empty object instead of empty array.
- [Fixed](https://github.com/glacejs/glace-core/commit/62c2eff46dba2e926d3ed86596bc3abbba68cba5) bug that mocha grep passed all tests on retry.

### v1.8.5

- Extended tests coverage > 90%.
- Refactoring.

### v1.8.4

- [Fixed](https://github.com/glacejs/glace-core/commit/00e91bce4ffbd8631215af14d50c51201a5655c7) bug that session errors were cleaned after retry.

### v1.8.3

- [Fixed](https://github.com/glacejs/glace-core/commit/273200fbd486fef55e6995af99f10963454964f1) critical bug that on session failure `glace` run eternal retry.
- [Capture](https://github.com/glacejs/glace-core/commit/1edc1e9419d84ebf80b64759250b9819cf12d0e1) session errors.
- Extended tests coverage.

### v1.8.2

- Extended tests coverage. Achieved green result bigger than 80%.
- Ridden of `SS` and `$$`. Started to use `$` only.

### v1.8.1

- [Added](https://github.com/glacejs/glace-core/commit/31acf299484d3be51febade025f2754d2bf14c73) mechanism to launch tests in separated processes in parallel via CLI option `--slaves`.

### v1.8.0

- [Refactored](https://github.com/glacejs/glace-core/commit/709fe45cc00c8b57da796a76c4c57e0cf742147d) reporting subsystem in order to clear reference to current test after `testEnd()` in all reporters.

### v1.7.9

- [Fixed](https://github.com/glacejs/glace-core/commit/8ba9984d6bac14813caee68c286e89cffbbbf545) bug that session wasn't marked as passed after each retry.
- [Fixed](https://github.com/glacejs/glace-core/commit/a688c7fd43bd67f2f469ed8ebad65944f591c1c1) bug that tests weren't retried on session fail.
- [Fixed](https://github.com/glacejs/glace-core/commit/42513721db37b980688ea06bdb49c7b3f408ddcf) bug that exit code was successful on uncaught errors.
- [Refactored](https://github.com/glacejs/glace-core/commit/c553f26b07570cb212fb2e09f28e9d292ebfce2f) `pass` reporter.
- [Refactored](https://github.com/glacejs/glace-core/commit/e9620a4dfe1bbdac5a4f207624362fb8da841c9d) `fail` reporter.

### v1.7.8

- [Switched](https://github.com/glacejs/glace-core/commit/ab1d5a3d26d7eecbde616fc85e03fc329f43e2c6) to promises in `testrail` reporter.
- [Fixed](https://github.com/glacejs/glace-core/commit/6a20d58ae00d0974038fe85dd60693321dabcb56) bug that test retry is stopped if session `before` hook is failed on retry.

### v1.7.7

- [Provided](https://github.com/glacejs/glace-core/commit/2a4858d70a8ef4deec8ccf9ad250bf3788fb6325) custom help message in debug mode.
- [Provided](https://github.com/glacejs/glace-core/commit/2a4858d70a8ef4deec8ccf9ad250bf3788fb6325#diff-4027a28cfc51393cf34c9349cf776056R160) global function `search` in debug mode.

### v1.7.6

- [Fixed](https://github.com/glacejs/glace-core/commit/82ce56c423a4e612c9b83c4b60cd51f302d27e70) that after relaunch only failed tests `glace` didn't save previously passed chunk ids.

### v1.7.5

- [Rid](https://github.com/glacejs/glace-core/commit/7bc36a1c12fb1b87330bfd20ccf246224501df0b) of context in failed tests relaunch.

### v1.7.4

- [Retry](https://github.com/glacejs/glace-core/commit/0fbb5261e027279a980db14517ce5f734bd4fa0e) only failed chunks.

### v1.7.3

- [Fixed](https://github.com/glacejs/glace-core/commit/aff28dc279d00dc18ee7f9e4ce898ba52522ffb8) wrong error message in debug mode.

### v1.7.2

- [Disable](https://github.com/glacejs/glace-core/commit/e406de3f114f4f6f943b6a2bbb2ee0769f635667) chunk timeout and optional reports on `--debug-on-fail`.

### v1.7.1

- [Fixed](https://github.com/glacejs/glace-core/commit/b4c318c52af5e6505c589c702d803c6b1a91f464) bug that all reporters are removed if try to remove some one.

### v1.7.0

- [Fixed](https://github.com/glacejs/glace-core/commit/8ee3f7c332f1c393ab8580926d8ef81ecad5efa6) typos in help file.

### v1.6.9

- [Fixed](https://github.com/glacejs/glace-core/commit/48dd4ca3a8ec5e2e8a713b71eeef521f69343035) bug with broken allure and testrail reporter after mocha suite title patching.

### v1.6.8

- [Work](https://github.com/glacejs/glace-core/commit/627fed6c13bf644b44fc1fb696c2d4aefbf48875#diff-2acae7e31165eb694193d65d70cbd7b5R88) around windows console gray ascii color problem.
- [Fixed](https://github.com/glacejs/glace-core/commit/627fed6c13bf644b44fc1fb696c2d4aefbf48875#diff-8a9b00c5521f6548b48bfcb39bcf961bR95) bug with `undefined` skip reason.

### v1.6.7

- [Removed](https://github.com/glacejs/glace-core/commit/468f1fdd42ce6529ccda7eb74037ff0eba052402) redundant test option `skipReason`.

### v1.6.6

- [Fixed](https://github.com/glacejs/glace-core/commit/61d2f4c73326977882c1140f13dab3c717ce861a) bug to create logs folder synchronously.

### v1.6.5

- [Fixed](https://github.com/glacejs/glace-core/commit/017ae40354d1f14b6ed7bc0566b1aaf6d2a660d0) bug that test, scope and suite names weren't defined precisely.
- Code improvements and tests expansion.

### v1.6.4

- [Fixed](https://github.com/glacejs/glace-core/commit/4cee8ef2a454df1dac72a95b261318d5b57b3694) bug that params from `include` file were ignored on retry after `before all` hook failure.

### v1.6.3

- [Create](https://github.com/glacejs/glace-core/commit/d37903c76fe4b59a2d796a29d5adc0c28240f772) logs folder before reporting.

### v1.6.2

- [Fixed](https://github.com/glacejs/glace-core/commit/c34e1cd2ba9df671879ee0844f9d4b2acda3cad9) bug to ignore include and exclude options in interactive mode.

### v1.6.1

- [Included](https://github.com/glacejs/glace-core/commit/353cde2a704f465f6e23f2d3fa595a2c4d43ed07) chai plugins [`chai-string`](http://www.chaijs.com/plugins/chai-string/), [`chai-fs`](http://www.chaijs.com/plugins/chai-fs/), [`chai-datetime`](http://www.chaijs.com/plugins/chai-datetime/).

### v1.6.0

- [Added](https://github.com/glacejs/glace-core/commit/3bb34580e5fbd935c067e7459593eff6f964df0a) CLI option `--dont-check-names`.

### v1.5.9

- [Fixed](https://github.com/glacejs/glace-core/commit/7cebd1d53ec182432e86bb0bacf7a15be1ea7220) bug that steps with ES6 options weren't rendered correct with `--list-step` CLI option.

### v1.5.8

- [Renamed](https://github.com/glacejs/glace-core/commit/d99c7a8c0119d68ab2eb327bf7fdfd2ba47aab04) reports folder.

### v1.5.7

- [Fixed](https://github.com/glacejs/glace-core/commit/f2494af1b94e6bb365b2dd30bc60b71e7a124b41) bug that suite wasn't rendered in stdout report.

### v1.5.6

- [Allure](https://github.com/glacejs/glace-core/commit/82b6498301f2f86f36985cc4dd881291ce11103b) reporter fixes.

### v1.5.5

- [Allure](https://github.com/glacejs/glace-core/commit/5199208789387ef0c2c8f1db0b705a75022d4f06) reporter fixes.

### v1.5.4

- [Added](https://github.com/glacejs/glace-core/commit/f8d4b0c79fe76a6c61e4e523413dc0c359580d3f) steps aliases `$` and `$$`.
- [Added](https://github.com/glacejs/glace-core/commit/d06344ca83224f72f8477439c8c5913bb59b4704) [allure](https://docs.qameta.io/allure/) reporter support.

### v1.5.3

- [Added](https://github.com/glacejs/glace-core/commit/43c22414ee23b359a8af3b337bcbefc2627df63b) helper `stubObject`.

### v1.5.2

- [Moved](https://github.com/glacejs/glace-core/commit/58f5ab5ccf17ebcc24ad83458a23f1e78c5e5ffa) stdout log under reports folder.
- [Changed](https://github.com/glacejs/glace-core/commit/7311eddd639acef1151cd5a0c7c650607d0ba143) project icon.
- [Used](https://github.com/glacejs/glace-core/commit/ac5335753f345d9467723e80ddb70f8c7ad7804d) pure javascript bayes classifier.

### v1.5.1

- Updated dependencies.

### v1.5.0

- [Skipped](https://github.com/glacejs/glace-core/commit/d16d59cd8e8ea046638341f9885142d5978bfc39#diff-9254b9e79d2209a77d013bf4df7e4810R114) registration of already registered plugin.
- [Added](https://github.com/glacejs/glace-core/commit/d16d59cd8e8ea046638341f9885142d5978bfc39#diff-9254b9e79d2209a77d013bf4df7e4810R131) API to get registered plugin names.

### v1.4.9

- [Fixed](https://github.com/glacejs/glace-core/commit/ebbbcdda5ba1df3126ed40501a81cad0d63e6dae) incorrect help.

### v1.4.8

- [Use](https://github.com/glacejs/glace-core/commit/d3d2ea037e3c8aea1067c4200066d0f16aa0f162) global session on retry ([#87](https://github.com/glacejs/glace-core/issues/87)).

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
