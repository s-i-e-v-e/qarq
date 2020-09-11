/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Command} from "./mod.ts";

export default class Find extends Command {
    /*
1. commit <-> tree
2. tree -> nodes
3. if nodes[N]->isTree then nodes[N]->blobs[0].sha == treeSha

4. if nodes[N]->isFile then nodes[N]->blobs point to file parts
 */
    async do(filePattern: string) {
        interface FilePath {
            path: string;
            commitID?: string;
            date?: Date;
        }

        const addParentNodes = (sha: string, paths: FilePath[], p: FilePath) => {
            const xs = this.exec("select parentNodeID from arq_node_blob_key where sha = ?;", [sha]);
            if (xs.length) {
                for (const [parentNodeID] of xs) {
                    const np = {
                        path: p.path
                    }
                    const nodes = this.exec("select parentTreeSha, fileName from arq_node where nodeID = ?;", [parentNodeID]);
                    getNames(nodes, paths, np);
                }
            }
            else {
                const ys = this.exec("select sha, creationDate from arq_commit where treeSha = ?;", [sha]);
                for (const [sha, creationDate] of ys) {
                    const np = {
                        commitID: sha,
                        date: new Date(creationDate),
                        path: p.path ? `./${p.path}` : ".",
                    };
                    paths.push(np);
                }
            }
        };

        const getNames = (nodes: any[], paths: FilePath[], p: FilePath) => {
            // for each node, locate parent
            for (const [parentTreeSha, fileName] of nodes) {
                const np = {
                    path: p.path ? `${fileName}/${p.path}` : fileName,
                };
                addParentNodes(parentTreeSha, paths, np);
            }
        };

        const paths: FilePath[] = [];
        const nodes = this.exec("select parentTreeSha, fileName from arq_node where fileName like ?;", [filePattern]);
        const p = {
            path: "",
        };
        getNames(nodes, paths, p);
        return paths;
    }
}