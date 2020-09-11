/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Check, Dictionary} from "../util/mod.ts";

export interface QarqTarget {
    readonly nick: string;
    readonly path: string;
    readonly type: string;
}

export class QarqConfiguration {
    constructor(public readonly targets: QarqTarget[], readonly keys: Dictionary<string[]>) {}

    static build(json: string) {
        const o = JSON.parse(json);
        const xs = o["targets"];
        return new QarqConfiguration(xs, o.keys);
    }

    toString() {
        const p = {
            targets: this.targets,
            keys: this.keys,
        };
        return JSON.stringify(p);
    }

    getTarget(nick: String) {
        return this.targets.filter(p => p.nick === nick)[0];
    }
}