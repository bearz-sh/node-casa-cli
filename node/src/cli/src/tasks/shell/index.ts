import { expand } from "@app/env";
import { execa, execaSync, Options, SyncOptions, ExecaSyncReturnValue, ExecaReturnValue } from "execa";
import { IS_DARWIN, IS_LINUX, IS_WINDOWS, TMP_DIR } from "@app/os";
import { randomString } from "@app/random";
import { join } from "node:path";
import { which } from "shelljs";

interface IExecutableLookup {
    default: string;
    windows?: string[],
    darwin?: string[],
    linux?: string[]
}

interface IConvertToArgsOptions {
    include?: string[]
    exclude?: string[]
    concat? : string[]
    arguments?: string[]
    formatKey?: (key: string) => string
    formatValue?: (value: string) => string
    aliases?: { [key: string] : string }
    noIgnoreFalse?: boolean,
    preserve?: boolean
    assign?: string
    prefix?: string
    concatDelimiter?: string 
}

export function convertToArgs(parameters: { [key: string] : any }, options?: IConvertToArgsOptions) {
    const splat = [];

    options =  {
        prefix: '--',
        concatDelimiter: ',',
        ...options,
    }

    const o = options;

    const prepend : string[] = [];
    const append  : string[] = [];
    const appendDash : string[] = [];

    function parseValue(value: any) {
        if(typeof value === 'boolean') {
            if(value) {
                return '';
            } else if(!o.noIgnoreFalse) {
                return null;
            }
        }

        if(o.formatValue) {
            return o.formatValue(value);
        } else if(!o.preserve) {
            return value;
        }
    }

    for(const key of Object.keys(parameters)) {
        let value = parameters[key];

        if(key === '-') {
            if(Array.isArray(value)) {
                value.forEach(o => append.push(o))
            }

            if (typeof value === 'string') {
                append.push(value);
            }
        }

        if(key === '--') {
            if(Array.isArray(value)) {
                value.forEach(o => appendDash.push(o))
                continue;
            }

            if (typeof value === 'string') {
                appendDash.push(value);
            }

            continue;
        }

        if(o.exclude && o.exclude.includes(key)) {
            continue;
        }

        if (value === null || value === undefined) {
            continue;
        }

        if (value === false) {
            continue;
        }

        let name = key;
        

        if(o.arguments && o.arguments.includes(key)) {
            if(value !== null && value !== undefined) {
                prepend.push(value.toString())
            }
            continue;
        }

        if(o.aliases && o.aliases[key]) {
            name = o.aliases[key];
        }
        else if(o.formatKey) {
            name = o.formatKey(key);
        } else if(!o.preserve) {
            name = name.replace(/[A-Z]/g, '-$&').toLowerCase()
            name = `${o.prefix}${name}`;
        }

        if (value === true) {
            splat.push(name);
            continue;
        }

        if(Array.isArray(value)) {
            if(o.concat && o.concat.includes(key)) {
                value = value.join(o.concatDelimiter);
            } else if (o.assign) {
                value.forEach(o => splat.push(`${name}${o.assign}${parseValue(o)}`))
            } else {
                value.forEach(o => splat.push(name, value))
            }

            continue;
        }

        if(typeof value === 'number') {
            if(!isNaN(value)) {
                splat.push(name, value.toString());
            }
            continue;
        }

        if(typeof value === 'string' && value.length > 0) {
            if(o.assign) {
                splat.push(`${name}${o.assign}"${value}"`);
            }
            splat.push(name, value);
            continue;
        }
    }

    return [...prepend, ...splat, ...append, ...appendDash];
}


export function exec(command: string, args?: string[], options?: SyncOptions<string>) : ExecaSyncReturnValue<string> { 
    options = options || {
        stdio: ['inherit', 'inherit', 'inherit']
    };
    return execaSync(command, args, options);
}

export async function execAsync(command: string, args?: string[], options?: Options<string>) {
    options = options || {
        stdio: ['inherit', 'inherit', 'inherit']
    };
    return await execa(command, args, options);
}

export function getRandomShellFile() {
    const tmp = TMP_DIR
    return join(tmp, randomString(12));
}

export function findExecutable(options: IExecutableLookup): string | null {
    let o = options;
    let exe = which(o.default);
    if(exe) {
        return exe;
    }

    if (o.windows && IS_WINDOWS) {
        for (let i = 0; i < o.windows.length; i++) {
            let path = expand(o.windows[i]);
            exe = which(path);
            if(exe) {
                return exe;
            }
        }
    }

    if (o.darwin && IS_DARWIN) {
        for (let i = 0; i < o.darwin.length; i++) {
            let path = expand(o.darwin[i]);
            exe = which(path);
            if(exe) {
                return exe;
            }
        }
    }

    if (o.linux && IS_LINUX) {
        for (let i = 0; i < o.linux.length; i++) {
            let path = expand(o.linux[i]);
            exe = which(path);
            if(exe) {
                return exe;
            }
        }
    }

    return null;
}