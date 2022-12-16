import { exists, existsAsync, NEW_LINE, readText, readTextAsync, writeText, writeTextAsync } from '@app/io/fs'
import hb from 'handlebars'
import { dirname, join } from 'path';
import { HOME, IS_WINDOWS, TMP_DIR } from '@app/os/index';
import { create } from '@app/secrets';
import { getSecretValue, setSecretValue, loadAsync } from '@app/tasks/env';
import { IConfiguration } from '@app/tasks/env/interfaces';

let config : IConfiguration | null = null;

export function setConfig(cfg: IConfiguration) {
    config = cfg;
}

export function renderTemplate(context: any, src: string) {
    if (!exists(src)) {
        throw new Error(`File not found: ${src}`);
    }

    context['__filename'] = src;
    context['__dirname'] = dirname(src);

    const template = readText(src);
    const exec = hb.compile(template);
    return exec(context);
}

export function expandTemplate(context: any, src: string, dest?: string) {
    
    let content = renderTemplate(context, src);

    if(!dest) {
        dest = src.substring(0, src.length - 4);
    }

    writeText(dest, content);
}

export async function expandTemplateAsync(context: any, src: string, dest?: string) {
    if (! await existsAsync(src)) {
        throw new Error(`File not found: ${src}`);
    }


    context['__filename'] = src;
    context['__dirname'] = dirname(src);

    const template = await readTextAsync(src, {'encoding': 'utf8'});
    const exec = hb.compile(template);
    const content = exec(context);

    if(!dest) {
        dest = src.substring(0, src.length - 4);
    }

    await writeTextAsync(dest, content, { 'encoding': 'utf8'});
}

hb.registerHelper('is-windows', () => {
    return process.platform === 'win32'
});

hb.registerHelper('is-darwin', () => {
    return process.platform === 'darwin'
});

hb.registerHelper('is-linux', () => {
    return process.platform === 'linux'
});

hb.registerHelper("conf", async (name: string) => {
    config ||= await loadAsync();
    return new hb.SafeString(config.get(name) || "");
});


hb.registerHelper("cat", function(options) {
    let r = "";
    if(arguments.length > 1) {
        let l = arguments.length - 1;
        for(var i = 0; i < l; i++) {
            let file = arguments[i];

            if(typeof(file) === "string") {
                if(file.startsWith("./") || file.startsWith(".\\")) {
                    file = file.substring(2);
                    let root = options.data['__dirname'] || process.cwd();
                    file = join(root, file);
                }

                if (file.startsWith("~/") || file.startsWith("~\\")) {
                    file = file.substring(2);
                    file = join(HOME, file);
                }

                if (exists(file)) {
                    r += readText(arguments[i], {"encoding": "utf-8"});
                    r += NEW_LINE;
                }
            }
        }
    }
    return r;
});


hb.registerHelper('new-password', (key : string, length?: string, special?: string, vault?: string) => {
    
    if (typeof(key) !== 'string') {
        throw "missing key that is a unique string"
    }

    let l = 16
    let pw = getSecretValue(key, process.env["CASA_ENV"]);
    if(pw) {
        return pw;
    }


    if (length !== null) {
        if(typeof(length) === 'string' || typeof(length) === 'number') {
            let parsedValue = parseInt(length);
            if (!Number.isNaN(parsedValue)) {
                if (parsedValue > 0) {
                    l = parsedValue
                }
            }
        }    
    }

    if(typeof(special) !== 'string' || special.trim().length === 0) {
        special = "_-#@~[]=^:;"
    }

    pw = create({
        length: l,
        special: special
    });

    setSecretValue(key, pw, process.env["CASA_ENV"]);

    return pw;
});

hb.registerHelper('get-env-bool', (name) => {
    let value = process.env[name];

    if(value === null || typeof(value) === 'undefined') {
        return false;
    }

    value = value.toLowerCase();
    switch(value) {
        case "1":
        case "yes":
        case "y":
        case "true":
            return true;
    }

    return false;
});


hb.registerHelper('get-env', (name, defaultValue) => {
    if(IS_WINDOWS) {
        switch(name) {
            case "HOST":
                return process.env["COMPUTERNAME"];
            case "USER":
                return process.env["USERNAME"];
            case "HOME":
                return process.env["USERPROFILE"];
        }
    } else {
        switch(name) {
            case "COMPUTERNAME":
                return process.env["HOST"];

            case "USERNAME":
                return process.env['USER'];

            case "USERPROFILE":
                return process.env['HOME'];
        }
    }

    switch(name) {
        case "TMP":
        case "TEMP":
            return TMP_DIR;    }

    return process.env[name] || defaultValue;
});