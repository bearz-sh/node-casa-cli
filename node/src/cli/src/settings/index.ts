import { join } from "node:path";
import { exists, existsAsync, readJson, readJsonAsync, writeJson, writeJsonAsync } from "@app/io/fs";
import { get, set } from '@app/util/json-path';
import { CASA_DATA_DIR } from "@app/os";

const location = join(CASA_DATA_DIR, 'etc', 'casa-settings.json');

export class Settings {
    #data: { [key: string]: any }
    #location : string;

    constructor() {
        this.#data = {}
        this.#location = location;
    }

    assign(obj: { [key: string] : any }) {
        this.#data = Object.assign(this.#data, obj);
    }

    get(key: string) {
        return get(this.#data, key);
    }

    set(key: string, value: any) {
        return set(this.#data, key, value);
    }

    load(path?: string) {
        path ||= location;
        this.#location = path;

        if(!exists(this.#location)) {
            return { 
                'env': 'dev'
            }
        }

        this.#data = readJson(this.#location);
    }

    async loadAsync(path?: string) {
        path ||= location;
        this.#location = path;

        if(! await existsAsync(path)) {
            return { 
                'env': 'dev'
            }
        }

        this.#data = await readJsonAsync(this.#location);
    }

    save(path?: string) {
        let dest = path || this.#location;
        writeJson(dest, this.#data)
    }

    async saveAsync(path?: string) : Promise<void> {
        let dest = path || this.#location;
        await writeJsonAsync(dest, this.#data);
    }
}


export const settings = new Settings();
settings.load();
