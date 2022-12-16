import { IS_WINDOWS } from "@app/os";
import path from "node:path";

export const PATH_KEY = IS_WINDOWS ? 'Path' : 'PATH';

export function findExpansions(template: string): string[] {
    const regex = /%([^%]+)%/gi;
    let matches = template.match(regex);
    const set : string[] = []

    if (matches?.length) {
        set.push(...matches.map(m => m.substring(1, m.length - 1)));
    }

    matches = template.match(/\$\{([^\}]+)\}/g);

    if (matches?.length) {
        set.push(...matches.map(m => m.substring(1, m.length - 1)));
    }

    matches = template.match(/\$([A-Za-z0-9]+)/g);

    if (matches?.length) {
        set.push(...matches.map(m => m.substring(1, m.length - 1)));
    }

    return set;
}

export function expand(template: string, throwOnError = false, getValue: (key: string) => string | undefined = get) {
    template = template.replace(/%([^%]+)%/gi, function (_, variableName) {
        const value = getValue(variableName);
        if (!value && throwOnError) {
            throw new Error(`Variable ${variableName} not found`);
        }

        return value || '';
    });

    template = template.replace(
        /\$\{([^\}]+)\}/g,
        function (_, variableName: string) {

            if(variableName.includes(":-")) {
                const parts = variableName.split(":-");
                const value = getValue(parts[0]);
                if(value) {
                    return value;
                }

                return parts[1];
            }

            const value2 = get(variableName);
            if (throwOnError && !value2) {
                throw new Error(`Variable ${variableName} not found`);
            }

            return value2 || '';
        },
    );

    // linux environment variable style expansion $variable
    template = template.replace(
        /\$([A-Za-z0-9]+)/g,
        function (_, variableName) {
            const value = getValue(variableName);
            if (!value && throwOnError) {
                throw new Error(`Variable ${variableName} not found`);
            }

            return value || '';
        },
    );

    return template;
}

export function get(key: string, defaultValue?: string) {
    return process.env[key] ?? defaultValue;
}

export function set(key: string, value: string) {
    process.env[key] = value;
}

export function addpath(pathLike: string, prepend = false) {
    let existing = get(PATH_KEY);
    if(existing === null || typeof(existing) === 'undefined') {
        existing = pathLike;
    } else if (prepend) {
        existing = pathLike + path.delimiter + existing;
    } else {
        existing = existing + path.delimiter + pathLike;
    }

    set(PATH_KEY, existing);
}

export function splitPath() {
    let paths = get(PATH_KEY);
    if(paths === null || typeof(paths) === 'undefined') {
        return [];
    }

    return paths.split(path.delimiter);
}

export function hasPath(value: string) {
    let paths = splitPath();
    return paths.includes(value);
}

export function removePath(value: string) {
    let paths = splitPath();
    let index = paths.indexOf(value);
    if(index >= 0) {    
        paths.splice(index, 1);
        set(PATH_KEY, paths.join(path.delimiter));
    }
}

export function remove(key: string) {
    return delete process.env[key];
}

export function getArray(key: string, separator = ',') {
    let value = get(key);
    if(value === null || typeof(value) === 'undefined') {
        return [];
    }

    return value.split(separator);
}

export function getBool(key: string) {
    let value = get(key);
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
}

export function getNumber(key: string, defaultValue?: number) {
    let value = get(key);
    if(value === null || typeof(value) === 'undefined') {
        return defaultValue ?? 0;
    }

    return parseInt(value);
}

export function getFloat(key: string, defaultValue?: number) {
    let value = get(key);
    if(value === null || typeof(value) === 'undefined') {
        return defaultValue ?? 0;
    }

    return parseFloat(value);
}