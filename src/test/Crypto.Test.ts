/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Test,
    Convert,
    Crypto,
} from "../util/mod.ts";

function PBKDF2() {
    /*
        DK = PBKDF2(PRF, Password, Salt, c, dkLen)

        ---
        PRF: HMAC-SHA1
        Salt: A009C1A485912C6AE630D3E744240B04
        Iterations: 1,000
        Derived key length: 16 bytes

        Password: plnlrtfpijpuhqylxbgqiiyipieyxvfsavzgxbbcfusqkozwpngsyejqlmjsytrmd
        SHA1 (hex): 65426b585154667542717027635463617226672a (using HMAC-SHA1)
        SHA1 (ASCII): eBkXQTfuBqp'cTcar&g* (ascii representation of SHA1 hash)

        "plnlrtfpijpuhqylxbgqiiyipieyxvfsavzgxbbcfusqkozwpngsyejqlmjsytrmd"
        AND
        "eBkXQTfuBqp'cTcar&g*"

        will generate the same key

        Derived Key (hex): 17EB4014C8C461C300E9B61518B9A18B
    */

    const salt = new Uint8Array([0xA0, 0x09, 0xC1, 0xA4, 0x85, 0x91, 0x2C, 0x6A, 0xE6, 0x30, 0xD3, 0xE7, 0x44, 0x24, 0x0B, 0x04]);
    const p1 = "plnlrtfpijpuhqylxbgqiiyipieyxvfsavzgxbbcfusqkozwpngsyejqlmjsytrmd";
    const p2 = "eBkXQTfuBqp'cTcar&g*";
    const k0 = new Uint8Array([0x17, 0xEB, 0x40, 0x14, 0xC8, 0xC4, 0x61, 0xC3, 0x00, 0xE9, 0xB6, 0x15, 0x18, 0xB9, 0xA1, 0x8B]);

    const k1 = Crypto.computePBKDF2(p1, salt, 128, 1000);
    const k2 = Crypto.computePBKDF2(p2, salt, 128, 1000);

    if (Test.assertEquals(k0, k1) && Test.assertEquals(k1, k2)) {
        console.log(Convert.hexToHexString(k0));
    }
}

export default function Crypto_test() {
    Test.label("Crypto.test()");
    Test.func("PBKDF2");
    PBKDF2();
}