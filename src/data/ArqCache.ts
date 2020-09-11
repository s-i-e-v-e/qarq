/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    IO,
    Path,
    Dictionary,
    Compress, Convert,
} from "../util/mod.ts";
import {
    ArqComputer,
    ArqPackFile,
    ArqPackFileEntry,
    ArqPackIndex,
    ArqPackIndexEntry,
    ArqEncryptedObject,
    ArqDataParser
} from "./mod.ts";

interface IndexEntry {
    entry: ArqPackIndexEntry,
    file : ArqPackIndex,
}

interface PackEntry {
    data: Uint8Array,
    compressed : boolean,
}

function dumpMatchInfo(pf: ArqPackFile, pfe: ArqPackFileEntry, indexPath: string) {
    console.log(`index.path: ${indexPath}`);
    console.log(`pack.path: ${pf.path}`);
    console.log(`pack.objects.length: ${pf.objects.length}`);
    console.log(`file.mime: ${pfe.mime ? pfe.mime : "<none>"}`);
    console.log(`file.name: ${pfe.name ? pfe.name : "<none>"}`);
    console.log(`file.offset: ${pfe.offset}`);
    console.log(`file.data.size: ${pfe.data.length}`);
}

export default class ArqCache {
    public static readonly CACHE_PATH = ".qarq/cache";
    private static INDEX : Dictionary<Dictionary<IndexEntry>> = {};
    private static PACK : Dictionary<Dictionary<PackEntry>> = {};

    static clear() {
        this.INDEX = {};
        this.PACK = {};
    }

    static async getDataParser(io: IO, pi: Path) {
        return ArqDataParser.build(await this.getFileBytes(io, pi));
    }

    static async getFileBytes(io: IO, pi: Path) {
        return io.readFile(pi);
    }

    static async getTextFile(io: IO, pi: Path) {
        return io.readTextFile(pi);
    }

    static async getCommitObject(c: ArqComputer, folderUUID: string, commitSha: string) {
        return ArqCache.getObject(c, folderUUID, `arq://commit/${commitSha}`, commitSha);
    }

    static async getTreeObject(c: ArqComputer, folderUUID: string, treeSha: string, treeCompressionType: number) {
        return ArqCache.getObject(c, folderUUID, `arq://tree/${treeSha}`, treeSha, treeCompressionType);
    }

    /**
     * Load from /<computer-uuid>/objects/xx/yyyyyyyyyyyyyyyyyy
     * If not found...
     * Search through all /<computer-uuid>/packsets/<folder-uuid>-trees/*.index files
     */
    static async getObject(c: ArqComputer, folderUUID: string, path: string, sha: string, compressionType?: number) {
        const db = await this.getIndex(c, folderUUID);

        let data;
        if (db[sha]) {
            const x = db[sha];
            data = await this.getPack(c, folderUUID, path, x, compressionType);
        }
        else {
            try {
                const na = sha.substring(0, 2);
                const nb = sha.substring(2);
                const pi = c.io.createPath(`${c.path}/objects/${na}`, nb);
                data = await this.getFileBytes(c.io, pi);
            }
            catch (e) {
                throw new Error(`${sha} not found`);
            }
        }
        return ArqDataParser.build(data);
    }

    public static decompress(xs: Uint8Array, compressionType?: number) {
        if (!compressionType) return xs;
        const adp = ArqDataParser.build(xs);
        let expectedSize;
        let data: Uint8Array;
        switch (compressionType|0) {
            case 0: {
                expectedSize = adp.length;
                data = adp.bytes();
                break;
            }
            case 2: {
                expectedSize = adp.i32();
                data = Compress.decompress(adp.bytes());
                break;
            }
            default: {
                throw new Error(`compression "${ArqDataParser.compressionTypeToString(compressionType)}" not supported`);
            }
        }
        if (expectedSize !== data.length) throw new Error(`${expectedSize} !== ${data.length}`);
        return data;
    }

    static async getIndex(c: ArqComputer, folderUUID: string) {
        const key =  `${c.uuid}/${folderUUID}`;
        if (!this.INDEX[key]) {
            console.log(`reading INDEX files: ${key}`);
            const xs  = await ArqPackIndex.list(c, folderUUID);
            // build searchable index
            const db: Dictionary<IndexEntry> = {};
            xs.forEach(idf => {
                idf.objects.forEach(o => {
                    db[o.sha1] = { "entry": o, "file": idf };
                })
            });
            this.INDEX[key] = db;
        }
        return this.INDEX[key];
    }

    static async getPack(c: ArqComputer, folderUUID: string, path: string, x: IndexEntry, compressionType?: number) {
        const key = x.file.uuid;
        const k2 = `${x.entry.offset}/${x.entry.dataSize}`;
        if (!this.PACK[key]) {
            console.log(`reading PACK file: ${x.file.uuid}`);
            const pf = await ArqPackFile.build(c, folderUUID, x.file.uuid);
            const db: Dictionary<PackEntry> = {};
            for (let i = 0; i < pf.objects.length; i++) {
                const pfe = pf.objects[i];
                const k = `${pfe.offset}/${pfe.data.length}`;
                db[k] = {
                    compressed: true,
                    data: ArqEncryptedObject.decrypt(c.cry, path, ArqDataParser.build(pfe.data))
                }
            }
            this.PACK[key] = db;
        }
        const d = this.PACK[key][k2];
        d.data = d.compressed ? this.decompress(d.data, compressionType) : d.data;
        d.compressed = false;
        return d.data;
    }
}