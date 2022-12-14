import { generate } from 'generate-password'
import { join } from 'path';
import { casaDataDir, HOSTNAME} from '../os/index';
import Cryptr from 'cryptr';
import { settings } from 'settings';
import { exists, readJson, writeJson } from 'io/fs';

export interface ISecretGenerationOptions {
    length?: number
    special?: boolean | string,
    digits?: boolean,
    uppercase?: boolean,
    lowercase?: boolean
}

export interface ISecretVault {

}

export function create(options?: ISecretGenerationOptions) {
    options ??= {
        length: 16,
        special: "_-#@~[]=^:;"
    }

    return generate({
        length: options.length,
        symbols: options.special,
        numbers: options.digits,
        uppercase: options.uppercase,
        lowercase: options.lowercase
    });
}

let instance : LocalSecretStore | null = null;

export class LocalSecretStore {

    #secrets : { [key : string] : string | undefined | null }
    #file : string;
    #cryptr : Cryptr;

    constructor() {
        this.#secrets = {};
        let etcDir = join(casaDataDir, 'etc');
        this.#file = join(etcDir, "secrets", `${HOSTNAME}.secrets.json`);

        let key = settings.get('secrets.key') as string;
        
        if(!key) {
            key = create({ length: 16});
            settings.set("secrets.key", key);
            settings.save();
        }
   
        this.#cryptr = new Cryptr(key);
        
    }

    static get instance() {
        if(instance === null)
            instance = new LocalSecretStore();

        return instance;
    }

    load() {
        if (exists(this.#file)) {
            this.#secrets = readJson(this.#file);
        }
    }

    has(key: string) {
        let value = this.#secrets[key]
        return value !== null && typeof(value) === 'string';
    }

    get(key: string) {
        let value = this.#secrets[key];
        if (value === null || typeof(value) === 'undefined') {
            return null;
        }
        
        return this.#cryptr.decrypt(value);
    }

    set(key: string, secret: string) {
        this.#secrets[key] = this.#cryptr.encrypt(secret);
        writeJson(this.#file, this.#secrets);
    }
}