/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Dictionary} from "../util/mod.ts";
import {Command} from "./mod.ts";

export default class Diff extends Command {
    async do(commitSha1: string, commitSha2: string) {
        interface Commit {
            sha: string;
            treeSha: string;
            creationDate: Date;
        }

        interface Entry {
            parentTreeSha: string;
            path: string;
            name: string;
            size: Date;
            contentSha: string;
            xs: Entry[];
        }

        interface Diff {
            left: string[];
            right: string[];
            modified: Dictionary<string>;
            moved: Dictionary<string>;
        }

        const getCommit = (sha: string) => {
            let c: Commit;
            for (const [commitSha, treeSha, creationDate] of this.exec("select sha, treeSha, creationDate from arq_commit where sha = ?;", [sha])) {
                c = { sha: commitSha, treeSha: treeSha, creationDate: creationDate };
            }
            return c!;
        }

        const getChildren = (treeDB: Dictionary<Entry[]>, parentTreeSha: string, parentName: string) => {
            if (treeDB[parentTreeSha]) {
                console.log("cache hit: "+parentTreeSha);
                return treeDB[parentTreeSha];
            }
            // nodes for this tree
            const nodes = this.exec("select nodeID, fileName, dataSize, contentSha from arq_node where parentTreeSha = ?;", [parentTreeSha]);
            const xs: Entry[] = [];
            for (const [nodeID, fileName, dataSize, contentSha] of nodes) {
                const ys: Entry[] = [];
                const e = {
                    parentTreeSha: parentTreeSha,
                    path: `${parentName}/${fileName}`,
                    name: fileName,
                    size: dataSize,
                    contentSha: contentSha,
                    xs: ys
                };
                for (const [sha] of this.exec("select sha from arq_node_blob_key where parentNodeID = ?;", [nodeID])) {
                    ys.push(...getChildren(treeDB, sha, e.path));
                }
                xs.push(e);
            }
            treeDB[parentTreeSha] = xs;
            return treeDB[parentTreeSha];
        };

        const flatten = (ds: Entry[], ss: Entry[]) => {
            // collect files on this level
            for (const t of ss) {
                if (!t.xs.length) {
                    ds.push(t);
                }
            }

            // recursively flatten folders
            for (const t of ss.filter(x => x.xs.length)) {
                flatten(ds, t.xs);
            }
        }

        const handle = (left: Entry[], right: Entry[], diff: Diff) => {
            for (const lx of left) {
                const as = right.filter(rx => rx.path === lx.path);

                // path is same; content is same
                const ws = as.filter(rx => rx.contentSha === lx.contentSha);
                if (ws.length) {
                    // no change
                }
                else {
                    // path is same; content is not
                    const xs = as.filter(rx => rx.contentSha !== lx.contentSha);
                    if (xs.length) {
                        if (!diff.modified[lx.path]) {
                            diff.modified[lx.path] = xs.map(rx => `${lx.size}|${rx.size}\t ${lx.path}`)[0];
                        }
                    }
                    else {
                        // content is same; path is not
                        const ys = right.filter(rx => rx.contentSha === lx.contentSha && rx.path !== lx.path);
                        if (ys.length) {
                            if (!diff.moved[lx.contentSha]) {
                                diff.moved[lx.contentSha] = ys.map(rx => `${lx.path} => ${rx.path}`)[0];
                            }
                        }
                        else {
                            // content is not; path is not
                            const zs = right.filter(rx => rx.contentSha !== lx.contentSha && rx.path !== lx.path);
                            if (zs.length) {
                                diff.left.push(`${lx.size}\t${lx.path}`);
                            }
                            else {
                                throw new Error();
                            }
                        }
                    }
                }
            }

            for (const rx of right) {
                // content is not; path is not
                const zs = left.filter(lx => rx.path !== lx.path && rx.contentSha !== lx.contentSha);
                if (!zs.length) {
                    diff.right.push(`${rx.size}\t${rx.path}`);
                }
            }
        };

        const getDiff = (t1: Entry[], t2: Entry[]) => {
            const d: Diff = {
                left: [],
                right: [],
                modified: {},
                moved: {},
            }
            handle(t1, t2, d);
            return d;
        };

        console.log("get commits");
        const c1 = getCommit(commitSha1);
        const c2 = getCommit(commitSha2);

        console.log("traverse");
        const treeDB: Dictionary<Entry[]> = {};
        const t1 = getChildren(treeDB, c1.treeSha, ".");
        const t2 = getChildren(treeDB, c2.treeSha, ".");

        console.log("flatten");
        const xs: Entry[] = [];
        const ys: Entry[] = [];
        flatten(xs, t1);
        flatten(ys, t2);

        console.log("get diff");
        return getDiff(xs, ys);
    }
}