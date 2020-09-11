/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { createHash } from "https://deno.land/std/hash/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

interface Data {
    c1: number;
    c2: string;
    c3: string;
    c4: string;
    c5: string;
    c6: string;
    c7: number;
    c8: string;
}

const MAX = 200000;
const STEP = MAX / 20;
class Stress {
    static dump(xs: Data[]) {
        const db = new DB(":memory:");
        // const db = new DB("test.db");
        db.query("CREATE TABLE IF NOT EXISTS nos (c1 INTEGER, c2 TEXT, c3 TEXT, c4 TEXT, c5 TEXT, c6 TEXT, c7 INTEGER, c8 TEXT UNIQUE);");

        db.query("begin;")
        for (let i = 0; i < xs.length; i++) {
            const n = i + 1;
            const commit = n % STEP === 0;
            const x = xs[i];
            db.query("INSERT OR IGNORE INTO nos(c1, c2, c3, c4, c5, c6, c7, c8) VALUES(?, ?, ?, ?, ?, ?, ?, ?)", [x.c1, x.c2, x.c3, x.c4, x.c5, x.c6, x.c7, x.c8]);
            if (commit) {
                db.query("commit;")
                db.query("begin;")
                console.log(`db:progress: ${n}/${xs.length}`);
            }
        }
        db.query("commit;")
        db.query("VACUUM INTO 'test.db'");
        db.close();
    }

    static run() {
        // build 200,000 x 8 table

        const xs: Data[]  = [];
        for (let i = 1; i < MAX+1; i++) {
            if (i % STEP === 0) console.log(`gen:progress: ${i}/${MAX}`);
            const a = i * 15000;
            const b = a  % 37;
            const c = a * b / 41;
            const d = c + a;
            const e = (new Date()).getTime() + b - a;
            const f = b - a;
            const g = a + e;

            const hash = createHash("sha1");
            hash.update(`${a}${b}{c}{d}{e}{f}{g}`);
            const h = hash.toString();

            xs.push({
                c1: a,
                c2: `${b}`,
                c3: `${c}`,
                c4: `${d}`,
                c5: `${e}`,
                c6: `${f}`,
                c7: g,
                c8: h,
            });
        }
        this.dump(xs);
    }
}

Stress.run();

