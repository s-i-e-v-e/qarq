/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Check,
    Convert,
    Verify,
    Crypto,
    IO,
} from "../util/mod.ts";
import {
    ArqCache, ArqDataParser
} from "./mod.ts";

function readKeys(passphrase: string, adp: ArqDataParser) {
    const salt = adp.bytes(8);
    const hmacSha256 = adp.bytes(32);
    const iv = adp.bytes(16);
    const mk = adp.bytes(32 + 32 + 32);
    const pad = adp.bytes(16);
    const ivmkp = Convert.arrayConcat(iv, mk, pad);
    const mkp = Convert.arrayConcat(mk, pad);

    const key = Crypto.computePBKDF2(passphrase, salt, 512, 200000);
    const k1 = key.slice(0, 32);
    const k2 = key.slice(32, 64);

    Verify.match(hmacSha256, Crypto.computeHMACSHA256(ivmkp, k2), "<ArqCrypto::readKeys>", "HMAC mismatch");

    const threeKeys = Crypto.aesDecrypt(mkp, k1, iv);
    Verify.match(mkp, Crypto.aesEncrypt(threeKeys, k1, iv), "<ArqCrypto::readKeys>", "CipherText mismatch");

    const xs = [];
    xs.push(threeKeys.slice(0, 32));
    xs.push(threeKeys.slice(32, 64));
    xs.push(threeKeys.slice(64, 96));
    return xs;
}

export default class ArqCrypto {
    readonly pass: string;
    readonly encryptionKey: Uint8Array;
    readonly hmacCreationKey: Uint8Array;
    readonly sha1ComputationKey: Uint8Array;

    constructor(keys: string[], adp: ArqDataParser) {
        adp.verifyHeader("ENCRYPTIONV2", "encryptionv3.dat");

        this.pass = keys[0] || "";
        let xs;
        if (keys.length === 1) {
            xs = this.pass ? readKeys(this.pass, adp) : [[0], [0], [0]];
        }
        else {
            xs = keys.slice(1).map(x => Convert.hexStringToHex(x));
        }
        this.encryptionKey = new Uint8Array(xs[0]);
        this.hmacCreationKey = new Uint8Array(xs[1]);
        this.sha1ComputationKey = new Uint8Array(xs[2]);
    }

    static async build(io: IO, keys: string[], path: string) {
        const adp = await ArqCache.getDataParser(io, io.createPath(path, "encryptionv3.dat"));
        return new ArqCrypto(keys, adp);
    }
}