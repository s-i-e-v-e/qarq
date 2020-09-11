/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    PlistParser,
    Convert,
    Path,
    Dictionary
} from "../util/mod.ts";
import {
    ArqCache, ArqComputer
} from "./mod.ts";

export default class ArqReflog {
    readonly timestamp: number;
    readonly date: string;
    readonly oldHeadSHA1: string;
    readonly oldHeadStretchKey: boolean;
    readonly newHeadSHA1: string;
    readonly newHeadStretchKey: boolean;
    readonly isRewrite: boolean;

    constructor(
        readonly name: string,
        readonly path: string,
        readonly tmp: Dictionary<any>
        ) {
        this.name = name;
        this.path = path;
        this.timestamp = Convert.epochFromCoreDataTimestamp(Convert.integerFromFloatString(name));
        this.date = Convert.date(this.timestamp*1000).toISOString();

        this.oldHeadSHA1 = tmp["oldHeadSHA1"];
        this.oldHeadStretchKey = tmp["oldHeadStretchKey"] === "1";
        this.newHeadSHA1 = tmp["newHeadSHA1"];
        this.newHeadStretchKey = tmp["newHeadStretchKey"] === "1";
        this.isRewrite = tmp["isRewrite"] === "1";
    }

    static async build(c: ArqComputer, pi: Path) {
        const xml = await ArqCache.getTextFile(c.io, pi);
        return new ArqReflog(pi.name, pi.path, PlistParser.parse(xml));
    }

    toString() {
        return `source: ${this.path}\n`+Convert.objectToString(this, 1);
    }
}