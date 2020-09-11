/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {ArqDataParser} from "./mod.ts";

export default class ArqPackIndexEntry {
    readonly offset: number;
    readonly dataSize: number;
    readonly sha1: string;

    constructor(adp: ArqDataParser) {
        this.offset = adp.i64();
        this.dataSize = adp.i64();
        this.sha1 = adp.sha1();
        adp.verifyU32(0x00000000, "<ArqPackIndexEntry>", "Expected zero byte padding");
    }

    static build(adp: ArqDataParser) {
        return new ArqPackIndexEntry(adp);
    }
}