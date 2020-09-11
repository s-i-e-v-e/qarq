/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    IO,
    Dictionary,
} from "../util/mod.ts";
import {ArqCache, ArqComputer} from "./mod.ts";

export default class ArqTarget {
    readonly io: IO;
    constructor(
        readonly nick: string,
        readonly type: string,
        readonly path: string,
        readonly keys: Dictionary<string[]>) {
        this.io = type === "sftp" ? IO.build(nick, ArqCache.CACHE_PATH) : IO.build();
    }

    static build(nick: string, type: string, path: string, keys: Dictionary<string[]>) {
        return new ArqTarget(nick, type, path, keys);
    }

    async listComputers() {
        const xs = this.io.listFolders(this.io.createPath(this.path))
            .filter(y => y.name !== "temp");

        const ys:ArqComputer[] = [];
        for (let i = 0; i < xs.length; i += 1) {
            const pi = xs[i];
            ys.push(await ArqComputer.build(this.io, this.keys[pi.name] || [], pi));
        }
        return ys;
    }

    async getComputer(computerUUID: string) {
        const xs = await this.listComputers();
        for (let i = 0; i < xs.length; i += 1) {
            const x = await xs[i];
            if (x.uuid === computerUUID) return x;
        }
        throw new Error(`No computer found for uuid: ${computerUUID}`);
    }
}