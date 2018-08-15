"use strict";

/**
 * Contains code to split tests by slaves and launch them in parallel with
 * separated processes.
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
     * Launch tests on slave(s).
     *
     * @async
     * @function
     * @arg {function} [cb] - Callback function to call at the end.
     * @return {Promise<number|void>} - Result exit code if callback isn't passed.
     */
    launch: async cb => {
        resetArtifactsDir();
        await killProcs();

        const argv = _.clone(process.argv);
        const cmd = argv.shift();
        const testIds = getTestIds();
        const procs = [];

        _.range(1, CONF.cluster.slavesNum + 1).forEach(i => {
            procs.push(new Promise(resolve => {
                launchSlave(i, cmd, argv, testIds)(resolve);
            }));
        });

        const codes = await Promise.all(procs);
        if (fs.existsSync(CONF.report.dir)) U.clearEmptyFolders(CONF.report.dir);
        printArtifactsDir();

        const resultCode = calcExitCode(codes);
        if (cb) {
            cb(resultCode);
        } else {
            return resultCode;
        }
    },
};

const killProcs = async () => {
    for (const procName of (CONF.session.killProcs || [])) {
        await U.killProcs(procName);
    }
};

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
