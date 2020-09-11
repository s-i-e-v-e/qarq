/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Logger } from "./mod.ts";

export default class Test {
    static assertEquals(a: any, b: any) {
        const xa = a.toString();
        const xb = b.toString();
        const success = xa === xb;
        if (success) {
           Logger.info("Success");
        }
        else {
            Logger.error(xa, xb);
        }
        return success;
    }

    static label(label: string) {
        console.log(`--------------------------    ${label}    --------------------------`);
    }

    static func(label: string) {
        console.log(`====  ${label}  ====`);
    }
}