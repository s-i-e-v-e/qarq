/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import {IO} from "../util/IO.ts";

export default class QarqDB {
    private static readonly DB_FILE_PATH = ".qarq/qarq.db";
    private static readonly DB_MEM = ":memory:";
    private db: DB;

    constructor() {
        this.db = new DB(QarqDB.DB_MEM);
        const exists = IO.build().exists(QarqDB.DB_FILE_PATH);
        this.db.query(`ATTACH DATABASE '${QarqDB.DB_FILE_PATH}' AS fs;`);

        this.db.query("CREATE TABLE IF NOT EXISTS target (nick TEXT UNIQUE, type TEXT, path TEXT);");
        this.db.query("CREATE TABLE IF NOT EXISTS computer (uuid TEXT UNIQUE, computerName TEXT, userName TEXT);");
        this.db.query("CREATE TABLE IF NOT EXISTS bucket (uuid TEXT UNIQUE, computerUUID TEXT, endpoint TEXT, bucketName TEXT, localPath TEXT, localMountPoint TEXT, storageType TEXT);");
        this.db.query("CREATE TABLE IF NOT EXISTS reflog (timestamp INTEGER UNIQUE, bucketUUID TEXT, name TEXT, oldHeadSha TEXT, oldHeadStretchKey BOOLEAN, newHeadSha TEXT, newHeadStretchKey BOOLEAN, isRewrite BOOLEAN);");
        this.db.query("CREATE TABLE IF NOT EXISTS arq_commit (sha TEXT UNIQUE, bucketUUID TEXT, author TEXT, comment TEXT, parentCommitSha TEXT, treeSha TEXT, file TEXT, creationDate DATETIME, hasMissingNodes BOOLEAN, isComplete BOOLEAN, arqVersion TEXT);");
        this.db.query("CREATE TABLE IF NOT EXISTS arq_commit_failure (commitSha TEXT, relativePath TEXT, errorMessage TEXT);");
        this.db.query("CREATE TABLE IF NOT EXISTS arq_tree (sha TEXT UNIQUE);");
        this.db.query("CREATE TABLE IF NOT EXISTS arq_missing_node (nodeID TEXT UNIQUE, parentTreeSha TEXT, fileName TEXT, UNIQUE(parentTreeSha, fileName));");
        this.db.query("CREATE TABLE IF NOT EXISTS arq_node (nodeID TEXT UNIQUE, parentTreeSha TEXT, fileName TEXT, isTree BOOLEAN, treeContainsMissingItems BOOLEAN, dataCompressionType INTEGER, dataSize UNSIGNED BIG INT, contentSha TEXT, UNIQUE(fileName, parentTreeSha));");
        this.db.query("CREATE TABLE IF NOT EXISTS arq_blob_key (sha TEXT UNIQUE, isEncryptionKeyStretched BOOLEAN, storageType INTEGER, archiveID TEXT, archiveSize UNSIGNED BIG INT, archiveUploadDate DATETIME);");
        this.db.query("CREATE TABLE IF NOT EXISTS arq_node_blob_key (sha TEXT, parentNodeID TEXT, UNIQUE(parentNodeID, sha));");

        if (exists) {
            console.log("exists");
            this.db.query(`INSERT INTO main.target SELECT * FROM fs.target;`);
            this.db.query(`INSERT INTO main.computer SELECT * FROM fs.computer;`);
            this.db.query(`INSERT INTO main.bucket SELECT * FROM fs.bucket;`);
            this.db.query(`INSERT INTO main.reflog SELECT * FROM fs.reflog;`);
            this.db.query(`INSERT INTO main.arq_commit SELECT * FROM fs.arq_commit;`);
            this.db.query(`INSERT INTO main.arq_commit_failure SELECT * FROM fs.arq_commit_failure;`);
            this.db.query(`INSERT INTO main.arq_tree SELECT * FROM fs.arq_tree;`);
            this.db.query(`INSERT INTO main.arq_missing_node SELECT * FROM fs.arq_missing_node;`);
            this.db.query(`INSERT INTO main.arq_node SELECT * FROM fs.arq_node;`);
            this.db.query(`INSERT INTO main.arq_blob_key SELECT * FROM fs.arq_blob_key;`);
            this.db.query(`INSERT INTO main.arq_node_blob_key SELECT * FROM fs.arq_node_blob_key;`);
        }
    }

    addTarget(nick: string, type: string, path: string) {
        this.db.query("INSERT OR IGNORE INTO target (nick, type, path) VALUES (?, ?, ?)", [nick, type, path]);
    }

    addComputer(uuid: string, computerName: string, userName: string) {
        this.db.query("INSERT OR IGNORE INTO computer (uuid, computerName, userName) VALUES (?, ?, ?)", [uuid, computerName, userName]);
    }

