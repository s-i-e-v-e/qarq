/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Convert,
    Verify,
    Crypto,
} from "../util/mod.ts";
import {ArqCrypto, ArqDataParser} from "./mod.ts";

export default class ArqEncryptedObject {
    static decrypt(cry: ArqCrypto, path: string, adp: ArqDataParser) {
        adp.verifyHeader("ARQO", path);

        const hmacSha256 = adp.bytes(32);
        const masterIV = adp.bytes(16);
        const encryptedDataIVPlusSessionKey = adp.bytes(16 + 32 + 16); // 16 + 32 + (16:PADDING)
        const cipherText = adp.bytes(); // rest

        // Calculate HMAC-SHA256 of (master IV + "encrypted data IV + session key" + ciphertext) and verify against HMAC-SHA256 in the file using the second "master key" from the Encryption Dat File.
        const hmacPayload = Convert.arrayConcat(masterIV, encryptedDataIVPlusSessionKey, cipherText);
        const hmac = Crypto.computeHMACSHA256(hmacPayload, cry.hmacCreationKey);
        Verify.match(hmacSha256, hmac, path, "HMAC mismatch");

        const decryptedDataIVPlusSessionKey = Crypto.aesDecrypt(encryptedDataIVPlusSessionKey, cry.encryptionKey, masterIV);
        Verify.match(encryptedDataIVPlusSessionKey, Crypto.aesEncrypt(decryptedDataIVPlusSessionKey, cry.encryptionKey, masterIV), path, "CipherText mismatch");

        const dataIV = decryptedDataIVPlusSessionKey.slice(0, 0 + 16);
        const sessionKey = decryptedDataIVPlusSessionKey.slice(16, 16 + 32);
        const decryptedData = Crypto.aesDecrypt(cipherText, sessionKey, dataIV);
        Verify.match(cipherText, Crypto.aesEncrypt(decryptedData, sessionKey, dataIV), path, "CipherText mismatch");
        return decryptedData;
    }

    static decryptText(cry: ArqCrypto, path: string, adp: ArqDataParser) {
        return Convert.toUTF8String(ArqEncryptedObject.decrypt(cry, path, adp));
    }
}