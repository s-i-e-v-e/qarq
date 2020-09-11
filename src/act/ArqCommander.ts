/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Logger, Convert} from "../util/mod.ts";
import {TestRunner} from "../test/mod.ts";
import {
    ArqTarget,
    ArqCache,
} from "../data/mod.ts";
import {
    Restore,
    QarqConfiguration,
    QarqSync,
    QarqInit,
    Command,
} from "./mod.ts";

const CONFIG_DIR_PATH = ".qarq";
const CONFIG_FILE_PATH = `${CONFIG_DIR_PATH}/qarq.config.json`;

async function writeConfig(qc: QarqConfiguration) {
    const tmp = `${CONFIG_FILE_PATH}.tmp`;
    try {
        Deno.mkdirSync(CONFIG_DIR_PATH);
    }
    catch (e) {
        // swallow
    }

    await Deno.writeTextFile(tmp, qc.toString());
    await Deno.rename(tmp, CONFIG_FILE_PATH);
}

async function readConfig() {
    try {
        return QarqConfiguration.build(await Deno.readTextFile(CONFIG_FILE_PATH));
    }
    catch (e) {
        if (e instanceof Deno.errors.NotFound) {
            const qc = QarqConfiguration.build(`{"targets":[], "keys": {}}`);
            await writeConfig(qc);
            return qc;
        }
        else {
            throw e;
        }
    }
}

async function getTarget(nick: string) {
    const qc = await readConfig();
    const qt = qc.getTarget(nick);
    return ArqTarget.build(qt.nick, qt.type, qt.path, qc.keys);
}

export default class ArqCommander {
    static async listTargets() {
        const qc = await readConfig();
        qc.targets.forEach(x => console.log(`${x.nick} = [${x.type}] ${x.path}`));
    }

    static async addTarget(nick: string, type: string, targetPath: string) {
        const qc = await readConfig();
        qc.targets.push({
            nick: nick,
            type: type,
            path: targetPath
        });
        await writeConfig(qc);
    }

    static async listComputers(nick: string) {
        const qc = await readConfig();
        const target = await getTarget(nick);
        const xs = await target.listComputers();
        console.log(`target: ${target.path}`);
        Logger.log(xs);
        xs.forEach(x => {
            qc.keys[x.uuid] = [x.cry.pass].concat(...[x.cry.encryptionKey, x.cry.hmacCreationKey, x.cry.sha1ComputationKey].map(x => Convert.hexToHexString(x)));
        });
        await writeConfig(qc);
    }

    static async listBuckets(nick: string, computerUUID: string) {
        const target = await getTarget(nick);
        const c = await target.getComputer(computerUUID);

        const xs = await c.listBuckets();
        console.log(`buckets: ${xs.length}`);
        Logger.log(xs);
    }

    static async listReflogs(nick: string, computerUUID: string, bucketUUID: string) {
        const target = await getTarget(nick);
        const c = await (await target.getComputer(computerUUID));
        const xs = await c.listReflogs(bucketUUID);
        console.log(`reflogs: ${xs.length}`);
        Logger.log(xs);
    }

    static async listCommits(nick: string, computerUUID: string, bucketUUID: string) {
        const target = await getTarget(nick);
        const c = await target.getComputer(computerUUID);

        const xs = await c.listCommits(bucketUUID);
        console.log(`commits: ${xs.length}`);
        Logger.log(xs);
    }

    static async lastCommitID(nick: string, computerUUID: string, bucketUUID: string) {
        const target = await getTarget(nick);
        const c = await target.getComputer(computerUUID);

        const commit = await c.lastCommitID(bucketUUID);
        console.log(`Last commit id: ${commit}`);
    }

    static async showCommit(nick: string, computerUUID: string, bucketUUID: string, commitSha: string) {
        const target = await getTarget(nick);
        const c = await target.getComputer(computerUUID);

        const commit = await c.getCommit(bucketUUID, commitSha);

        Logger.log([commit]);
    }

    static async showTree(nick: string, computerUUID: string, bucketUUID: string, treeSha: string, treeCompressionType: string) {
        const target = await getTarget(nick);
        const c = await target.getComputer(computerUUID);

        const tree = await c.getTree(bucketUUID, treeSha, Number(treeCompressionType));

        Logger.log([tree]);
    }

    static async sync(nick: string) {
        const qc = await readConfig();
        const target = await getTarget(nick);
        await QarqSync.sync(qc, target, ArqCache.CACHE_PATH);
    }

    static async dbInit(nick: string, computerUUID?: string, bucketUUID?: string) {
        let qi: QarqInit | undefined = undefined;
        try {
            const target = await getTarget(nick);
            if (computerUUID) {
                qi = await QarqInit.build(target);
                const c = await target.getComputer(computerUUID);
                if (bucketUUID) {
                    const b = await c.getBucket(bucketUUID);
                    await qi.bucket(c, b);
                }
                else {
                    await qi.computer(c);
                }
            }
            else {
                qi = await QarqInit.build(target, true);
                await qi.all();
            }
        }
        finally {
            if (qi) qi.close();
        }
    }

    static async restoreCommit(commitSha: string) {
        const cmd = Command.restore();
        await cmd.restoreCommit(commitSha);
    }

    static async restoreFile(commitSha: string, filePattern: string) {
        const cmd = Command.restore();
        const xs = await cmd.restoreFile(commitSha, filePattern);
        console.log(xs);
    }

    static async find(file: string) {
        const cmd = Command.find();
        const xs = await cmd.do(file);
        console.log(xs);
    }

    static async diff(commitSha1: string, commitSha2: string) {
        const cmd = Command.diff();
        const xs = await cmd.do(commitSha1, commitSha2);
        console.log(xs);
    }

    static async test() {
        TestRunner.test();
    }
}