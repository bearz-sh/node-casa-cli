
export function isObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}
  
export function merge(target: { [key: string]: any }, ...sources: Array<{ [key: string]: any }>) : { [key: string]: any } {
    if (!sources.length) 
        return target;
    
    const source = sources.shift();
  
    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          merge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  
    return merge(target, ...sources);
}



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

export function has(obj: { [key: string]: any }, path: string, delimiter = '.') : boolean {
    var parts = path.split(delimiter);
    let pointer = obj;

    for(var i = 0; i < parts.length; i++) {
        let key = parts[i];
        if(typeof pointer !== 'object' && !Array.isArray(pointer)) {
            return false;
        }

        pointer = pointer[key];
    }

    return true;
}

export function remove (obj: { [key: string]: any }, path: string, delimiter = '.') : boolean {
    var parts = path.split(delimiter);
    let pointer = obj;
    let last = parts.length - 1;
    for(var i = 0; i < parts.length; i++) {
        let key = parts[i];

        if(typeof pointer !== 'object' && !Array.isArray(pointer)) {
            return false;
        }

        if (i === last) {
            delete pointer[key];
            return true;
        }

        var next = pointer[key];
    }

    return false;
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