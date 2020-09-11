/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    ArqDataBlobKey, ArqDataParser,
} from "./mod.ts";

export default class ArqTreeNode {
    readonly fileName: string;
    readonly isTree: boolean;
    readonly treeContainsMissingItems: boolean;

    readonly dataCompressionType: number;
    readonly xattrsCompressionType: number;
    readonly aclCompressionType: number;

    readonly dataBlobKeys: ArqDataBlobKey[];
    readonly dataSize: number;

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
    readonly finderFileType: string;
    readonly finderFileCreator: string;
    readonly isFileExtensionHidden: boolean;

    readonly st_dev: number;
    readonly st_ino: number;
    readonly st_nlink: number;
    readonly st_rdev: number;

    readonly ctime_sec: number;
    readonly ctime_nsec: number;
    readonly create_time_sec: number;
    readonly create_time_nsec: number;

    readonly st_blocks: number;
    readonly st_blksize: number;

    constructor(adp: ArqDataParser) {
        this.fileName = adp.string();
        this.isTree = adp.bool();
        this.treeContainsMissingItems = adp.bool();

        this.dataCompressionType = adp.compressionType();
        this.xattrsCompressionType = adp.compressionType();
        this.aclCompressionType = adp.compressionType();

        const dataBlobKeysCount = adp.i32();
        this.dataBlobKeys = [];
        for (let i = 0; i < dataBlobKeysCount; i += 1) {
            this.dataBlobKeys.push(ArqDataBlobKey.build(adp));
        }

        this.dataSize = adp.u64();

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

        this.finderFileType = adp.string();
        this.finderFileCreator = adp.string();
        this.isFileExtensionHidden = adp.bool();

        this.st_dev = adp.i32();
        this.st_ino = adp.i32();
        this.st_nlink = adp.u32();
        this.st_rdev = adp.i32();

        this.ctime_sec = adp.i64();
        this.ctime_nsec = adp.i64();
        this.create_time_sec = adp.i64();
        this.create_time_nsec = adp.i64();

        this.st_blocks = adp.i64();
        this.st_blksize = adp.u32();
    }

    static build(adp: ArqDataParser) {
        return new ArqTreeNode(adp);
    }

    toString() {
        let xx = [];
        xx.push(`isTree: ${this.isTree}`);
        xx.push(`treeContainsMissingItems: ${this.treeContainsMissingItems}`);

        xx.push(`dataCompressionType: ${this.dataCompressionType}`);
        xx.push(`xattrsCompressionType: ${this.xattrsCompressionType}`);
        xx.push(`aclCompressionType: ${this.aclCompressionType}`);

        xx.push(`xattrsBlobKey: ${this.xattrsBlobKey.toString("\n\t\t\t\t")}`);
        xx.push(`xattrsSize: ${this.xattrsSize}`);
        xx.push(`aclBlobKey: ${this.aclBlobKey.toString("\n\t\t\t\t")}`);
        xx.push(`uid: ${this.uid}`);
        xx.push(`gid: ${this.gid}`);
        xx.push(`mode: ${this.mode}`);
        xx.push(`mtime_sec: ${this.mtime_sec}`);
        xx.push(`mtime_nsec: ${this.mtime_nsec}`);
        xx.push(`flags: ${this.flags}`);
        xx.push(`finderFlags: ${this.finderFlags}`);
        xx.push(`extendedFinderFlags: ${this.extendedFinderFlags}`);
        xx.push(`finderFileType: ${this.finderFileType}`);
        xx.push(`finderFileCreator: ${this.finderFileCreator}`);
        xx.push(`isFileExtensionHidden: ${this.isFileExtensionHidden}`);
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


        xx.push(`dataSize: ${this.dataSize}`);
        xx.push(`dataBlobKeysCount: ${this.dataBlobKeys.length}`);

        for (let i = 0; i < this.dataBlobKeys.length; i += 1) {
            xx.push(`\tdataBlobKeys${i}: ${this.dataBlobKeys[i].toString("\n\t\t\t\t")}`);
        }

        return `\n\t\t\tfileName: ${this.fileName}\n\t\t\t`+xx.join("\n\t\t\t").trim();
    }
}