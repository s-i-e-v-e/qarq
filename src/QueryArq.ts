/*
 * Copyright (c) 2020 Sieve
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ArqCommander } from "./act/mod.ts";

export default function main(args: string[]) {
	if (args.length) {
		const cmd = args[0];
		switch (cmd) {
			case "add-target": ArqCommander.addTarget(args[1], args[2], args[3]); break;
			case "list-targets": ArqCommander.listTargets(); break;
			case "list-computers": ArqCommander.listComputers(args[1]); break;
			case "list-buckets": ArqCommander.listBuckets(args[1], args[2]); break;
			case "list-reflogs": ArqCommander.listReflogs(args[1], args[2], args[3]); break;
			case "list-commits": ArqCommander.listCommits(args[1], args[2], args[3]); break;
			case "last-commit-id": ArqCommander.lastCommitID(args[1], args[2], args[3]); break;
			case "show-commit": ArqCommander.showCommit(args[1], args[2], args[3], args[4]); break;
			case "show-tree": ArqCommander.showTree(args[1], args[2], args[3], args[4], args[5]); break;
			case "restore": {
				const cmd = args[1];
				switch (cmd) {
					case "commit": ArqCommander.restoreCommit(args[2]); break;
					case "file": ArqCommander.restoreFile(args[2], args[3]); break;
					default: throw new Error(`Unknown command: ${cmd}`);
				}
			} break;
			case "sync": ArqCommander.sync(args[1]); break;
			case "init": ArqCommander.dbInit(args[1], args[2], args[3]); break;
			case "diff": ArqCommander.diff(args[1], args[2]); break;
			case "find": ArqCommander.find(args[1]); break;
			case "test": ArqCommander.test(); break;
			default: throw new Error(`Unknown command: ${cmd}`);
		}
	}
	else {
		console.log("qarq 0.1 (20200912)");
		console.log('Copyright (C) 2020 Sieve (https://github.com/s-i-e-v-e)');
		console.log('This is free software; see the source for copying conditions.  There is NO');
		console.log('warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.');
		console.log("USAGE:");
		console.log("	qarq list-targets");
		console.log("	qarq add-target <nick> <type> <target-path>");
		console.log("	qarq list-computers <nick>");
		console.log("	qarq list-buckets <nick> <computer-uuid>");
		console.log("	qarq list-reflogs <nick> <computer-uuid> <bucket-uuid>");
		console.log("	qarq list-commits <nick> <computer-uuid> <bucket-uuid>");
		console.log("	qarq last-commit-id <nick> <computer-uuid> <bucket-uuid>");
		console.log("	qarq show-commit <nick> <computer-uuid> <bucket-uuid> <commit-sha>");
		console.log("	qarq show-tree <nick> <computer-uuid> <bucket-uuid> <tree-sha>");
		console.log("	qarq restore commit <commit-sha>");
		console.log("	qarq restore file <commit-sha> <file-pattern>");
		console.log("	qarq sync <nick>");
		console.log("	qarq init <nick> [<computer-uuid> [<bucket-uuid>]]");
		console.log("	qarq find <file-pattern>");
		console.log("	qarq diff <commit-sha-1> <commit-sha-2>");
		console.log("	qarq test");
	}
}

main(Deno.args);