/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Diff,
    Find,
    Restore,
    QarqDB,
} from "./mod.ts";

export default abstract class Command {
    constructor(readonly db: QarqDB) {
    }

    static diff() {
        return new Diff(QarqDB.build());
    }

    static find() {
        return new Find(QarqDB.build());
    }

    static restore() {
        return new Restore(QarqDB.build());
    }

    exec(sql: string, params: string[]) {
        const xs: any[] = []
        for (const ys of this.db.query(sql, params)) {
            xs.push(ys);
        }
        return xs;
    }
}