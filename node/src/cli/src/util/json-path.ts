

export function get(obj: { [key: string]: any }, path: string, delimiter = '.') : any | undefined {
    var parts = path.split(delimiter);
    let pointer = obj;

    for(var i = 0; i < parts.length; i++) {
        let key = parts[i];
        if(typeof pointer !== 'object' && !Array.isArray(pointer)) {
            return undefined;
        }

        pointer = pointer[key];
    }

    return pointer;
}

export function set(obj: { [key: string]: any}, path: string, value: any, delimiter = '.') {
    var parts = path.split(delimiter);
    let pointer = obj;
    let last = parts.length - 1;
    for(var i = 0; i < parts.length; i++) {
        let key = parts[i];

        if(typeof pointer !== 'object' && !Array.isArray(pointer)) {
            return false;
        }

        if (i === last) {
            pointer[key] = value;
            return true;
        }

        var next = pointer[key];

        if(next === null || typeof(next) === 'undefined') {
            pointer[key] = {};
        }

        pointer = pointer[key];
    }

    return false;
}