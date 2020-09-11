/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    ArqComputer,
    ArqCommit,
    ArqTree,
    ArqTreeNode
} from "../data/mod.ts";

interface Entry {
    path: string,
    blobCount : number,
    size : number,
}

const dumpFile = async (q: Q, n: ArqTreeNode, path: string) => {
    q.xs.push({
        path: `${path}/${n.fileName}`,
        blobCount: n.dataBlobKeys.length,
        size: n.dataSize
    });
}

const dumpFolder = async (q: Q, n: ArqTreeNode, path: string) => {
    const fp = `${path}/${n.fileName}`;
    if (n.dataBlobKeys.length > 1) throw new Error();
    const b = n.dataBlobKeys[0];

    const tree = await q.c.getTree(q.folderUUID, b.sha1, n.dataCompressionType);
    await dumpTree(q, tree, fp);
}

const dumpTree = async (q: Q, t: ArqTree, path: string) => {
    if (t.missingNodes.length) throw new Error();

    for (let i = 0; i < t.nodes.length; i += 1) {
        const n = t.nodes[i];
        if (n.isTree) {
            await dumpFolder(q, n, path);
        }
        else {
            await dumpFile(q, n, path);
        }
    }
}

interface Q {
    xs: Entry[],
    c: ArqComputer,
    folderUUID: string,
}

export default class ArqRestore {
    static async restoreCommit(c: ArqComputer, folderUUID: string, commit: ArqCommit) {
        const q: Q = {
            xs: [],
            c: c,
            folderUUID: folderUUID,
        };
        const tree = await c.getTree(folderUUID, commit.treeSha, commit.treeCompressionType);
        await dumpTree(q, tree, commit.file);
        q.xs.forEach(x => console.log(`${x.size}\t${x.blobCount}\t${x.path}`));
    }
}