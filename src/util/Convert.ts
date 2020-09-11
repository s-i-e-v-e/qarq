/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Check, Dictionary, WordArray} from "./mod.ts";
import { CryptoJS } from "./mod.ts";

const HexMap: Dictionary<number> = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    'a': 10,
    'b': 11,
    'c': 12,
    'd': 13,
    'e': 14,
    'f': 15,
};

const Decoder = new TextDecoder("utf-8");
const Encoder = new TextEncoder();

export default class Convert {
    static integerFromFloatString(s: string) {
        return Number(s.substring(0, s.indexOf(".")));
    }

    static hexToHexString(xs: Uint8Array) {
        return Array.from(xs, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    }

    static hexStringToHex(xs: string): number[] {
        const ys = [];
        for (let i = 0; i < xs.length; i += 2) {
            const a = HexMap[xs[i]] * 16;
            const b = HexMap[xs[i + 1]];
            ys.push(a + b);
        }
        return ys;
    }

    static utf8ToU8Array(s: string) {
        return Encoder.encode(s);
    }

    static u8ArrayToUTF8(xs: Uint8Array) {
        return Decoder.decode(xs);
    }

    static toUTF8String(xs: Uint8Array) {
        return Convert.u8ArrayToUTF8(xs);
    }

    static u8ArrayToWord(xs: Uint8Array) {
        let dv = new DataView(xs.buffer);
        if (xs.byteLength % 4 !== 0) throw new Error();

        const ys = [];
        for (let i = 0; i < xs.byteLength; i += 4) {
            ys.push(dv.getUint32(i)); // big endian
        }
        return CryptoJS.lib.WordArray.create(ys);
    }

    static wordToU8Array(wxs: WordArray) {
        Check.mustBeWordArray(wxs);
        const xs = new Uint32Array(wxs.words);
        let dv = new DataView(xs.buffer);
        if (xs.byteLength % 4 !== 0) throw new Error();

        const ys = [];
        for (let i = 0; i < wxs.sigBytes; i += 4) {
            ys.push(dv.getUint8(i+3));
            ys.push(dv.getUint8(i+2));
            ys.push(dv.getUint8(i+1));
            ys.push(dv.getUint8(i+0));
        }
        return new Uint8Array(ys);
    }

    static i32(xs: Uint8Array) {
        if (xs.byteLength !== 4) throw new Error();
        let dv = new DataView(xs.buffer);
        return dv.getInt32(0);
    }

    static epochFromCoreDataTimestamp(n: number) {
        return 978307200+n;
    }

    static date(ms: number) {
        const d = new Date(0);
        d.setUTCMilliseconds(ms);
        return d;
    }

    static objectToString(o: object, n: number) {
        let nn = n ? n : 0;
        let indent = "";
        while(nn > 0) {
            indent += "\t";
            nn -= 1;
        }

        let xx = "";

        Object
            .entries(o)
            .forEach(kv => {
                const k = kv[0];
                const v = kv[1];
                if (typeof v === "object") {
                    xx += `${indent}${k} =\n`;
                    xx += Convert.objectToString(v, n + 1);
                }
                else {
                    xx += `${indent}${k} = ${v}\n`;
                }
            });
        return xx;
    }

    static flatten<T>(...xss: T[][]) {
        const ys: T[] = [];
        for(let i = 0; i < xss.length; i++) {
            const xs = xss[i];
            for(let j = 0; j < xs.length; j++) {
                ys.push(xs[j]);
            }
        }
        return ys;
    }

    static arrayConcat(...xss: Uint8Array[]) {
        const ys: number[] = [];
        for(let i = 0; i < xss.length; i++) {
            const xs = xss[i];
            for(let j = 0; j < xs.length; j++) {
                ys.push(xs[j]);
            }
        }
        return new Uint8Array(ys);
    }

    static mapToArray(m: object) {
        const ys: any[] = [];
        Object.entries(m).forEach(kv => {
            ys.push({k: kv[0], v: kv[1]});
        })
        return ys;
    }
}