import { IConfigStore, IConfigStoreOptions, IFileConfigStoreOptions } from "./interfaces";

export abstract class ConfigStore implements IConfigStore  { 
    #options: IConfigStoreOptions

    constructor(options: IConfigStoreOptions) {
        this.#options = options;
    }

    get options() : IConfigStoreOptions {
        return this.#options;
    }

    listAsync(): Promise<string[]> {
        throw new Error("Method not implemented.");
    }

    list(): string[] {
        throw new Error("Method not implemented.");
    }

    getModelAsync(): Promise<{ [key: string]: any; }> {
        throw new Error("Method not implemented.");
    }

    get(key: string) : any {
        throw new Error("Method not implemented.");
    }
    getAsync(key: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    set(key: string, value: any): void {
        throw new Error("Method not implemented.");
    }
    setAsync(key: string, value: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
    delete(key: string): boolean {
        throw new Error("Method not implemented.");
    }
    deleteAsync(key: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    toJson() : { [key: string] : any } {
        throw new Error("Method not implemented.");
    }
}

export abstract class FileConfigStore extends ConfigStore {
    #options: IFileConfigStoreOptions
    #data : { [key: string] : any }

    constructor(options: IFileConfigStoreOptions) {
        super(options)
        this.#options = options;
        this.#data = this.load();
    }

    get options() : IFileConfigStoreOptions {
        return this.#options
    }

    protected abstract load() : { [key: string] : any }

    protected abstract save() : void 

    get(key: string): any {
        
        let segments = key.split('.');

        switch(segments.length) {
            case 0:
                return null;
            case 1:
                {
                    let v = this.#data[segments[0]]
                    if (typeof v === 'undefined') {
                        return null;
                    }
                    return v;
                }
            default: 
                {
                    let target = this.#data;
                    let l = segments.length - 1;
                    for(var i = 0; i < segments.length; i++) {
                        let k = segments[i];

                        let v = target[k];

                        if(i === l) {
                            return v;
                        }

                        if(typeof v === 'object' || Array.isArray(v)) {
                            target = v;
                            continue;
                        }

                        return null;
                    }

                    return target;
                }
        }        
    }

    list(): string[] {
        let keys = Object.keys(this.#data);
        let result : string[] = [];
        
        function walk(obj: any, path: string) {
            for(let k in obj) {
                let v = obj[k];
                let p = path + '.' + k;
                if(typeof v === 'object' || Array.isArray(v)) {
                    walk(v, p);
                } else {
                    result.push(p);
                }
            }
        }

        return result;
    }

    listAsync(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            resolve(this.list());
        });
    }

    getModelAsync(): Promise<{ [key: string]: any; }> {
        return new Promise((resolve, reject) => {
            let keys = Object.keys(this.#data);
            let result : { [key: string]: any; } = {};
            
            function walk(obj: any, path: string) {
                for(let k in obj) {
                    let v = obj[k];
                    let p = path + '.' + k;
                    if(typeof v === 'object' || Array.isArray(v)) {
                        walk(v, p);
                    } else {
                        result[p] = v;
                    }
                }
            }

            resolve(result);
        });
    }

    getAsync(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(this.get(key));
        })
    }

    set(key: string, value: any) {
        let segments = key.split('.');

        switch(segments.length) {
            case 0:
                return false;
            case 1:
                {
                    this.#data[segments[0]] = value;
                    this.save();
                    return true;
                }
            default: 
                {
                    let target = this.#data;
                    let l = segments.length - 1;
                    for(var i = 0; i < segments.length; i++) {
                        let k = segments[i];

                        if(i === l) {
                            target[k] = value;
                            this.save();
                            return true;
                        }

                        let v = target[k];

                        if(typeof v === 'object' || Array.isArray(v)) {
                            target = v;
                            continue;
                        }

                        if(v === null || typeof(v) === 'undefined') {
                            target[k] = {};
                            target = target[k];
                            continue;
                        }

                        return false;
                    }

                    return false;
                }
        }        
    }

    setAsync(key: string, value: any): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(this.set(key, value));
        })
    }

    delete(key: string): boolean {
        let segments = key.split('.');

        switch(segments.length) {
            case 0:
                return false;
            case 1:
                {
                    delete this.#data[segments[0]];
                    this.save();
                    return true;
                }
            default: 
                {
                    let target = this.#data;
                    let l = segments.length - 1;
                    for(var i = 0; i < segments.length; i++) {
                        let k = segments[i];

                        if(i === l) {
                            delete target[k];
                            this.save();
                            return true;
                        }

                        let v = target[k];

                        if(typeof v === 'object' || Array.isArray(v)) {
                            target = v;
                            continue;
                        }

                        if(v === null || typeof(v) === 'undefined') {
                            target[k] = {};
                            target = target[k];
                            continue;
                        }

                        return false;
                    }

                    return false;
                }
        }        
    }

    deleteAsync(key: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(this.delete(key));
        })
    }

    toJson(): { [key: string]: any; } {
        return this.#data;
    }
}
