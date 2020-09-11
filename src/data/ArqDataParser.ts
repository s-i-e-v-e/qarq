/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Convert,
    ByteStream,
    Verify
} from "../util/mod.ts";

const CompressionTypes = [
    "none",
    "gzip",
    "lz4",
];

export default class ArqDataParser {
    constructor(readonly bs: ByteStream, readonly length: number) {
        this.bs = bs;
        this.length = this.bs.length;
    }

    static build(xs: Uint8Array) {
        const bs = ByteStream.from(xs);
        return new ArqDataParser(bs, bs.length);
    }

    currentIndex() {
        return this.bs.currentIndex();
    }

    pastBytes() {
        return this.bs.pastBytes();
    }

    mustBeOEF() {
        if (!this.bs.eof()) throw new Error(`Bytes left: ${this.bs.length - this.bs.currentIndex()}`);
    }

    verifyU32(padding: number, path: string, msg: string) {
        Verify.match(padding, this.u32(), path, msg);
    }

    verifySha(computedHash: string, path: string) {
        const sha1 = this.sha1();
        Verify.match(sha1, computedHash, path, "SHA1 mismatch");
    }

    verifyHeader(header: string, path: string) {
        Verify.match(header, this.bs.string(header.length), path, "Header mismatch");
    }

    bool() {
        return this.u8() === 1;
    }

    u8() {
        return this.bs.u8();
    }

    u32() {
        return this.bs.u32();
    }

    i32() {
        return this.bs.i32();
    }

    i64() {
        return this.bs.i64();
    }

    u64() {
        return this.bs.u64();
    }

    static compressionTypeToString(i: number) {
        return CompressionTypes[i]; // 0 = none, 1 = gzip, 2 = lz4
    }

    compressionType() {
        return this.i32(); // 0 = none, 1 = gzip, 2 = lz4
    }

    dataString() {
        const n = this.i64();
        return this.bs.string(n);
    }

    string() {
        if (this.u8()) {
            const n = this.i64();
            return this.bs.string(n);
        }
        else {
            return "";
        }
    }

    date() {
        if (this.u8()) {
            const n = this.u64();
            return Number(n);
        }
        else {
            return undefined;
        }
    }

    bytes(n?: number) {
        return this.bs.bytes(n);
    }

    data() {
        const n = this.i64();
        return this.bs.bytes(n);
    }

    sha1() {
        return Convert.hexToHexString(this.bs.bytes(20));
    }
}