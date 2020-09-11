/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    compress,
    decompress
} from "https://deno.land/x/lz4/mod.ts";

export default class Compress {
    static compress(xs: Uint8Array) {
        return compress(xs);
    }

    static decompress(xs: Uint8Array) {
        return decompress(xs);
    }
}