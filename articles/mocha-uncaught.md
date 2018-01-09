In `mocha` it's very easy to break async tests queue due to `uncaught exceptions` processing mechanism in `mocha`.

1. Create tests file with next content:

    ```javascript
    "use strict";

    var sleep = timeout => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`I was sleeping ${timeout} ms`);
                resolve();
            }, timeout);
        });
    };

    var error = timeout => {
        setTimeout(() => {
            throw new Error("BOOM!!!");
        }, timeout);
    };

    describe("scope", () => {
        it ("test #1", async () => {
            error(1000);
            await sleep(1000);
        });
        it ("test #2", async () => await sleep(1000));
        it ("test #3", async () => {
            error(1000);
            await sleep(1000);
        });
        it ("test #4", async () => await sleep(1000));
        it ("test #5", async () => await sleep(1000));
        it ("test #6", async () => await sleep(1000));
    });
    ```

2. Run and get something at first sight incomprehensible:

```
$ mocha uncaught.js


scope
    1) test #1  # in console it colored as red (failed)
I was sleeping 1000 ms
    √ test #1 (1012ms)
    2) test #3  # in console it colored as red (failed)
I was sleeping 1000 ms
I was sleeping 1000 ms
    √ test #4
    √ test #4
I was sleeping 1000 ms
I was sleeping 1000 ms
I was sleeping 1000 ms
    √ test #6 (1002ms)
    √ test #6 (1002ms)
    √ test #6 (1003ms)

6 passing (3s)
2 failing

1) scope
    test #1:
    Uncaught Error: BOOM!!!
    at Timeout.setTimeout [as _onTimeout] (uncaught.js:12:15)

2) scope
    test #3:
    Uncaught Error: BOOM!!!
    at Timeout.setTimeout [as _onTimeout] (uncaught.js:12:15)





6 passing (3s)
2 failing

1) scope
    test #1:
    Uncaught Error: BOOM!!!
    at Timeout.setTimeout [as _onTimeout] (uncaught.js:12:15)

2) scope
    test #3:
    Uncaught Error: BOOM!!!
    at Timeout.setTimeout [as _onTimeout] (uncaught.js:12:15)




6 passing (3s)
2 failing

1) scope
    test #1:
    Uncaught Error: BOOM!!!
    at Timeout.setTimeout [as _onTimeout] (uncaught.js:12:15)

2) scope
    test #3:
    Uncaught Error: BOOM!!!
    at Timeout.setTimeout [as _onTimeout] (uncaught.js:12:15
```

At first, please note that `test #1` is marked twice: as **passed** and as **failed**!
Second, `test #2` and `test #5` are absent in the report.
Third, begins simultaneous delivery of messages `I was sleeping 1000 ms`, first 1 time, then 2 times, then 3 times.

Now consider why this is so.
The problem is that `mocha` [default handles](https://github.com/mochajs/mocha/blob/master/lib/runner.js#L698) `uncaught exceptions`.
If such an exception occurs, `mocha` fails current test, no matter whether with him or even `uncaught exception` was generated
by an asynchronous call to a lot of tests ago (e.g. due to forgotten / hanging timers, etc.). And since this processor is
implemented via a `listener`, then in my example it is a very interesting thing:

1. On one hand in the test after 1 second `uncaught exception` happens and invokes its handler, on the other side the test
explicitly waits for 1 second end of sleep and marks the test as passed.

1. Because of the async of `JavaScript`, we have two concurrent test processors, which leads to twice appearance of a report of `test #1`.

1. Moreover, from now on, we have two places which emit event to start a new test. And in fact, one queue was splitted to 2 queues!

1. In `test #3` the situation is repeated, leading to further division of the queue. And we have 3 competitive operating test queues!
This can be observed by the increment of the number of messages `I was sleeping 1000 ms`.

In our work, we periodically met such split of queue, so this example is based on a real existing problem.
In the end, the whole run was in the trash, because due to queue splitting test results weren't correct.

### How to fix

Simple and working variant to suppress uncaught exception.

```javascript
var Mocha = require("mocha");
Mocha.Runner.prototype.uncaught = function (err) {
logger.error("UNCAUGHT ERROR", err);
};
```

Better to get one failed test, and in finalizers to close all descriptors, proxies, to kill processes, etc.,
to suppress and log `uncaught exception`, and then analyze the logs for their presence.
Than to collapse the queue and get failed report of all night run.
In my work this approach was really helpful. That's why `glace` supports own variants to process `uncaught exceptions` (see CLI option `--uncaught`).

P. S. `mocha` has the option `--allow-enable - uncaught uncaught errors to propagate`.
But I did not understand what it is, because it certainly does not solve the problem.
