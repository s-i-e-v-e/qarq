/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export default class Check {
    static isArray(x: any) {
        return Array.isArray(x);
    }

    static isWordArray(x: any) {
        return x.hasOwnProperty("words") && x.hasOwnProperty("sigBytes");
    }

    static isString(x: any) {
        return typeof x == "string";
    }

    static mustBeArray(x: any) {
        if (!Check.isArray(x)) throw new Error("expected: Array");
    }

    static mustBeWordArray(x: any) {
        if (!Check.isWordArray(x)) throw new Error("expected: WordArray");
    }
}