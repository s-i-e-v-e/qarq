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
    CryptoJS, WordArray
} from "./mod.ts";

const AES_PADDING_PKCS7 = CryptoJS.pad.Pkcs7;
const AES_PADDING_NONE = CryptoJS.pad.NoPadding;
const AES_PADDING = AES_PADDING_NONE;

function toWordArray(xs: Uint8Array, noPadding?: boolean) {
    const ys = Array.from(xs).slice();

    let paddingSize;
    if (noPadding) {
        paddingSize = 0;
    }
    else {
        const n = ys.length % 8;
        paddingSize = n ? 8 - (ys.length % 8) : n;
        for (let i = 0; i < paddingSize; i += 1) {
            ys.push(0);
        }
    }

    let dv = new DataView((new Uint8Array(ys)).buffer);

    const zs = [];
    for (let i = 0; i < dv.byteLength; i += 4) {
        zs.push(dv.getUint32(i)); // big endian
    }
    const wd = CryptoJS.lib.WordArray.create(zs);
    wd.sigBytes -= paddingSize;
    return wd;
}

function fromWordArray(wd: WordArray) {
    let dv = new DataView((new Uint32Array(wd.words)).buffer);

    const xs = [];
    for (let i = 0; i < wd.words.length * 4; i += 4) {
        xs.push(dv.getUint8(i+3));
        xs.push(dv.getUint8(i+2));
        xs.push(dv.getUint8(i+1));
        xs.push(dv.getUint8(i+0));
    }
    for (let i = 0; i < wd.words.length * 4 - wd.sigBytes; i += 1) {
        xs.pop();
    }
    return new Uint8Array(xs);
}

function removePKCS7Padding(xs: Uint8Array) {
    const n = xs[xs.length - 1];
    return xs.slice(0, xs.length - n);
}

function addPKCS7Padding(xs: Uint8Array) {
    const ys = Array.from(xs).slice();
    let n = 16 - (xs.length % 16);
    if (n === 0) n = 1;
    for (let i = 0; i < n; i += 1) {
        ys.push(n);
    }
    return new Uint8Array(ys);
}

export default class Crypto {
    /**
     *
     * @param data: Array|Uint8Array| String
     * @param salt: Array|Uint8Array
     * @param keySize: n-bits
     * @param iterations: n > 0
     * @returns Uint8Array
     */
    static computePBKDF2(data: string | Uint8Array, salt: Uint8Array, keySize: number, iterations: number) {
        const d = Check.isString(data) ? data as string : toWordArray(data as Uint8Array, true);
        const x = CryptoJS.PBKDF2(d, toWordArray(salt), {
            keySize: keySize / 32,
            iterations: iterations
        });
        return fromWordArray(x);
    }

    /**
     *
     * @param data: Array|Uint8Array
     * @param key: Array|Uint8Array
     * @returns Uint8Array
     */
    static computeHMACSHA256(data: Uint8Array, key: Uint8Array) {
        return fromWordArray(CryptoJS.HmacSHA256(toWordArray(data), toWordArray(key)));
    }

    /**
     *
     * @param data: Array|Uint8Array
     * @returns String
     */
    static computeSHA1(data: Uint8Array | string) {
        const d = Check.isString(data) ? Convert.utf8ToU8Array(data as string) : data as Uint8Array;
        const xs = fromWordArray(CryptoJS.SHA1(toWordArray(d)));
        return Convert.hexToHexString(xs);
    }

    /**
     *
     * @param data: Array|Uint8Array
     * @param key: Array|Uint8Array
     * @param iv: Array|Uint8Array
     * @returns Uint8Array
     */
    static aesDecrypt(data: Uint8Array, key: Uint8Array, iv: Uint8Array) {
        const x = CryptoJS.AES.decrypt( { ciphertext: toWordArray(data) }, toWordArray(key), { iv: toWordArray(iv), padding: AES_PADDING, mode: CryptoJS.mode.CBC});
        if (x.sigBytes !== data.length) throw new Error();
        return removePKCS7Padding(fromWordArray(x));
    }

    static aesEncrypt(data: Uint8Array, key: Uint8Array, iv: Uint8Array) {
        let d;
        let n;
        if (Check.isString(data)) {
            d = data;
            n = data.length;
        }
        else {
            const dd = addPKCS7Padding(data);
            n = dd.length;
            d = toWordArray(dd);
        }

        const x = CryptoJS.AES.encrypt(d, toWordArray(key), { iv: toWordArray(iv), padding: AES_PADDING, mode: CryptoJS.mode.CBC});
        if (x.ciphertext.sigBytes !== n) throw new Error(`${x.ciphertext.sigBytes} !== ${d}`);
        return fromWordArray(x.ciphertext);
    }
}