import { exists, readJson, writeJson  } from "@app/io/fs";
import { join } from "node:path";
import { CASA_DATA_DIR  } from "@app/os";
import { settings  } from "@app/settings";
import { encryptor } from '@app/secrets'
import { IConfigStore, IConfiguration, IEnvironmentConfig, IEnvironmentCreationOptions } from "./interfaces";
import { JsonConfigStore } from "./json-store";
import { YamlConfigStore } from "./yaml-store";
import { DotEnvConfigStore } from "./dotenv-store";
import * as jp from "@app/util/json-path";
import { readdirSync } from "node:fs";

export const configStoreRegistry = new Map<string, Function>();

configStoreRegistry.set("json", JsonConfigStore);
configStoreRegistry.set("yaml", YamlConfigStore);
configStoreRegistry.set("dotenv", DotEnvConfigStore);


export function get() {
    if(process.env["CASA_ENV"]) {
        return process.env["CASA_ENV"] as string;
    }

    let env = settings.get("env.name") as string | undefined;
    if(!env) {
        env = "dev"
    }

    return env;
}

export class Config implements IConfiguration {
    #options: IEnvironmentConfig
    #data : { [key: string] : any } = {};


    constructor(options: IEnvironmentConfig) {
        const data : { [key: string] : any } = {};

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
        
        const cipher = encryptor();
        let secrets = options.secrets;
        for (let k in secrets) {
            let v = secrets[k];
            if(typeof v === 'string') {
                secrets[k] = cipher.decrypt(v);
            }
        }

        jp.merge(data, secrets);
        this.#options = options;
        this.#data = data;
    }

    async loadAsync() {
        this.#options.configStores.forEach(async (store) => {
            if(!configStoreRegistry.has(store.kind)) {
                throw new Error(`Unknown config store type: ${store.kind}`);
            }

            let storeClass = configStoreRegistry.get(store.kind);
             

            let storeInstance = Object.create(storeClass!.prototype) as IConfigStore;
            storeInstance.constructor.apply(storeInstance, [store]);

            let data = await storeInstance.getModelAsync();
            this.#data = jp.merge(this.#data, data);
        })
    }

    get(key: string) {
        return this.#data[key];
    }

}

export async function loadAsync(env?: string) : Promise<IConfiguration> {
    let etcDir = join(CASA_DATA_DIR, 'etc', 'environment');
    let configFile = join(etcDir, `${env || get()}.json`);

    if (!exists(configFile)) {
        throw new Error (`Configuration file does not exist at ${configFile}. Please create a new environment.`);
    }

    let configData = readJson(configFile) as IEnvironmentConfig;
    let config = new Config(configData);
    await config.loadAsync();

    return config;
}

export function set(name: string) {
    let etcDir = join(CASA_DATA_DIR, 'etc', 'environment');
    let configFile = join(etcDir, `${name}.json`);

    if (!exists(configFile)) {
        throw new Error (`Configuration for ${name} does not exist at ${configFile}. Please create a new environment.`);
    }

    settings.set('env.name', name); 
    settings.set('env.file', configFile);
}

export function importSettings(data: { [key: string] : any }, env?: string) {
    let etcDir = join(CASA_DATA_DIR, 'etc', 'environment');
    let configFile = join(etcDir, `${env || get()}.json`);

    if (!exists(configFile)) {
        throw new Error (`Configuration file does not exist at ${configFile}. Please create a new environment.`);
    }

    let config = readJson(configFile) as IEnvironmentConfig;
    config.settings = jp.merge(config.settings, data);
    writeJson(configFile, config);
}

export function setSettingValue(name: string, value: any, env?: string) {
    let etcDir = join(CASA_DATA_DIR, 'etc', 'environment');
    let configFile = join(etcDir, `${env || get()}.json`);

    if (!exists(configFile)) {
        throw new Error (`Configuration file does not exist at ${configFile}. Please create a new environment.`);
    }

    let config = readJson(configFile) as IEnvironmentConfig;
    if (jp.set(config, name, value))
    {
        writeJson(configFile, config);
        return true;
    }

    return false;
}

export function removeSettingValue(name: string, env?: string) {
    let etcDir = join(CASA_DATA_DIR, 'etc', 'environment');
    let configFile = join(etcDir, `${env || get()}.json`);

    if (!exists(configFile)) {
        throw new Error (`Configuration file does not exist at ${configFile}. Please create a new environment.`);
    }

    let config = readJson(configFile) as IEnvironmentConfig;
    if (jp.remove(config, name))
    {
        writeJson(configFile, config);
        return true;
    }
    
    return false;
}

