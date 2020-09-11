/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Check,
    Logger
} from "./mod.ts";

export default class Verify {
    static match(a: any, b: any, path: string, failMessage: string, successMessage?: string) {
        const xa = Check.isString(a) ? a : a.toString();
        const xb = Check.isString(b) ? b : b.toString();
        if (xa !== xb) {
            const m = `${failMessage} [${xa} !== ${xb}] (${path})`;
            Logger.error(m);
            throw new Error(m);
        }
        if (successMessage) Logger.info(successMessage);
    }
}