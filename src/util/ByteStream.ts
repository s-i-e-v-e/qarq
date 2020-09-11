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
    IO, Path,
} from "./mod.ts";

function asNumber(n: BigInt) {
    const JS_INT_MAX = (2n ** 53n) - 1n;
    if (n > JS_INT_MAX) throw new Error("number too big");
    return Number(n);
}

export default class ByteStream {
    readonly dv: DataView;
    private index: number;
    readonly length: number;

    constructor(xs: Uint8Array) {
        this.dv = new DataView(xs.buffer);
        this.index = 0;
        this.length = this.dv.byteLength;
    }

    currentIndex() {
        return this.index;
    }

    bool() {
        return this.u8();
    }

    u8() {
        const x = this.dv.getUint8(this.index);
        this.index += 1;
        return x;
    }

    u32() {
        const x = this.dv.getUint32(this.index);
        this.index += 4;
        return x;
    }

    i32() {
        const x = this.dv.getInt32(this.index);
        this.index += 4;
        return x;
    }

    i64() {
        const x = this.dv.getBigInt64(this.index);
        this.index += 8;
        return asNumber(x);
    }

    u64() {
        const x = this.dv.getBigUint64(this.index);
        this.index += 8;
        return asNumber(x);
    }

    string(n: number) {
        const x = Convert.u8ArrayToUTF8(new Uint8Array(this.dv.buffer.slice(this.index, this.index + n)));
        this.index += n;
        return x;
    }

    bytes(n?: number) {
        if (n) {
            const x = new Uint8Array(this.dv.buffer.slice(this.index, this.index + n));
            this.index += n;
            return x;
        }
        else {
            const xs = new Uint8Array(this.dv.buffer.slice(this.index));
            this.index = this.dv.buffer.byteLength;
            return xs;
        }
    }

    pastBytes() {
        return new Uint8Array(this.dv.buffer.slice(0, this.index));
    }

    eof() {
        return this.dv.buffer.byteLength === this.index;
    }

    debugString() {
        return Convert.hexToHexString(new Uint8Array(this.dv.buffer.slice(0, this.dv.buffer.byteLength)));
    }

    static build(xs: Uint8Array) {
        return new ByteStream(xs);
    }

    static from(xs: Uint8Array) {
        return ByteStream.build(xs);
    }
}