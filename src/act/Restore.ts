/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Command} from "./mod.ts";

export default class Restore extends Command {
    async restoreCommit(commitSha: string) {

    }

    async restoreFile(commitSha: string, filePattern: string) {
        interface Blob {
            sha: string;
            isEncryptionKeyStretched: string;
            storageType: string;
            archiveID: string;
            archiveSize: string;
            archiveUploadDate: string;
        }

        interface File {
            fileName: string;
            path: string;
            dataSize: string;
            commitSha: string;
            blobs: Blob[];
        }

        interface Search {
            (target: string): boolean;
        }

        let search: Search;
        let fp: string;
        if (filePattern.startsWith("%") && filePattern.endsWith("%")) {
            fp = filePattern.substring(1, filePattern.length -1);
            search = (fileName: string) => fileName.includes(fp);
        }
        else if (filePattern.startsWith("%")) {
            fp = filePattern.substring(1, filePattern.length);
            search = (fileName: string) => fileName.endsWith(fp);
        }
        else if (filePattern.endsWith("%")) {
            fp = filePattern.substring(0, filePattern.length-1);
            search = (fileName: string) => fileName.startsWith(fp);
        }
        else {
            fp = filePattern;
            search = (fileName: string) => fileName === fp;
        }

        const getNodes = (treeSha: string, path: string, xs: File[]) => {
            const nodes = this.exec("select nodeID, fileName, dataSize, contentSha, isTree from arq_node where parentTreeSha = ?;", [treeSha]);
            for (const [nodeID, fileName, dataSize, contentSha, isTree] of nodes) {
                const filePath = `${path}/${fileName}`;
                if (isTree) {
                    const keys = this.exec("select sha from arq_node_blob_key where parentNodeID = ?;", [nodeID]);
                    for (const [sha] of keys) {
                        getNodes(sha, filePath, xs);
                    }
                }
                else {
                    if (!search(fileName)) continue;
                    const keys = this.exec("select sha, isEncryptionKeyStretched, storageType, archiveID, archiveSize, archiveUploadDate from arq_blob_key where sha in (select sha from arq_node_blob_key where parentNodeID = ?);", [nodeID]);
                    const ys = [];
                    for (const [sha, isEncryptionKeyStretched, storageType, archiveID, archiveSize, archiveUploadDate] of keys) {
                        ys.push({
                            sha: sha,
                            isEncryptionKeyStretched: isEncryptionKeyStretched,
                            storageType: storageType,
                            archiveID: archiveID,
                            archiveSize: archiveSize,
                            archiveUploadDate: archiveUploadDate,
                        })
                    }

                    const f = {
                        fileName: fileName,
                        path: filePath,
                        dataSize: dataSize,
                        commitSha: commitSha,
                        blobs: ys,
                    };
                    xs.push(f);
                }
            }
        };

        let treeSha = "";
        for (const [sha] of this.exec("select treeSha from arq_commit where sha = ?;", [commitSha])) {
            treeSha = sha;
        }

        const xs: File[] = [];
        getNodes(treeSha, ".", xs);
        return xs;
    }
}