/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Convert_test from "./Convert.Test.ts";
import CryptoJS_test from "./CryptoJS.Test.ts";
import Crypto_test from "./Crypto.Test.ts";
import Compress_test from "./Compress.Test.ts";

export class TestRunner {
    static test() {
        Convert_test();
        CryptoJS_test();
        Crypto_test();
        Compress_test();
    }
}