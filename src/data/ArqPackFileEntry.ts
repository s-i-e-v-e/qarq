/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ArqDataParser } from "./mod.ts";

export default class ArqPackFileEntry {
    readonly mime: string;
    readonly name: string;
    readonly data: Uint8Array;
    readonly offset: number;

    constructor(adp: ArqDataParser, offset: number) {
        this.mime = adp.string();
        this.name = adp.string();
        this.data = adp.data();
        this.offset = offset;
    }

    static build(adp: ArqDataParser, offset: number) {
        return new ArqPackFileEntry(adp, offset);
    }
}