export function getSettingValue(name: string, value: any, env?: string) {
    let etcDir = join(CASA_DATA_DIR, 'etc', 'environment');
    let configFile = join(etcDir, `${env || get()}.json`);

    if (!exists(configFile)) {
        throw new Error (`Configuration file does not exist at ${configFile}. Please create a new environment.`);
    }

    let config = readJson(configFile) as IEnvironmentConfig;
    return jp.get(config.settings, name);
}

export function listSettingNames(env?: string) {
    let etcDir = join(CASA_DATA_DIR, 'etc', 'environment');
    let configFile = join(etcDir, `${env || get()}.json`);

    if (!exists(configFile)) {
        throw new Error (`Configuration file does not exist at ${configFile}. Please create a new environment.`);
    }

    let config = readJson(configFile) as IEnvironmentConfig;

    return Object.keys(config.settings);
}

export function importSecrets(data: { [key: string] : any }, env?: string) {
    let etcDir = join(CASA_DATA_DIR, 'etc', 'environment');
    let configFile = join(etcDir, `${env || get()}.json`);

    if (!exists(configFile)) {
        throw new Error (`Configuration file does not exist at ${configFile}. Please create a new environment.`);
    }

    let config = readJson(configFile) as IEnvironmentConfig;
    const cipher = encryptor();
    const secrets = data;
    for (let k in secrets) {
        let v = secrets[k];
        if(typeof v === 'string') {
            secrets[k] = cipher.encrypt(v);
        }
    }
    config.secrets = jp.merge(config.secrets, secrets);
    writeJson(configFile, config);
}

export function setSecretValue(name: string, value: string, env?: string) {
    let etcDir = join(CASA_DATA_DIR, 'etc', 'environment');
    let configFile = join(etcDir, `${env || get()}.json`);

    if (!exists(configFile)) {
        throw new Error (`Configuration file does not exist at ${configFile}. Please create a new environment.`);
    }

    let config = readJson(configFile) as IEnvironmentConfig;
    config.secrets[name] = encryptor().encrypt(value);
    writeJson(configFile, config);
    return true;
}

export function removeSecretValue(name: string, env?: string) {
    let etcDir = join(CASA_DATA_DIR, 'etc', 'environment');
    let configFile = join(etcDir, `${env || get()}.json`);

    if (!exists(configFile)) {
        throw new Error (`Configuration file does not exist at ${configFile}. Please create a new environment.`);
    }

    let config = readJson(configFile) as IEnvironmentConfig;
    if (delete config.secrets[name]) {
        writeJson(configFile, config);
        return true;
    }
   
    return false;
}

export function getSecretValue(name: string, env?: string) {
    let etcDir = join(CASA_DATA_DIR, 'etc', 'environment');
    let configFile = join(etcDir, `${env || get()}.json`);

    if (!exists(configFile)) {
        throw new Error (`Configuration file does not exist at ${configFile}. Please create a new environment.`);
    }

    let config = readJson(configFile) as IEnvironmentConfig;
    return encryptor().decrypt(config.secrets[name]);
}

export function listSecretNames(env?: string) {
    let etcDir = join(CASA_DATA_DIR, 'etc', 'environment');
    let configFile = join(etcDir, `${env || get()}.json`);

    if (!exists(configFile)) {
        throw new Error (`Configuration file does not exist at ${configFile}. Please create a new environment.`);
    }

    let config = readJson(configFile) as IEnvironmentConfig;

    return Object.keys(config.secrets);
}

export function list() {
    let etcDir = join(CASA_DATA_DIR, 'etc', 'environment');
    if(!exists(etcDir)) {
        return [];
    }

    let files = readdirSync(etcDir);
    return files.map(f => f.replace('.json', ''));
}

export function create(name: string, options?: IEnvironmentCreationOptions) {
    let etcDir = join(CASA_DATA_DIR, 'etc', 'environment');
    let configFile = join(etcDir, `${name}.json`);

    if (exists(configFile)) {
        throw new Error(`Env ${name} already exists`);
    }

    options ||= {}

    let secrets : { [key: string] : string} = {};
    let settings : { [key: string] : any } = {};

    if (options.settingsPath) {
        exists(options.settingsPath, true);
        var settingsFromFile = readJson(options.settingsPath) as { [key: string] : any }
        settings = Object.assign(settings, settingsFromFile);
    }

    if (options.secretsPath) {
        exists(options.secretsPath, true);
        var secretsFromFile = readJson(options.secretsPath) as { [key: string] : string };
        secrets = Object.assign(secrets, secretsFromFile);
    }

    if (options.settings) {
        settings = Object.assign(settings, options.settings);
    }

    if (options.secrets) {
        secrets = Object.assign(secrets, options.secrets);
    }

    const cipher = encryptor();
    for(var key in secrets) {
        secrets[key] = cipher.encrypt(secrets[key])
    }

    let config : IEnvironmentConfig = {
        name: name,
        configStores: [],
        secrets: secrets,
        settings: settings
    };

    writeJson(configFile, config);
}