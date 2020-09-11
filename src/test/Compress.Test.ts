/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Test,
    Compress,
} from "../util/mod.ts";

const xs = new Uint8Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]);
function lz4() {
    const ys = Compress.compress(xs);
    const zs = Compress.decompress(ys);

    console.log(xs);
    console.log(zs);
}

export default function Compress_test() {
    Test.label("Compress_test");
    Test.func("compress");
    lz4();
}