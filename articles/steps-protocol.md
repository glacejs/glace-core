Way to develop `GlaceJS`-compatible applications which may be used as `GlaceJS` plugins. Any application which implements `STEPS` protocol should follow next rules:

- Its modules should be lazy-loaded, for example, `require("glace-web")` should be empty by default
- It should provide `Steps` module, which based on `STEPS` architecture, for example, `require("glace-web").Steps`
- `Steps` module is object with functions, which will be mixed with base `Steps` class.
- It should provide `globals` module, for example, `require("glace-web").globals`, which will be loaded after main `globals` and may override it.
- It should provide `pluginHelp` module, for example, `require("glace-web").pluginHelp`, which will extend application help.
- It should active plugin fixtures on `Steps` module import.

`STEPS` protocol is bidirectional. It means that any plugin may be easily transformed to standalone application, and any standalone application may be used as plugin.
