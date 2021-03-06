/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export default class Timer {
    constructor(private readonly start: number) {}

    static build() {
        return new Timer((new Date()).getTime());
    }

    ms() {
        const end = (new Date()).getTime();
        return  end - this.start;
    }
}