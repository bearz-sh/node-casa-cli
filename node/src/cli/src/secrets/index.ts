import { generate } from 'generate-password'
import { join } from 'path';
import { CASA_DATA_DIR, HOSTNAME} from '@app/os';
import Cryptr from 'cryptr';
import { settings } from '@app/settings';
import { exists, readJson, writeJson } from '@app/io/fs';

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


export interface IEncryptor {
    encrypt(value: string) : string

    decrypt(value: string) : string 
}

export class AesGcmEncryptor implements IEncryptor {
    #cryptr : Cryptr

    constructor() {
        let key = process.env["CASA_SECRETS_KEY"]
        
        if(!key) {
            key = settings.get("secrets.key");
        }

        if (!key) {
            key = create({ length: 16});
            settings.set("secrets.key", key);
            settings.save();
        }
   
        this.#cryptr = new Cryptr(key);
    }

    encrypt(value: string): string {
        return this.#cryptr.encrypt(value);
    }

    decrypt(value: string) : string {
        return this.#cryptr.decrypt(value);
    }
}

let decryptor : IEncryptor | null = null;

export function encryptor() : IEncryptor {
    if (!decryptor) {
        decryptor = new AesGcmEncryptor();
    }

    return decryptor;
}

export class MemorySecretStore {
    #secrets: { [key: string] : string }
    #cipher: IEncryptor

    constructor(secrets: ({ [key: string] : string }), encrypted = true, cipher?: IEncryptor) {
        let local = secrets;
        cipher ||= encryptor();
        this.#cipher = cipher;

        if (!encrypted) {
            for(var key in secrets) {
                local[key] = this.#cipher.encrypt(secrets[key]); 
            }
        }

        this.#secrets = local;
    }

    toJson() {
        return this.#secrets;
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
        
        return this.#cipher.decrypt(value);
    }

    set(key: string, secret: string) {
        this.#secrets[key] = this.#cipher.encrypt(secret);
    }
}

