import { Abortable } from "events";
import { 
    PathLike, 
    constants, 
    accessSync, 
    OpenMode, 
    readFileSync, 
    writeFileSync, 
    PathOrFileDescriptor, 
    WriteFileOptions, 
    Mode, 
    readdirSync, 
    rmSync,
    unlinkSync,
    statSync, 
    mkdirSync as mkdir,
    copyFileSync as copyFile, 
    RmDirOptions} from "fs";
import { access, unlink, rm, FileHandle, readFile, writeFile, readdir, stat, mkdir as mkdirAsync, copyFile as copyFileAsync } from 'fs/promises'
import { ObjectEncodingOptions } from "node:fs";
import { Stream } from "node:stream";
import dotenv from 'dotenv';
import YAML from 'yaml';
import { expand } from "dotenv-expand";
import { EOL } from 'node:os';
import { join } from "path";

export const NEW_LINE = EOL;

export { mkdir, mkdirAsync, copyFile, copyFileAsync } 

export class IOError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class FileNotFoundError extends IOError {
    #file? : string
    
    constructor(file?: string, message?: string) {
        super(message || `File not found ${file}`)

        this.#file = file;
    }

    get file() {
        return this.#file;
    }
}

export class DirectoryNotFoundError extends IOError {
    #directory? : string
    
    constructor(directory?: string, message?: string) {
        super(message || `Directory not found ${directory}`)

        this.#directory = directory;
    }

    get directory() {
        return this.#directory;
    }
}

export async function removeFileAsync(path: PathLike) : Promise<void> {
    if(await existsAsync(path)) {
        unlink(path);
    }
}

export function removeFile(path: PathLike) {
    if(exists(path)) {
        unlinkSync(path);
    }
}

export function removeDirectory(path: PathLike, options?: RmDirOptions) {
    if(exists(path)) {
        rmSync(path, options);
    }
}

export async function existsAsync(path: PathLike, throwError = false) {
    return await  access(path, constants.F_OK)
           .then(() => true)
           .catch(() => {
               try {
                if(throwError && (path instanceof URL || typeof(path) === 'string')) {
                    throw new FileNotFoundError(path.toString());
                }

                return false;
               } catch (e) {
                    return e;
               }
           })
}

export function exists(path: PathLike, throwError = false) {
    try {
        accessSync(path, constants.F_OK)
        return true;
    } catch {
        if(throwError === true && (path instanceof URL || typeof(path) === 'string')) {
            throw new FileNotFoundError(path.toString());
        }
        return false;
    }
}

export async function readJsonAsync(path: PathLike | FileHandle) {
    
    let json = await readTextAsync(path);
    return JSON.parse(json);
}

export function readJson(path: PathOrFileDescriptor) {
    let json = readText(path);
    return JSON.parse(json);
}

export function readYaml(
    path: PathOrFileDescriptor, 
    options?: (YAML.ParseOptions & YAML.DocumentOptions & YAML.SchemaOptions & YAML.ToJSOptions) | undefined) : any {
    const yaml = readText(path);
    return YAML.parse(yaml, options)
}

export async function readYamlAsync(
    path: PathLike | FileHandle,   
    options?: (YAML.ParseOptions & YAML.DocumentOptions & YAML.SchemaOptions & YAML.ToJSOptions) | undefined) : Promise<any> {

    const yaml = await readTextAsync(path)
    return YAML.parse(yaml, options);
}

export async function readTextAsync(path: PathLike | FileHandle,  options?:
    | ({
          encoding: BufferEncoding;
          flag?: OpenMode | undefined;
      } & Abortable)) {

    options ||= { encoding: 'utf8' }

    if(!options?.encoding) {
        options.encoding = 'utf8';
    }

    return await readFile(path, options);
}

export function readText(path: PathOrFileDescriptor,  options?:
    | {
          encoding: BufferEncoding;
          flag?: string | undefined;
      }) {

    options ||= { encoding: 'utf8' }

    if(!options?.encoding) {
        options.encoding = 'utf8';
    }
    
    return readFileSync(path, options);
}

export function writeJson(path: PathOrFileDescriptor, value: any, space?: string | number ) {
    space ||= 4
    let json = JSON.stringify(value, null, space);
    writeText(path, json);
}

