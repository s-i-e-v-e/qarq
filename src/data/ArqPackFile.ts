/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Verify,
    Crypto,
} from "../util/mod.ts";

import {
    ArqPackFileEntry,
    ArqDataParser,
    ArqCache, ArqComputer,
} from "./mod.ts";

export default class ArqPackFile {
    readonly objects: ArqPackFileEntry[];

    constructor(readonly path: string, readonly uuid: string, adp: ArqDataParser) {
        this.path = path;
        this.uuid = uuid;

        adp.verifyHeader("PACK", this.path);
        adp.verifyU32(0x00000002, this.path, "Expected Pack Version: 2");
        const count = adp.i64();
        this.objects = [];
        for (let i = 0n; i < count; i += 1n) {
            const offset = adp.currentIndex();
            const e = ArqPackFileEntry.build(adp, offset);
            this.objects.push(e);
        }
        const bytesToHash = adp.pastBytes();
        const computedHash = Crypto.computeSHA1(bytesToHash);
        adp.verifySha(computedHash, this.path);
        adp.mustBeOEF();
    }

    static async build(c: ArqComputer, folderUUID: string, uuid: string) {
        const y = c.io.createPath(`${c.path}/packsets/${folderUUID}-trees`, `${uuid}.pack`);
        return new ArqPackFile(y.path, uuid, await ArqCache.getDataParser(c.io, y));
    }
}