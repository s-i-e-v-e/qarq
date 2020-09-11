/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Test,
    CryptoJS, Convert,
} from "../util/mod.ts";

function plainAES() {
    const plainText = "abcdef";
    const password = "secret";
    const cipherText = CryptoJS.AES.encrypt(plainText, password);
    const decipheredText = CryptoJS.AES.decrypt(cipherText, password);
    if (!Test.assertEquals(plainText, decipheredText.toString(CryptoJS.enc.Utf8))) {
        console.log(cipherText);
    }
}

function binaryAES() {
    const plainText = "abcdef";
    const password = "secret";
    const iv = Convert.u8ArrayToWord(new Uint8Array([0xA0, 0x09, 0xC1, 0xA4, 0x85, 0x91, 0x2C, 0x6A, 0xE6, 0x30, 0xD3, 0xE7, 0x44, 0x24, 0x0B, 0x04, 0xA0, 0x09, 0xC1, 0xA4, 0x85, 0x91, 0x2C, 0x6A, 0xE6, 0x30, 0xD3, 0xE7, 0x44, 0x24, 0x0B, 0x04]));

    const cipherText = CryptoJS.AES.encrypt(plainText, password, { iv: iv });
    const decipheredText = CryptoJS.AES.decrypt(cipherText, password, { iv: iv });
    if (!Test.assertEquals(plainText, decipheredText.toString(CryptoJS.enc.Utf8))) {
        console.log(cipherText);
        console.log(decipheredText);
    }
}

function sha1() {
    const a = CryptoJS.SHA1("");
    const b = CryptoJS.SHA1("The quick brown fox jumps over the lazy dog");
    Test.assertEquals(a, "da39a3ee5e6b4b0d3255bfef95601890afd80709");
    Test.assertEquals(b, "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12");
}

export default function CryptoJS_test() {
    Test.label("CryptoJS_test.test()");
    Test.func("plainAES");
    plainAES();
    Test.func("binaryAES");
    binaryAES();
    Test.func("sha1");
    sha1();
}