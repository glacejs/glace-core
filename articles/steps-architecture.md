`glace` approach of functional autotests development is based on next principles:

- **Any complex test can be divided to atomic steps.** For example, [glace-js/tests/e2e/testProxy.js#L3](https://github.com/glacejs/glace-js/blob/2.5.0/tests/e2e/testProxy.js#L3):

```javascript
test("Proxy subsystem", () => {

    chunk("It should use URL via global proxy", async () => {
        await $.restartBrowser();
        await $.openUrl("https://opennet.ru");
    });

    chunk("It should manage global proxy inside test", async () => {
        await $.restartBrowser();
        await $.openUrl("https://opennet.ru");
        await $.stopGlobalProxy();
        await $.restartBrowser();
        await $.openUrl("https://opennet.ru");
        await $.startGlobalProxy();
    });
});
```

- **Almost all tests contain steps which are (or can be) used in other tests.**
- **Each step should be finished with verification that its result is correct.** For example, [glace-web/lib/steps/browser.js#L508](https://github.com/glacejs/glace-web/blob/1.3.8/lib/steps/browser.js#L508):

```javascript
openUrl: async function (webUrl, opts) {
    opts = U.defVal(opts, {});
    var check = U.defVal(opts.check, true);
    var timeout = U.defVal(opts.timeout, CONF.web.pageTimeout) * 1000;
    allure.step(`Open URL "${webUrl}" in browser`);
    LOG.info(`Openning URL "${webUrl}" in browser...`);
    await this.webdriver.url(webUrl);
    if (check) {
        var errMsg = `Browser did not navigate to "${webUrl}" ` +
                        `during ${timeout} ms`;

        await this.webdriver.waitUntil(async () => {
            var curUrl = await this.webdriver.getUrl();
            LOG.debug(`Compare current URL "${curUrl}" with expected "${webUrl}"`);
            return curUrl.startsWith(webUrl);
        }, timeout, errMsg);
    };
    LOG.info("URL is opened");
    allure.pass();
},
```

- **Verification of step can be disabled if it needs for negative scenarios.**
- **Steps are separated to `change`-steps, `get`-steps, `check`-steps.**
- **`change`-step changes state of system.** For example, it creates / updates / removes resource (object / value): `createUser`, `launchBrowser`.
- **`get`-step returns resource.** For example: `getBrowser`, `getWindows`.
- **`check`-step checks state of resource.** For example, `checkBrowserPresence`, `checkUserExistence`.
- **`change`-step should return `true` if it was executed and doesn't return another step-specific value.** For example, [glace-web/lib/steps/browser.js#L440](https://github.com/glacejs/glace-web/blob/1.3.8/lib/steps/browser.js#L440):

```javascript
    LOG.info("Browser is closed");
    allure.pass();
    return true; // HERE
},
```

- **`change`-step should return `false` if it wasn't executed.** For example, [glace-web/lib/steps/browser.js#L411](https://github.com/glacejs/glace-web/blob/1.3.8/lib/steps/browser.js#L411):

```javascript
if (!this._webdrivers().top()) {
    LOG.debug("No one browser is launched yet");
    return false; // HERE
};
```

- **`change`-steps can be connected to opposite pair: `start` & `finish`.** For example: `launchBrowser` & `closeBrowser`.
- **if `start`-step wasn't executed, `finish`-step shouldn't be executed.** For example, [glace-web/lib/fixtures.js#L41](https://github.com/glacejs/glace-web/blob/1.3.8/lib/fixtures.js#L41):

```javascript
global.fxBrowser = func => {
    var isStarted;

    before(async () => {
        isStarted = await $.launchBrowser();
    });

    func();

    after(async () => {
        if (!isStarted) return; // HERE
        await $.closeBrowser();
    });
};
```
