/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export default class ArqXAttrSet {
    readonly xattr_count: number;
    constructor(count: number) {
        const HEADER = "XAttrSetV002";
        this.xattr_count = count;
    }
}