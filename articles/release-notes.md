### v1.0.8

- Supports `xunit` reporter, which may be activated with CLI option `--xunit`.

### v1.0.7

- Plugin reporters are registered on reporting system loading.
- CLI option `--chunk timeout <timeout>` sets time (sec) to execute for all hooks
and chunks. Default value is 180 sec.
- Test or scope option `{ chunkTimeout: <timeout> }` sets time (sec) to execute
for hooks and chunks inside test or scope and overrides global value.
