# qarq ("Query Arq")

*qarq* is a tool that lets you query [Arq Backup v5](https://www.arqbackup.com/) metadata.

It is in initial stages of development, is fragile, and might contain bugs. So only use it if you know what you are doing.

# Getting started

Steps:

* Install [Deno](https://deno.land/) (`curl -fsSL https://deno.land/x/install/install.sh | sh`)
* Clone this repository
* Switch to the `src` directory
* Install *qarq* using `deno install -A qarq.ts`

When the first target is added, *qarq* will create a `.qarq` directory within the current working directory.

Commands other than adding/listing targets and listing computers require a password.

A password can be provided for each computer by adding entries to the keys dictionary within `.qarq/qarq.config.json`. Dictionary entries are of the form: `"<computer-uuid>": ["<password>"]`. *qarq* stores decrypted master keys as part of the same password array and reuses them on future commands.

# Basic commands

**Add targets**

`qarq add-target <nick> <type> <target-path>`

`qarq add-target etna sftp sieve@sieve.etna:22/home/sieve/bak/arq` (remote)

`qarq add-target etna-1 local /home/sieve/bak/arq` (local: linux)

`qarq add-target etna-2 local Q:/bak/arq` (local: windows)

**List targets**

`qarq list-targets`

**List computers**

`qarq list-computers <nick>`

`qarq list-computers etna`

**List buckets**

`qarq list-buckets <nick> <computer-uuid>`

**List commits**

`qarq list-commits <nick> <computer-uuid> <bucket-uuid>`

**Show last commit id**

`qarq last-commit-id <nick> <computer-uuid> <bucket-uuid>`

**Sync remote computer metadata**

`qarq sync <nick>`

`qarq sync etna`

**Initialize local sqlite db** and import metadata into db. **IMP**: If a computer-uuid is not provided, the existing database (`.qarq/qarq.db`) will be overwritten.

`qarq init <nick> [<computer-uuid> [<bucket-uuid>]]`

`qarq init etna`

`qarq init etna-1`

`qarq init etna-2`

**Find file**

`qarq find <file-pattern>`

`qarq find a%.pdf`

`qarq find %2020%`

**Restore file** from specific commit. Currently only shows file metadata.

`qarq restore file <commit-sha> <file-pattern>`

`qarq restore file <commit-sha> IMG_421.jpg`