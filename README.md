# sign-doc-reuploader

## Dependencies

You need to have v16 of [node.js](https://nodejs.org/en/) installed.

## Install and run

1. [Download](https://github.com/rossgk2/sign-doc-reuploader/archive/refs/heads/main.zip) the zip of this repo and extract it.
2. Rename the extracted folder to something (e.g. `fldr`).
3. In a command prompt `cd` to `fldr` and then `npm install`.
4. Execute `npm install typescript`, then `npm install @types/node`, and then `npm install @tsconfig/node16`.
5. To run the script, execute `npx ts-node reuploader.ts` (not `node reuploader.ts`, since we're using TypeScript).

## Miscellaneous documentation

### tsconfig.json

The tsconfig.json used in this project is informed by these two links: [(1)](https://stackoverflow.com/a/55701637) [(2)](
https://blog.appsignal.com/2022/01/19/how-to-set-up-a-nodejs-project-with-typescript.html). Specifically, we learn from (1) that since TypeScript's `File` type is defined in the `dom` library,  we have to add `dom` to `complierOptions` in order for TypeScript to know about the `File` type.
