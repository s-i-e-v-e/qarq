/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export class Path {
    constructor(readonly path: string, readonly fsPath: string, readonly name: string) {}
}

export class IO {
    constructor(readonly isRemote: boolean, readonly nick?: string, readonly cache?: string)  {

    }
    static build(nick?: string, cache?: string) {
        return new IO(nick !== undefined, nick, cache);
    }

    listFolders(p: Path) {
        const xs = [];
        for (const de of Deno.readDirSync(p.fsPath)) {
            if (de.isDirectory) {
                xs.push(this.createPath(p.path, de.name));
            }
        }
        return xs;
    }

    listFiles(p: Path) {
        const xs: Path[] = [];
        for (const de of Deno.readDirSync(p.fsPath)) {
            if (de.isFile) {
                xs.push(this.createPath(p.path, de.name));
            }
        }
        return xs;
    }

    async readFile(p: Path) {
        return Deno.readFile(p.fsPath);
    }

    async readTextFile(p: Path) {
        return Deno.readTextFile(p.fsPath);
    }

    createPath(path: string, name?: string) {
        path = path.replaceAll(/\\/g, "/");
        if (!name) {
            const n = path.lastIndexOf("/");
            name = path.substring(n+1);
            path = path.substring(0, n);
        }
        const a = path.indexOf("@");
        const b = path.indexOf(":");
        const isRemote = a < 0 ? false : a < b;
        const fsPath = isRemote ? `${this.cache}/${this.nick}${path.substring(path.indexOf("/"))}` : path;

        return new Path( `${path}/${name}`, `${fsPath}/${name}`, name);
    }

    delete(path: string) {
        try {
            Deno.removeSync(path);
        }
        catch (e) {
            if (e instanceof Deno.errors.NotFound) {
                // ignore
            }
        }
    }

    exists(p: Path | string) {
        try {
            const px = (p as Path).path;
            if (px) {
                Deno.statSync(px);
            }
            else {
                Deno.statSync(p as string);
            }
            return true;
        }
        catch (e) {
            if (e instanceof Deno.errors.NotFound) {
                return false;
            }
            else {
                throw e;
            }
        }
    }

    parseRemotePath(path: string) {
        path = path.replaceAll(/\\/g, "/");
        const a = path.indexOf(":");
        const b = path.indexOf("/");
        return {
            remote: a < 0 ? path.substring(0, b) : path.substring(0, a),
            port:  a < 0 ? "22" : path.substring(a+1, b),
            path: path.substring(b),
        };
    }
}