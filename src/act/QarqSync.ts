/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {IO, Path, Run} from "../util/mod.ts";
import {ArqBucket, ArqComputer, ArqTarget} from "../data/mod.ts"
import {QarqDB, QarqConfiguration} from "./mod.ts"

export default class QarqSync {
    static async sync(qc: QarqConfiguration, target: ArqTarget, cachePath: string) {
        if (target.type !== "sftp") throw new Error();
        console.log(`syncing: ${target.path}`);
        const r = target.io.parseRemotePath(target.path);

        const cacheTargetPath = target.io.createPath(`${cachePath}/${target.nick}${r.path}`);
        if (target.io.exists(cacheTargetPath)) {
            await this.downloadAll(target.io, r.remote, r.port, r.path, cacheTargetPath, true);
        }
        else {
            await this.downloadAll(target.io, r.remote, r.port, r.path, cacheTargetPath);
        }
    }

    static async downloadAll(io: IO, remote: string, port: string, path: string, cacheTargetPath: Path, isSync?: boolean) {
        // first locate folders
        const rc = `find ${path}/ -type d -maxdepth 1`;
        const computers = (await this.listPaths(io, remote, port, rc)).filter(c => c.name !== "temp" && c.name !== "");

        // for each folder, list folders to be downloaded
        for (let i = 0; i < computers.length; i++) {
            const c = computers[i];
            const f1 = `${path}/${c.name}/computerinfo`;
            const f2 = `${path}/${c.name}/encryptionv3.dat`;
            const d1 = `${path}/${c.name}/bucketdata/`;
            const d2 = `${path}/${c.name}/buckets/`;
            const d3 = `${path}/${c.name}/packsets/`;

            const xp = `${cacheTargetPath.fsPath}/${c.name}/`
            if (!isSync) {
                Deno.mkdir(xp, {recursive: true});
                console.log(`created: ${xp}`);
            }
            console.log(`copying ${f1}`);
            await this.copyPaths(remote, port, f1, xp);
            console.log(`copying ${f2}`);
            await this.copyPaths(remote, port, f2, xp);
            console.log(`copying ${d1}`);
            await this.copyPaths(remote, port, d1, xp);
            console.log(`copying ${d2}`);
            await this.copyPaths(remote, port, d2, xp);
            console.log(`copying ${d3}`);
            await this.copyPaths(remote, port, d3, xp);
        }
    }

    private static async listPaths(io: IO, remote: string, port: string, remoteCommand: string) {
        // console.log(`ssh -p ${port} ${remote} ${remoteCommand}`);
        const x = await Run.run(["ssh", "-p", port, remote, remoteCommand]);
        if (x.status.code !== 0) throw new Error(`ssh command failed: ${x.status.code}`);

        let xs = x.response!.split("\n");
        xs.pop();
        return xs.map(y => io.createPath(`${remote}:${port}${y}`));
    }

    private static async copyPaths(remote: string, port: string, path: string, localPath: string) {
        // console.log(`scp -r -p -P ${port} ${remote}:${path} ${localPath}`);
        const x = await Run.run(["scp", "-r", "-p", "-P", port, `${remote}:${path}`, localPath]);
        if (x.status.code !== 0) throw new Error(`scp command failed: ${x.status.code}`);
    }
}