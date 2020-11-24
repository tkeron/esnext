#!/usr/bin/env node

import fs from "fs";
import { join } from "path";
import { argv } from "process";

const getFilesRecursive = (dir: string, extension = ".js"): string[] => {
    const reg = extension === "*" ? null : new RegExp(`\\${extension}$`);
    let res: string[] = [];
    const files = fs.readdirSync(dir);
    files.forEach(f => {
        const path = join(dir, f);
        const st = fs.statSync(path);
        if (st.isDirectory()) {
            const ofls = getFilesRecursive(path, extension);
            res = res.concat(ofls);
            return;
        }
        if (!st.isFile()) return;
        if (reg && !f.match(reg)) return;
        res.push(path);
    });
    return res;
};

const getImports = (txt: string) => {
    let res: ({ imprt: string, file: string })[] = [];
    const getimp = () => txt.match(/import.*\"(.*)\"\;/);
    let ok = getimp();
    while (ok) {
        const [imprt, file] = ok;
        res.push({ imprt, file });
        txt = txt.replace(imprt, "");
        ok = getimp();
    }
    return res;
};

export const toESNEXT = (dir: string, cacheBuster = true) => {
    console.log({ dir, cacheBuster });
    const fls = getFilesRecursive(dir);
    const cb = cacheBuster ? `?cb=${(new Date()).getTime()}` : "";
    fls.forEach(f => {
        let file = fs.readFileSync(f, { encoding: "utf-8" });
        const imprts = getImports(file);
        Object.values(imprts).forEach(o => {
            const isFile = o.file.match(/^\.{1,2}\/\w+/) ? true : false;
            const hasExt = o.file.match(/^\.{1,2}\/\w+(\.js)$/) ? true : false;
            if (isFile && !hasExt) {
                const replace = o.imprt.replace(o.file, o.file + `.js${cb}`);
                file = file.replace(o.imprt, replace);
            }
        });
        fs.writeFileSync(f, file, { encoding: "utf-8" })
    });
};

const getArg = (arg: string, argv?: string[]): string | undefined => {
    //@ts-ignore
    if (typeof globalThis.argv !== "undefined") argv = globalThis.argv;
    if (!argv) argv = process.argv;
    let i = 0;
    for (const n in argv) {
        const s = argv[n];
        const regeq = new RegExp(arg + "=");
        const sregeq = s.match(regeq);
        if (sregeq && "input" in sregeq) {
            //@ts-ignore
            return sregeq.input.split("=")[1];
        }
        const reg = new RegExp(`^${arg}$`, "g");
        const sreg = s.match(reg);
        const isNx = arg.match(/-{1,2}\w+/);
        if (sreg) {
            if (isNx && argv.length >= (i + 1)) return argv[i + 1];
            return arg;
        }
        i++;
    }
    return undefined;
};

if (argv.length > 2) {
    const cb = getArg("cacheBuster") ? true : false;
    toESNEXT(argv[2], cb);
}

if(getArg("--help")) console.log(`

    TKERON-ESNEXT

    This module allows you to transform your transpiled javascript
    code by adding the extension ".js" to the local imports, 
    preferably always use the notation "./" and "../" to import 
    local modules, then you can use it in the browser or with nodejs.

    Example:

    > tkeron-esnext myfolder-with-tsc-output-files

    You can add the "cacheBuster" command to add a timestamp as get
    param, and avoid browser cache:

    > tkeron-esnext myfolder-with-tsc-output-files cacheBuster

`);

