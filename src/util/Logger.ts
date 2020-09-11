/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export default class Logger {
    static error(...msg: any[]) {
        console.log('\x1b[31m%s\x1b[0m', ...msg);
    }

    static info(...msg: any[]) {
        console.log('\x1b[32m%s\x1b[0m', ...msg);
    }

    static log(xs: any[]) {
        xs.forEach(async x => {
            console.group();
            console.log(x.toString());
            console.groupEnd();
        });
    }

    static logObjects(xs: any[]) {
        xs.forEach(async x => {
            console.group();
            console.log(x);
            console.groupEnd();
        });
    }
}