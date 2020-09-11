/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    PlistParser,
} from "../util/mod.ts";
import {
    ArqCache,
    ArqDataParser,
    ArqComputer,
} from "./mod.ts";

class Failure {
    constructor(readonly relativePath: string, readonly errorMessage: string) {
    }
}

export default class ArqCommit {
    readonly sha: string;
    readonly author: string;
    readonly comment: string;
    readonly parentCommitSha?: string;
    readonly parentCommitEncryptionKeyStretched?: boolean;
    readonly treeSha: string;
    readonly treeEncryptionKeyStretched: boolean;
    readonly treeCompressionType: number;
    readonly file: string;
    readonly creationDate?: number;
    readonly failures: Failure[];
    readonly hasMissingNodes: boolean;
    readonly isComplete: boolean;
    readonly xml: string;
    readonly arqVersion: string;

    constructor(sha: string, adp: ArqDataParser) {
        this.sha = sha;
        adp.verifyHeader("CommitV012", "<commit>");
        this.author = adp.string();
        this.comment = adp.string();

        if (adp.i64()) {
            this.parentCommitSha = adp.string();
            this.parentCommitEncryptionKeyStretched = adp.bool();
        }
        this.treeSha = adp.string();
        this.treeEncryptionKeyStretched = adp.bool();
        this.treeCompressionType = adp.compressionType();
        this.file = adp.string();
        this.creationDate = adp.date();

        const failure_count = adp.i64();
        this.failures = [];
        for (let i = 0; i < failure_count; i += 1) {
            this.failures.push(new Failure(adp.string(), adp.string()));
        }
        this.hasMissingNodes = adp.bool();
        this.isComplete = adp.bool();
        this.xml = PlistParser.format(adp.dataString());
        this.arqVersion = adp.string();
        adp.mustBeOEF();
    }

    static async build(c: ArqComputer, folderUUID: string, sha: string) {
        return new ArqCommit(sha, await ArqCache.getCommitObject(c, folderUUID, sha));
    }

    toString() {
        let xx = [];
        xx.push(`author: ${this.author}`);
        xx.push(`comment: ${this.comment}`);
        xx.push(`parentCommitID: ${this.parentCommitSha}`);
        xx.push(`parentCommitEncryptionKeyStretched: ${this.parentCommitEncryptionKeyStretched}`);

        xx.push(`treeSha: ${this.treeSha}`);
        xx.push(`treeEncryptionKeyStretched: ${this.treeEncryptionKeyStretched}`);
        xx.push(`treeCompressionType: ${ArqDataParser.compressionTypeToString(this.treeCompressionType)}`);
        xx.push(`file: ${this.file}`);
        xx.push(`creationDate: ${this.creationDate}`);
        xx.push(`failureCount: ${this.failures.length}`);
        this.failures.forEach(f => {
            xx.push(`relativePath: ${f.relativePath}`);
            xx.push(`errorMessage: ${f.errorMessage}`);
        })

        xx.push(`hasMissingNodes: ${this.hasMissingNodes}`);
        xx.push(`isComplete: ${this.isComplete}`);
        xx.push(`arqVersion: ${this.arqVersion}`);

        return `\n\tcommitSha: ${this.sha}\n\t`+xx.join("\n\t").trim();
    }
}