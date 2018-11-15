### <a name="test" href="#test">#</a> test

`test` is a central function which is used to create a testcase unit. [Full info ➤](global.html#test)

```javascript
test("It should print 'hello world'", () => {
    chunk(() => {
        console.log("hello world");
    });
});
```

```
➜ glace-core: ./bin/glace example.js

suite: Session 2018-11-15 09:27:15

  test: It should print 'hello world'
hello world
    ✓ chunk

  ✓ 1 passed test
  1 executed chunk

  Summary tests time is 0.003 sec

-----------------------------------------------------------
Local report is /home/user/projects/glace/glace-core/report
```

`test` should contain as minimum one `chunk`, named or unnamed.

### <a name="chunk" href="#chunk">#</a> chunk

`chunk` is independently executed part of `test`. _Independently_ means even if
first chunk is failed, other chunks will be executed in any case. [Full info ➤](global.html#chunk)

```javascript
test("It should include one unnamed chunk", () => {
    chunk(() => {
        console.log("do some stuff");
    });
});

test("It should include one named chunk", () => {
    chunk("first chunk", () => {
        console.log("do some stuff");
    });
});

test("It should include several chunks", () => {
    chunk("first chunk", () => {
        console.log("do some stuff");
    });
    chunk("second chunk", () => {
        console.log("do some stuff");
    });
});

test("It should include failed & passed chunks", () => {
    chunk("which is failed", () => {
        throw Error("BOOM!");
    });
    chunk("which is passed", () => {
        console.log("do some stuff");
    });
});
```

```
➜ glace-core: ./bin/glace example.js

suite: Session 2018-11-15 09:38:45

  test: It should include one unnamed chunk
do some stuff
    ✓ chunk

  test: It should include one named chunk
do some stuff
    ✓ chunk: first chunk

  test: It should include several chunks
do some stuff
    ✓ chunk: first chunk
do some stuff
    ✓ chunk: second chunk

  test: It should include failed & passed chunks
    ✖ chunk: which is failed
do some stuff
    ✓ chunk: which is passed

  ✓ 3 passed tests
  ✖ 1 failed test
  6 executed chunks

  Summary tests time is 0.005 sec

TEST FAILURES:

test: It should include failed & passed chunks

which is failed
message: BOOM!
stack: Error: BOOM!
    at chunk (example.js:24:15)
    at Context.<anonymous> (lib/globals/chunk.js:88:18)
    at next (lib/hacking.js:45:20)
    at Immediate.<anonymous> (lib/hacking.js:88:9)

-----------------------------------------------------------
Local report is /home/user/projects/glace/glace-core/report
```

### <a name="before" href="#before">#</a> before

`before` is a hook executed before all chunks inside a test or before all tests inside a suite / scope / session. [Full info ➤](global.html#before)

```javascript
test("It should execute hook before all chunks", () => {
    before(() => {
        console.log("some stuff before chunks");
    });
    chunk("first chunk", () => {
        console.log("do some stuff");
    });
    chunk("second chunk", () => {
        console.log("do some stuff");
    });
});
```

### <a name="after" href="#after">#</a> after

`after` is a hook executed after all chunks inside a test or after all tests inside a suite / scope / session. [Full info ➤](global.html#after)

```javascript
test("It should execute hook after all chunks", () => {
    chunk("first chunk", () => {
        console.log("do some stuff");
    });
    chunk("second chunk", () => {
        console.log("do some stuff");
    });
    after(() => {
        console.log("some stuff after chunks");
    });
});
```

### <a name="before-chunk" href="#before-chunk">#</a> beforeChunk

`beforeChunk` is a hook executed before each chunk inside a test. [Full info ➤](global.html#beforeChunk)

```javascript
test("It should execute hook before each chunk", () => {
    beforeChunk(() => {
        console.log("some stuff before each chunk");
    });
    chunk("first chunk", () => {
        console.log("do some stuff");
    });
    chunk("second chunk", () => {
        console.log("do some stuff");
    });
});
```

### <a name="after-chunk" href="#after-chunk">#</a> afterChunk

`afterChunk` is a hook executed after each chunk inside a test. [Full info ➤](global.html#afterChunk)

```javascript
test("It should execute hook after each chunk", () => {
    chunk("first chunk", () => {
        console.log("do some stuff");
    });
    chunk("second chunk", () => {
        console.log("do some stuff");
    });
    afterChunk(() => {
        console.log("some stuff after each chunk");
    });
});
```

### <a name="steps" href="#steps">#</a> $

`$` is the steps namespace, central concept of `glace` [philosophy](tutorial-steps-architecture.html). Ideally and normally in `glace` tests
to have only step calls inside test chunks. `glace-core` provides only basic [steps]{@link Steps}, other steps for specific actions are provided by
plugins or should be implemented together with tests development. There are more [examples](https://github.com/glacejs/glace-js/tree/master/tests/e2e) of steps usage in `glace-js`. And here some basic:

```javascript
suite("Timer steps", () => {

    test("It should sleep 1 sec", () => {
        chunk(async () => {
            await $.pause(1, "sleep 1 sec");
        });
    });

    test("It should pass timer check", () => {
        chunk(async () => {
            await $.startTimer();
            await $.pause(1, "sleep");
            await $.checkTimer({ "to be above": 1 });
        });
    });

    test("It should fail timer check", () => {
        chunk(async () => {
            await $.startTimer();
            await $.pause(1, "sleep");
            await $.checkTimer({ "to be below": 1 });
        });
    });

    test("It should fail because timer is not started", () => {
        chunk(async () => {
            await $.startTimer();
            await $.pause(1, "sleep");
            await $.stopTimer();
            await $.checkTimer({ "to be equal": 1 });
        });
    });
});
```

```
➜ glace-core: ./bin/glace example.js

suite: Session 2018-11-16 08:29:39

  suite: Timer steps

    test: It should sleep 1 sec
      ✓ chunk

    test: It should pass timer check
      ✓ chunk

    test: It should fail timer check
      ✖ chunk

    test: It should fail because timer is not started
      ✖ chunk

  ✓ 2 passed tests
  ✖ 2 failed tests
  4 executed chunks

  Summary tests time is 4.032 sec

TEST FAILURES:

test: It should fail timer check

message: Timing is failed: expected 1.005 to be below 1
stack: AssertionError: Timing is failed: expected 1.005 to be below 1
    at Proxy.Assertion.correspond (lib/matcher.js:50:27)
    at Proxy.checkTimer (lib/steps/timer.js:135:56)
    at chunk (example.js:23:21)
    at <anonymous>

test: It should fail because timer isn't started

message: Timer isn't started: expected null to exist
stack: AssertionError: Timer isn't started: expected null to exist
    at Proxy.getTimer (lib/steps/timer.js:103:54)
    at Proxy.checkTimer (lib/steps/timer.js:135:21)
    at chunk (example.js:32:21)
    at <anonymous>

-----------------------------------------------------------
Local report is /home/user/projects/glace/glace-core/report
```

### <a name="config" href="#config">#</a> CONF

`CONF` refers to `glace` configuration and is mostly used inside steps, features or iterators, rather than inside tests directly.
For example, [glace-core/lib/globals/forEachLanguage.js#L66](https://github.com/glacejs/glace-core/blob/1.8.9/lib/globals/forEachLanguage.js#L66):

```javascript
scope(`${name} "${lang}"`, () => {
    let oldLang;

    before(() => {
        if (CONF.test.curCase) {
            oldLang = CONF.test.curCase.testParams.language;
            CONF.test.curCase.testParams.language = lang;
        }
    });

    U.wrap(fixtures, () => func(lang))();

    after(() => {
        if (CONF.test.curCase) {
            CONF.test.curCase.testParams.language = oldLang;
        }
    });
});
```

`CONF` is global object for all `glace` components, which means that even if some `glace` plugin imports own config module internally,
finally it works in the same global config namespace. [Full info ➤]{@link GlaceConfig}

### <a name="fixtures" href="#fixtures">#</a> fixtures

`Fixtures` are reusable functions, which can add hooks before and after test or group of tests.
They were introduced to `glace-core` under impression of [pytest fixtures](https://docs.pytest.org/en/latest/fixture.html).
Simple fixture can be presented as:

```javascript
const myFixture = testFunc => {
    before(() => console.log("fixture before"));
    testFunc();
    after(() => console.log("fixture after"));
};
```

Now it can be reusable as many times as it needs. For example:

```javascript
suite("My suite", [myFixture], () => {

    test("first test", () => {
        chunk(() => {});
    });

    test("second test", [myFixture], () => {
        chunk(() => {});
    });
});
```

Run result:

```
➜ glace-core: ./bin/glace example.js

suite: Session 2018-11-22 07:39:21

  suite: My suite
fixture before

    test: first test
      ✓ chunk

    test: second test
fixture before
      ✓ chunk
fixture after
fixture after

  ✓ 2 passed tests
  2 executed chunks

  Summary tests time is 0.005 sec

-----------------------------------------------------------
Local report is /home/user/projects/glace/glace-core/report
```

`Fixtures` can be used with [test](global.html#test), [scope](global.html#scope), [suite](global.html#suite), [session](global.html#session) and [forEachLanguage](global.html#forEachLanguage).

Many `glace` plugins offer fixtures as wrappers on their steps. For example, [glace-web/lib/fixtures.js#L18](https://github.com/glacejs/glace-web/blob/1.3.8/lib/fixtures.js#L18).
And `glace-js` session is fully based on [fixtures reusage](https://github.com/glacejs/glace-js/blob/2.5.2/lib/globals.js#L24).

### <a name="iterators" href="#iterators">#</a> iterators

`iterators` are used to make parametrization over tests or chunks. Underhood `iterators` are cycles.
`glace-core` provides iterator [forEachLanguage](global.html#forEachLanguage) to make easy localisation tests.

```javascript
suite("Localisation tests", () => {
    test("my test", () => {
        forEachLanguage(lang => {
            chunk(() => {
                // someLangSpecificStuff(lang);
            });
        });
    });
});
```

```
➜ glace-core: ./bin/glace example.js --languages en,ru,fr

suite: Session 2018-11-22 07:39:21

  suite: Localisation tests

    test: my test

      scope: for language "en"
        ✓ chunk

      scope: for language "ru"
        ✓ chunk

      scope: for language "fr"
        ✓ chunk

  ✓ 1 passed test
  3 executed chunks

  Summary tests time is 0.004 sec

-----------------------------------------------------------
Local report is /home/user/projects/glace/glace-core/report
```

### <a name="suite" href="#suite">#</a> suite

`suite` is used to group tests. [Full info ➤](global.html#suite)

```javascript
suite("my tests", () => {
    test("first test", () => {
        chunk(() => {});
    });

    test("second test", () => {
        chunk(() => {});
    });
});
```

```
➜ glace-core: ./bin/glace example.js

suite: Session 2018-11-22 07:39:21

  suite: my tests

    test: first test
      ✓ chunk

    test: second test
      ✓ chunk

  ✓ 2 passed tests
  2 executed chunks

  Summary tests time is 0.004 sec

-----------------------------------------------------------
Local report is /home/user/projects/glace/glace-core/report
```

### <a name="scope" href="#scope">#</a> scope

`scope` is used to group tests or chunks. [Full info ➤](global.html#scope)

```javascript
test("my test", () => {

    scope("user chunks", () => {
        chunk("login as user", () => {});
        chunk("post a message", () => {});
    });

    scope("admin chunks", () => {
        chunk("login as admin", () => {});
        chunk("moderate messages", () => {});
    });
});
```

```
➜ glace-core: ./bin/glace example.js

suite: Session 2018-11-22 07:39:21

  test: my test

    scope: user chunks
      ✓ chunk: login as user
      ✓ chunk: post a message

    scope: admin chunks
      ✓ chunk: login as admin
      ✓ chunk: moderate messages

  ✓ 1 passed test
  4 executed chunks

  Summary tests time is 0.004 sec

-----------------------------------------------------------
Local report is /home/user/projects/glace/glace-core/report
```

### <a name="session" href="#session">#</a> session

`session` is root suite, which is created automatically (not need to use it explicitly). [Full info ➤](global.html#session)

But it can be overridden to extend its functionality, for example [glace-js/lib/globals.js#L13](https://github.com/glacejs/glace-js/blob/2.5.3/lib/globals.js#L13):

```javascript
const gSession = session;
global.session = (name, fixtures, func) => {
    if (_.isFunction(fixtures)) [func, fixtures] = [fixtures];
    if (_.isArray(name)) [fixtures, name] = [name];
    if (_.isFunction(name)) [func, name] = [name];
    fixtures = fixtures || [];
    if (CONF.web.use && !CONF.cluster.slavesNum) fixtures.push(fxKillWebdriver);
    if (CONF.xvfb.use) fixtures.push(fxXvfb);
    if (CONF.proxy.global) fixtures.push(fxGlobalProxy);
    if (CONF.proxy.http) fixtures.push(fxHttpProxy);
    if (CONF.web.use && !CONF.webdriver.host) fixtures.push(fxSelenium);
    if (CONF.web.use) fixtures.push(fxBrowser);
    if (CONF.image.screenOnFail) fixtures.push(fxScreenOnFail);
    gSession(name, fixtures, func);
};
```
