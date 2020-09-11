/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export default class Run {
    static async run(cmd: string[]) {
        const p = Deno.run(
            {
                cmd: cmd,
                stdout: "piped",
            }
        );

        let r: string | undefined;
        if (p) {
            let decoder = new TextDecoder();
            r = decoder.decode(await p.output());
        }
        else {
            r = undefined;
        }

        let status = await p.status();
        p.close();

        return {
            response: r,
            status: status
        };
    }
}