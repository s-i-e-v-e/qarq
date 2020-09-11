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
} from "../util/mod.ts";

export default function Convert_test() {
    Test.label("Convert_test()");
    const xs = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
    const w1 = Convert.u8ArrayToWord(xs);
    const ys = Convert.wordToU8Array(w1);
    const w2 = Convert.u8ArrayToWord(ys);
    Test.assertEquals(xs, ys);
    Test.assertEquals(w1, w2);
}