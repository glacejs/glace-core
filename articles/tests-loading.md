1. By default `glace` tries to load tests from folder `tests` in the same
folder where command `glace` was called.
1. Tests are loaded from folder recursively from subfolders too.
1. It's possible to explicitly specify path to tests folder, for example:
`glace /path/to/tests/dir`, or to sequence of folders:
`glace /path/to/dir1 /path/to/dir2`.
1. In folder, test files should have prefix `test`, for example:
`testMainPage.js`, `tests.js`, etc. Otherwise they will be missed.
1. Also it's possible to specify path to test file or sequence of test files
(prefix `test` isn't require in such case):
`glace /path/to/myTests.js /path/to/otherTests.js`. Or to mix folders and files:
`glace /path/to/tests/dir /path/to/myTests.js`.

### conftest.js

`conftest.js` is a special file which will be loaded before tests loading and
usually contains some preparation stuff.

1. Conftest may be located in any folder inside test folder hierarchy.
1. If conftest is located on one level with tests folder it will be loaded before
tests session start and global objects initialization.
1. It's possible to specify root conftest path via CLI option `--root-conftest`
which will be loaded before top level conftests, but after programmatically
configured preloads.
