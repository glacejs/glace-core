Approach for functional autotests development based on next principles:

- Any complex test may be divided to atomic steps.
- Almost all tests contain steps which are (or may be) used in other tests.
- Each step should be finished with verification that its result is correct.
- Verification of step may be disabled if it needs for negative scenarios.
- Steps are separated to **change**-steps, **get**-steps, **check**-steps.
- **change**-step should return `true` if it was executed and doesn't return another step-specific value.
- **change**-step should return `false` if it wasn't executed.
- **change**-steps may be connected to opposite pair: `start` & `finish`.
- if `start` **change**-step wasn't executed, `finish` **change**-step shouldn't be executed.
