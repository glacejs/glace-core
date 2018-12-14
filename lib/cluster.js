"use strict";

/**
 * **Is used to execute tests concurrently in subprocesses.**
 *
 * Scheduler process is named `master`, subprocesses with tests are `slaves`.
 * `Master` uses simple scheduling, splitting tests on parts by `slaves` number.
 *
 * @module
 */

const fs = require("fs");
const path = require("path");

require("colors");
const _ = require("lodash");
const fse = require("fs-extra");
const spawn = require("cross-spawn");
const U = require("glace-utils");

const CONF = require("./config");
const tools = require("./tools");

module.exports = {
    /**
     * Launches tests in subprocesses.
     *
     * @async
     * @instance
     * @function
     * @arg {function} [cb] - Callback function executing at the end.
     * @arg {number} cb.exitCode - Subprocesses summary exit code.
     * @return {Promise<number|*>} Exit code if callback isn't passed,
     * or result providing by callback.
     */
    launch: async cb => {
        cb = cb || (o => o);

        resetArtifactsDir();
        await killProcs();

        const argv = _.clone(process.argv);
        const cmd = argv.shift();
        const testIds = getTestIds();
        const procs = [];

        _.range(1, CONF.cluster.slavesNum + 1).forEach(i => {
            procs.push(new Promise(launchSlave(i, cmd, argv, testIds)));
        });

        const codes = await Promise.all(procs);
        if (fs.existsSync(CONF.report.dir)) U.clearEmptyFolders(CONF.report.dir);
        printArtifactsDir();

        const resultCode = calcExitCode(codes);
        return cb(resultCode);
    },
};

/**
 * Kills requested processes one time in `master`. In `slaves` killing is disabled.
 *
 * @ignore
 */
const killProcs = async () => {
    for (const procName of (CONF.session.killProcs || [])) {
        await U.killProcs(procName);
    }
};

/**
 * Artifacts folder includes `master` report and `slaves` reports.
 *
 * @ignore
 */
const resetArtifactsDir = () => {
    if (CONF.report.clear && fs.existsSync(CONF.cluster.artifactsDir)) {
        fse.removeSync(CONF.cluster.artifactsDir);
    }
    fse.mkdirsSync(CONF.cluster.artifactsDir);
};

const printArtifactsDir = () => {
    console.log();
    const reportMsg = "Artifacts are in " + CONF.cluster.artifactsDir;
    console.log(Array(reportMsg.length + 1).join("-").yellow);
    console.log(reportMsg.yellow);
};

const calcExitCode = codes => {
    let exitCode = 0;
    for (const code of codes) {
        if (code === 0) continue;
        exitCode = Math.min(exitCode + code, 255);
    }
    return exitCode;
};

const getTestIds = () => {
    tools.fakeLoad();
    let testIds = _.shuffle(CONF.test.cases.map(c => c.id));
    return _.chunk(testIds, Math.ceil(testIds.length / CONF.cluster.slavesNum));
};

const launchSlave = (i, cmd, argv, testIds) => resolve => {

    const env = _.clone(process.env);
    env.GLACE_SLAVE_ID = i;
    env.GLACE_TEST_IDS = testIds[i - 1];
    const opts = { env };

    const stream = fs.createWriteStream(
        path.resolve(CONF.cluster.artifactsDir, `slave-${i}.stdout`));

    console.log(`Slave #${i} is working...`.yellow);
    const proc = spawn(cmd, argv, opts);
    proc.stdout.pipe(stream);
    proc.stderr.pipe(stream);
    proc.on("close", endSlave(resolve, i));
};

const endSlave = (resolve, i) => code => {
    if (code === 0) {
        console.log(`Slave #${i} is succeeded`.green);
    } else {
        console.log(`Slave #${i} is failed with code ${code}`.red);
    }
    resolve(code);
};
