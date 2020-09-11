/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Dictionary,
    IO,
    Path,
    PlistParser,
} from "../util/mod.ts";
import {
    ArqBucket,
    ArqCrypto,
    ArqReflog,
    ArqCommit,
    ArqCache,
    ArqTree,
    ArqTarget,
} from "./mod.ts";

export default class ArqComputer {
    constructor(
        readonly io: IO,
        readonly uuid: string,
        readonly path: string,
        readonly computerName: string,
        readonly userName: string,
        readonly cry: ArqCrypto,
    ) {
        this.uuid = uuid;
        this.path = path;
        this.io = io;
    }

    static async build(io: IO, keys: string[], pi: Path) {
        const tmp: Dictionary<any> = PlistParser.parse(await ArqCache.getTextFile(io, io.createPath(pi.path, "computerinfo")));
        const cry = await ArqCrypto.build(io, keys, pi.path);
        return new ArqComputer(io, pi.name, pi.path, tmp["computerName"], tmp["userName"], cry);
    }

    toString() {
        return `source: ${this.path}\n\tuuid: ${this.uuid}\n\tcomputer: ${this.computerName}\n\tuser: ${this.userName}`;
    }

    async listBuckets() {
        const pi = this.io.createPath(this.path, "buckets");
        const xs = await this.io.listFiles(pi);

        const ys: ArqBucket[] = [];
        for (let i = 0; i < xs.length; i += 1) {
            const y = await xs[i];
            ys.push(await ArqBucket.build(this, this.io.createPath(pi.path, y.name)));
        }
        return ys;
    }

    async listReflogs(folderUUID: string) {
        const pi = this.io.createPath(`${this.path}/bucketdata/${folderUUID}/refs/logs`, "master");
        const xs = await this.io.listFiles(pi);

        const ys = [];
        for (let i = 0; i < xs.length; i += 1) {
            const y = await xs[i];
            ys.push(await ArqReflog.build(this, this.io.createPath(pi.path, y.name)));
        }
        return ys.sort((a, b) => a.timestamp - b.timestamp);
    }

    async listCommits(folderUUID: string) {
        let commitSha: string | undefined = await this.lastCommitID(folderUUID);
        const xs = [];
        while (commitSha) {
            const commit: ArqCommit = await this.getCommit(folderUUID, commitSha);
            commitSha = commit.parentCommitSha;
            xs.push(commit);
        }
        return xs;
    }

    async lastCommitID(folderUUID: string) {
        const pi = this.io.createPath(`${this.path}/bucketdata/${folderUUID}/refs/heads`, "master");
        let lastSHA = await ArqCache.getTextFile(this.io, pi);
        lastSHA = lastSHA.substring(0, lastSHA.length - 1);
        return lastSHA;
    }

    async getCommit(folderUUID: string, commitSha: string) {
        return await ArqCommit.build(this, folderUUID, commitSha);
    }

    async getTree(folderUUID: string, treeSha: string, treeCompressionType: number) {
        return await ArqTree.build(this, folderUUID, treeSha, treeCompressionType);
    }

    async getBucket(bucketUUID: string) {
        const pi = this.io.createPath(this.path, "buckets");
        return ArqBucket.build(this, this.io.createPath(pi.path, bucketUUID));
    }
}