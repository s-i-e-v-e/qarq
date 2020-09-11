/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Convert,
    PlistParser,
    Dictionary,
    Path,
} from "../util/mod.ts";
import {
    ArqEncryptedObject,
    ArqCache,
    ArqComputer,
    ArqDataParser,
} from "./mod.ts";

export default class ArqBucket {
    readonly computerUUID: string;
    readonly endpoint: string;
    readonly bucketName: string;
    readonly localPath: string;
    readonly localMountPoint: string;
    readonly storageType: number;

    constructor(c: ArqComputer, readonly uuid: string, readonly path: string, tmp: Dictionary<any>) {
        this.computerUUID = tmp["ComputerUUID"];
        this.endpoint = tmp["Endpoint"];
        this.bucketName = tmp["BucketName"];
        this.localPath = tmp["LocalPath"];
        this.localMountPoint = tmp["LocalMountPoint"];
        this.storageType = Number(tmp["StorageType"]);
    }

    static async build(c: ArqComputer, pi: Path) {
        const adp = await ArqCache.getDataParser(c.io, pi);
        adp.verifyHeader("encrypted", pi.path);
        const tmp: Dictionary<any> = PlistParser.parse(ArqEncryptedObject.decryptText(c.cry, pi.path, adp));
        return new ArqBucket(c, pi.name, pi.path, tmp);
    }

    toString() {
        return Convert.objectToString(this, 1);
    }
}