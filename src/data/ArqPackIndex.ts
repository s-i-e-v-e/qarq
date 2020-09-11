/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Crypto,
} from "../util/mod.ts";
import {
    ArqPackIndexEntry,
    ArqDataParser,
    ArqCache, ArqComputer,
} from "./mod.ts";

export default class ArqPackIndex {
    readonly counts: number[];
    readonly objects: ArqPackIndexEntry[];

    constructor(readonly uuid: string, readonly path: string, adp: ArqDataParser) {
        this.path = path;
        this.uuid = uuid;

        adp.verifyU32(0xff744f63, this.path, "Header mismatch");
        adp.verifyU32(0x00000002, this.path, "Expected Index Version: 2");

        this.counts = [];
        for (let i = 0; i < 256; i += 1) {
            this.counts.push(adp.i32());
        }
        this.objects = [];
        for (let i = 0; i < this.counts[255]; i += 1) {
            this.objects.push(ArqPackIndexEntry.build(adp));
        }
        const bytesToHash = adp.pastBytes();
        const computedHash = Crypto.computeSHA1(bytesToHash);
        adp.verifySha(computedHash, this.path);
        adp.mustBeOEF();
    }

    static async list(c: ArqComputer, folderUUID: string) {
        const pi = c.io.createPath(`${c.path}/packsets`, `${folderUUID}-trees`);
        const xs = (await c.io.listFiles(pi))
            .filter(y => y.name.endsWith(".index"));

        const ys = [];
        for (let i = 0; i < xs.length; i += 1) {
            const y = xs[i];
            ys.push(ArqPackIndex.build(y.name.split(".")[0], y.path, await ArqCache.getDataParser(c.io, y)));
        }
        return ys;
    }

    static build(uuid: string, path: string, adp: ArqDataParser) {
        return new ArqPackIndex(uuid, path, adp);
    }
}