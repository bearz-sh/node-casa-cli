import { Abortable } from "events";
import { PathLike, constants, accessSync, OpenMode, readFileSync, writeFileSync, PathOrFileDescriptor, WriteFileOptions, Mode } from "fs";
import { access, FileHandle, readFile, writeFile } from 'fs/promises'
import { ObjectEncodingOptions } from "node:fs";
import { Stream } from "node:stream";
import dotenv from 'dotenv'
import { expand } from "dotenv-expand";
import { EOL } from 'node:os';

export const NEW_LINE = EOL;

export async function existsAsync(path: PathLike) {
    return await  access(path, constants.F_OK)
           .then(() => true)
           .catch(() => false)
}

export function exists(path: PathLike) {
    try {
        accessSync(path, constants.F_OK)
        return true;
    } catch {
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