/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {ArqDataParser} from "./mod.ts";

export default class ArqDataBlobKey {
    readonly sha1: string;
    readonly isEncryptionKeyStretched: boolean;
    readonly storageType: number;
    readonly archiveID: string;
    readonly archiveSize: number;
    readonly archiveUploadDate?: number;

    constructor(adp: ArqDataParser) {
        this.sha1 = adp.string();
        this.isEncryptionKeyStretched = adp.bool();
        this.storageType = adp.u32(); // 1 = S3, 2 = Glacier
        this.archiveID = adp.string();
        this.archiveSize = adp.u64();
        this.archiveUploadDate = adp.date();
    }

    static build(adp: ArqDataParser) {
        return new ArqDataBlobKey(adp);
    }

    toString(indent: string) {
        let xx = [];
        xx.push(`isEncryptionKeyStretched: ${this.isEncryptionKeyStretched}`);
        xx.push(`storageType: ${this.storageType}`);

        xx.push(`archiveID: ${this.archiveID}`);
        xx.push(`archiveSize: ${this.archiveSize}`);
        xx.push(`archiveUploadDate: ${this.archiveUploadDate}`);

        return `${indent}sha1: ${this.sha1}${indent}`+xx.join(indent).trim();
    }
}