    addBucket(uuid: string, computerUUID: string, endpoint: string, bucketName: string, localPath: string, localMountPoint: string, storageType: number) {
        this.db.query("INSERT OR IGNORE INTO bucket (uuid, computerUUID, endpoint, bucketName, localPath, localMountPoint, storageType) VALUES (?, ?, ?, ?, ?, ?, ?)", [uuid, computerUUID, endpoint, bucketName, localPath, localMountPoint, storageType]);
    }

    addReflog(timestamp: number, bucketUUID: string, name: string, oldHeadSha: string, oldHeadStretchKey: boolean, newHeadSha: string, newHeadStretchKey: boolean, isRewrite: boolean) {
        this.db.query("INSERT OR IGNORE INTO reflog (timestamp, bucketUUID, name, oldHeadSha, oldHeadStretchKey, newHeadSha, newHeadStretchKey, isRewrite) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [timestamp, bucketUUID, name, oldHeadSha, oldHeadStretchKey, newHeadSha, newHeadStretchKey, isRewrite]);
    }

    addCommit(sha: string, bucketUUID: string, author: string, comment: string, parentCommitSha: string | null, treeSha: string, file: string, creationDate: number | null, hasMissingNodes: boolean, isComplete: boolean, arqVersion: string) {
        this.db.query("INSERT OR IGNORE INTO arq_commit (sha, bucketUUID, author, comment, parentCommitSha, treeSha, file, creationDate, hasMissingNodes, isComplete, arqVersion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [sha, bucketUUID, author, comment, parentCommitSha, treeSha, file, creationDate, hasMissingNodes, isComplete, arqVersion]);
    }

    addCommitFailure(commitSha: string, relativePath: string, errorMessage: string) {
        this.db.query("INSERT OR IGNORE INTO arq_commit_failure (commitSha, relativePath, errorMessage) VALUES (?, ?, ?)", [commitSha, relativePath, errorMessage]);
    }

    addTree(sha: string) {
        this.db.query("INSERT OR IGNORE INTO arq_tree (sha) VALUES (?)", [sha]);
    }

    addMissingNode(nodeID: string, parentTreeSha: string, fileName: string) {
        this.db.query("INSERT OR IGNORE INTO arq_missing_node (nodeID, parentTreeSha, fileName) VALUES (?, ?, ?)", [nodeID, parentTreeSha, fileName]);
    }

    addNode(nodeID: string, parentTreeSha: string, fileName: string, isTree: boolean, treeContainsMissingItems: boolean, dataCompressionType: number, dataSize: number, contentSha: string | undefined) {
        this.db.query("INSERT OR IGNORE INTO arq_node (nodeID, parentTreeSha, fileName, isTree, treeContainsMissingItems, dataCompressionType, dataSize, contentSha) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [nodeID, parentTreeSha, fileName, isTree, treeContainsMissingItems, dataCompressionType, dataSize, contentSha]);
    }

    addBlobKey(sha: string, parentNodeID: string, isEncryptionKeyStretched: boolean, storageType:number, archiveID: string | undefined, archiveSize: number, archiveUploadDate: number | undefined) {
        this.db.query("INSERT OR IGNORE INTO arq_blob_key (sha, isEncryptionKeyStretched, storageType, archiveID, archiveSize, archiveUploadDate) VALUES (?, ?, ?, ?, ?, ?)", [sha, isEncryptionKeyStretched, storageType, archiveID, archiveSize, archiveUploadDate]);
        this.db.query("INSERT OR IGNORE INTO arq_node_blob_key (sha, parentNodeID) VALUES (?, ?)", [sha, parentNodeID]);
    }

    begin() {
        this.db.query("BEGIN");
    }

    commit() {
        this.db.query("COMMIT");
    }

    clean() {
        console.log("db::cleaning");
        let ok = false;
        for (const [msg] of this.db.query("pragma integrity_check;")) {
            ok = msg === "ok";
            console.log(`db::${msg}`);
        }
        if (!ok) {
            this.db.query("reindex;");
            for (const [msg] of this.db.query("pragma integrity_check;")) {
                console.log(`db::${msg}`);
            }
        }
        console.log("db::cleaning::done");
    }

    close() {
        IO.build().delete(QarqDB.DB_FILE_PATH);
        this.db.query(`VACUUM INTO '${QarqDB.DB_FILE_PATH}'`);
    }

    query(sql: string, params: string[]) {
        return this.db.query(sql, params);
    }

    static deleteDB() {
        IO.build().delete(QarqDB.DB_FILE_PATH);
    }

    static build() {
        return new QarqDB();
    }
}