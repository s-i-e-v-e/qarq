/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {QarqDB} from "./mod.ts";
import {ArqCache, ArqTarget, ArqTree} from "../data/mod.ts";
import {ArqBucket, ArqComputer} from "../data/mod.ts";
import {Crypto, Dictionary, IO, Timer} from "../util/mod.ts";

export default class QarqInit {
    private metaIsInitialized = false;
    private db: QarqDB;
    constructor(private readonly target: ArqTarget, private readonly computers: ArqComputer[], deleteDB: boolean, private readonly t: Timer) {
        if (deleteDB) QarqDB.deleteDB();
        this.db = QarqDB.build();
    }

    static async build(target: ArqTarget, deleteDB?: boolean) {
        return new QarqInit(target, await target.listComputers(), deleteDB || false, Timer.build());
    }

    private clean() {
        this.db.clean();
    }

    close() {
        this.db.clean();
        this.db.close();
    }

    private log(msg: string) {
        console.log(`${this.t.ms()/1000}s => ${msg}`);
    }

    private initMeta() {
        if (this.metaIsInitialized) return;
        this.db.addTarget(this.target.nick, this.target.type, this.target.path);
        for (const c of this.computers) {
            this.log(`adding computer: ${c.uuid} // ${c.computerName}`);
            this.db.addComputer(c.uuid, c.computerName, c.userName);
        }
        this.metaIsInitialized = true;
    }

    async bucket(c: ArqComputer, b: ArqBucket) {
        ArqCache.clear();
        this.initMeta();

        this.db.begin();
        this.log(`adding bucket: ${b.uuid} // ${b.bucketName}`);
        this.db.addBucket(b.uuid, b.computerUUID, b.endpoint, b.bucketName, b.localPath, b.localMountPoint, b.storageType);

        this.log("adding reflogs...");
        const reflogs = await c.listReflogs(b.uuid);
        for (const x of reflogs) {
            this.db.addReflog(x.timestamp, b.uuid, x.name, x.oldHeadSHA1, x.oldHeadStretchKey, x.newHeadSHA1, x.newHeadStretchKey, x.isRewrite);
        }

        this.log("adding commits...");
        const commits = await c.listCommits(b.uuid);
        for (const c of commits) {
            this.db.addCommit(c.sha, b.uuid, c.author, c.comment, c.parentCommitSha || null, c.treeSha, c.file, c.creationDate || null, c.hasMissingNodes, c.isComplete, c.arqVersion);
            for (const fc of c.failures) {
                this.db.addCommitFailure(c.sha, fc.relativePath, fc.errorMessage);
            }
        }
        this.db.commit();

        this.log("adding trees...");
        this.db.begin();
        const treeDB: Dictionary<ArqTree> = {};
        for (const commit of commits) {
            this.log(`commit: ${commit.sha}`);
            let count = 0;

            const visitTree = async (treeSha: string, treeCompressionType: number, path: string) => {
                if (treeDB[treeSha]) return;

                const tree = await c.getTree(b.uuid, treeSha, treeCompressionType);
                treeDB[treeSha] = tree;
                this.db.addTree(tree.treeSha);

                for (let i = 0; i < tree.missingNodes.length; i += 1) {
                    const n = tree.missingNodes[i];
                    const nodeID = `${tree.treeSha}::${i}`;
                    this.db.addMissingNode(nodeID, tree.treeSha, n);
                }

                for (let i = 0; i < tree.nodes.length; i += 1) {
                    count += 1;
                    if (count % 100 === 0) this.log(`Visiting nodes...${count}`);
                    const n = tree.nodes[i];
                    const nodeID = `${tree.treeSha}::${i}`;
                    let contentSha;
                    if (n.isTree) {
                        if (n.dataBlobKeys.length > 1) throw new Error();
                        const bk = n.dataBlobKeys[0];
                        const pa = `${path}/${n.fileName}`
                        this.db.addBlobKey(bk.sha1, nodeID, bk.isEncryptionKeyStretched, bk.storageType, bk.archiveID, bk.archiveSize, bk.archiveUploadDate);
                        await visitTree(bk.sha1, treeCompressionType, pa);
                        contentSha = undefined;
                    }
                    else {
                        contentSha = "";
                        for (let j = 0; j < n.dataBlobKeys.length; j += 1) {
                            const bk = n.dataBlobKeys[j];
                            this.db.addBlobKey(bk.sha1, nodeID, bk.isEncryptionKeyStretched, bk.storageType, bk.archiveID, bk.archiveSize, bk.archiveUploadDate);
                            contentSha += bk.sha1;
                        }
                        contentSha = Crypto.computeSHA1(contentSha);
                    }
                    this.db.addNode(nodeID, tree.treeSha, n.fileName, n.isTree, n.treeContainsMissingItems, n.dataCompressionType, n.dataSize, contentSha);
                }
            }

            await visitTree(commit.treeSha, commit.treeCompressionType, b.path);
        }
        this.db.commit();
        this.clean();
    }

    async computer(c: ArqComputer) {
        this.initMeta();
        const buckets = await c.listBuckets();
        for (const b of buckets) {
            await this.bucket(c, b);
        }
    }

    async all() {
        this.initMeta();
        const ys = await this.target.listComputers();
        for (const c of ys) {
            await this.computer(c);
        }
    }
}