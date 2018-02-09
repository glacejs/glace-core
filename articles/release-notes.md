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
