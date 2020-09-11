/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    ArqDataParser,
    ArqCache,
    ArqTreeNode,
    ArqDataBlobKey,
    ArqComputer,
} from "./mod.ts";

export default class ArqTree {
    readonly treeSha: string;
    readonly xattrsCompressionType: number;
    readonly aclCompressionType: number;
    readonly xattrsBlobKey: ArqDataBlobKey;
    readonly xattrsSize: number;
    readonly aclBlobKey: ArqDataBlobKey;
    readonly uid: number;
    readonly gid: number;
    readonly mode: number;
    readonly mtime_sec: number;
    readonly mtime_nsec: number;
    readonly flags: number;
    readonly finderFlags: number;
    readonly extendedFinderFlags: number;

    readonly st_dev: number;
    readonly st_ino: number;
    readonly st_nlink: number;
    readonly st_rdev: number;

    readonly ctime_sec: number;
    readonly ctime_nsec: number;

    readonly st_blocks: number;
    readonly st_blksize: number;

    readonly create_time_sec: number;
    readonly create_time_nsec: number;

    readonly missingNodes: string[];
    readonly nodes: ArqTreeNode[];

    constructor(treeSha: string, adp: ArqDataParser) {
        this.treeSha = treeSha;
        adp.verifyHeader("TreeV022", "<tree>");

        this.xattrsCompressionType = adp.compressionType();
        this.aclCompressionType = adp.compressionType();
        
        this.xattrsBlobKey = ArqDataBlobKey.build(adp);
        this.xattrsSize = adp.i64();
        this.aclBlobKey = ArqDataBlobKey.build(adp);

        this.uid = adp.i32();
        this.gid = adp.i32();
        this.mode = adp.i32();

        this.mtime_sec = adp.i64();
        this.mtime_nsec = adp.i64();

        this.flags = adp.i64();
        this.finderFlags = adp.i32();
        this.extendedFinderFlags = adp.i32();

        this.st_dev = adp.i32();
        this.st_ino = adp.i32();
        this.st_nlink = adp.u32();
        this.st_rdev = adp.i32();

        this.ctime_sec = adp.i64();
        this.ctime_nsec = adp.i64();

        this.st_blocks = adp.i64();
        this.st_blksize = adp.u32();

        this.create_time_sec = adp.i64();
        this.create_time_nsec = adp.i64();

        const missing_node_count = adp.u32();
        this.missingNodes = [];
        for (let i = 0; i < missing_node_count; i += 1) {
            this.missingNodes.push(adp.string());
        }

        const node_count = adp.u32();
        this.nodes = [];
        for (let i = 0; i < node_count; i += 1) {
            this.nodes.push(ArqTreeNode.build(adp));
        }
        adp.mustBeOEF();
    }

    static async build(c: ArqComputer, folderUUID: string, treeSha: string, treeCompressionType: number) {
        const adp = await ArqCache.getTreeObject(c, folderUUID, treeSha, treeCompressionType);
        return new ArqTree(treeSha, adp);
    }

    toString() {
        let xx = [];
        xx.push(`xattrsCompressionType: ${this.xattrsCompressionType}`);
        xx.push(`aclCompressionType: ${this.aclCompressionType}`);
        xx.push(`xattrsBlobKey: ${this.xattrsBlobKey.toString("\n\t\t\t")}`);
        xx.push(`xattrsSize: ${this.xattrsSize}`);
        xx.push(`aclBlobKey: ${this.aclBlobKey.toString("\n\t\t\t")}`);
        xx.push(`uid: ${this.uid}`);
        xx.push(`gid: ${this.gid}`);
        xx.push(`mode: ${this.mode}`);
        xx.push(`mtime_sec: ${this.mtime_sec}`);
        xx.push(`mtime_nsec: ${this.mtime_nsec}`);
        xx.push(`flags: ${this.flags}`);
        xx.push(`finderFlags: ${this.finderFlags}`);
        xx.push(`extendedFinderFlags: ${this.extendedFinderFlags}`);
        xx.push(`st_dev: ${this.st_dev}`);
        xx.push(`st_ino: ${this.st_ino}`);
        xx.push(`st_nlink: ${this.st_nlink}`);
        xx.push(`st_rdev: ${this.st_rdev}`);
        xx.push(`ctime_sec: ${this.ctime_sec}`);
        xx.push(`ctime_nsec: ${this.ctime_nsec}`);
        xx.push(`st_blocks: ${this.st_blocks}`);
        xx.push(`st_blksize: ${this.st_blksize}`);
        xx.push(`create_time_sec: ${this.create_time_sec}`);
        xx.push(`create_time_nsec: ${this.create_time_nsec}`);
        xx.push(`missing_node_count: ${this.missingNodes.length}`);
        for (let i = 0; i < this.missingNodes.length; i += 1) {
            xx.push(`\tmissing_node_${i}: ${this.missingNodes[i]}`);
        }
        xx.push(`node_count: ${this.nodes.length}`);
        for (let i = 0; i < this.nodes.length; i += 1) {
            xx.push(`\tnode_${i}: ${this.nodes[i]}`);
        }

        return `\n\t\ttreeSha: ${this.treeSha}\n\t\t`+xx.join("\n\t\t").trim();
    }
}