export async function writeJsonAsync(path: PathLike | FileHandle, value: any, space?: string | number ) {
    space ||= 4
    let json = JSON.stringify(value, null, space);
    await writeTextAsync(path, json);
}

export function writeYaml(
    path: PathOrFileDescriptor, 
    value: any, 
    options?: (YAML.DocumentOptions & YAML.SchemaOptions & YAML.ParseOptions & YAML.CreateNodeOptions & YAML.ToStringOptions) | undefined) {
    const yaml = YAML.stringify(value, options);
    writeText(path, yaml);
}

export async function writeYamlAsync(
    path: PathLike | FileHandle, 
    value: any, 
    options?: (YAML.DocumentOptions & YAML.SchemaOptions & YAML.ParseOptions & YAML.CreateNodeOptions & YAML.ToStringOptions) | undefined) {

    const yaml = YAML.stringify(value, options);

    await writeTextAsync(path, value);
}


export function writeText(path: PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView, options?: WriteFileOptions) : void {

    options ||= { encoding: 'utf8' }

    writeFileSync(path, data, options);
}



export async function writeTextAsync(path: PathLike | FileHandle,
    data: string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | Stream,
        options?:
            | (ObjectEncodingOptions & {
                  mode?: Mode | undefined;
                  flag?: OpenMode | undefined;
              } & Abortable)) {


                options ||= { encoding: 'utf8' }
    
    return await writeFile(path, data, options);
}

export function readDotEnv(...paths: PathOrFileDescriptor[]) {
    if(paths.length === 0) {
        return {}
    }

    if(paths.length === 1) {
        let content = readText(paths[0]);
        let next = dotenv.parse(content);
        return expand({ parsed: next }).parsed
    }

    let data : { [key: string] : string } | undefined = {}
    paths.forEach(p => {
        let content = readText(p);
        let next = dotenv.parse(content);
        data = Object.assign(data || {}, next);
        data = expand({ parsed: data }).parsed
    });

    return data;
}


export async function readDotEnvAsync(...paths: PathLike[]) {
    if(paths.length === 0) {
        return {}
    }

    if(paths.length === 1) {
        let content = await readTextAsync(paths[0]);
        let next = dotenv.parse(content);
        return expand({ parsed: next }).parsed
    }

    let data : { [key: string] : string } | undefined = {}
    paths.forEach(async p =>  {
        let content = await readTextAsync(p);
        let next = dotenv.parse(content);
        data = Object.assign(data || {}, next);
        data = expand({ parsed: data }).parsed
    });

    return data;
}

export interface IFileInfo {
    dir: boolean 
    name: string 
    path: string
    base: string
    rel: string
}

export function cat(...paths: PathLike[]) {
    let content = "";
    paths.forEach(path => {
        if(!exists(path)) {
            return;
        }
        let next = readText(path);
        content += `${next}${NEW_LINE}`
    })

    return content;
}

export async function catAsync(...paths: PathLike[]) {
    let content = "";
    paths.forEach(async (path) => {
        if(!exists(path)) {
            return;
        }
        let next = await readTextAsync(path);
        content += `${next}${NEW_LINE}`
    })

    return content;
}

export async function walkDirAsync(dir: string, list?: IFileInfo[], src?: string) {
    let l = list ?? [];
    let s = src ?? dir;
    let set = await readdir(dir);
    set.forEach(async (file) => {
        const fullname = join(dir, file);
        const statInfo = await stat(fullname);
        const isDir = statInfo.isDirectory();
        var next = {
            dir: isDir,
            path: fullname,
            name: file,
            rel: fullname.replace(s, ""),
            base: dir
        }

        l.push(next)

        if(isDir) {
            await walkDirAsync(fullname, l, s);
        }
    })

    return l;
}

export function walkDir(dir: string, list?: IFileInfo[], src?: string) {
    let l = list ?? [];
    let s = src ?? dir;
    readdirSync(dir).forEach(file => {
        const fullname = join(dir, file);
        const stat = statSync(fullname);
        const isDir = stat.isDirectory();
        let rel = fullname.replace(s, "");
        if(rel[0] === '/' || rel[0] === '\\') {
            rel = rel.substring(1)
        }
        var next = {
            dir: isDir,
            path: fullname,
            name: file,
            rel: rel,
            base: dir
        }

        l.push(next)

        if(isDir) {
            walkDir(fullname, l, s);
        }
    })

    return l;
}

