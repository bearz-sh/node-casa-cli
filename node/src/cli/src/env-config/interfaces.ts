
export interface IEnvironmentCreationOptions {
    default?: boolean,
    settingsPath?: string,
    secretsPath?: string,
    settings?: { [key: string]: any }
    secrets?: { [key: string] : string }
}

export interface IEnvironmentConfig {
    name: string
    configStores: IConfigStoreOptions[]
    secrets: { [key: string] : string }
    settings: { [key: string] : string }
}

export interface IConfiguration {
    get(key: string) : string | undefined
}

export interface IConfigStoreOptions {
    name: string 
    kind: string
}

export interface IConfigStore {
    get(key: string) : any

    getAsync(key: string) : Promise<any>

    listAsync() : Promise<string[]>

    list() : string[]

    getModelAsync() : Promise<{ [key: string] : any }>

    set(key: string, value: any) : void 

    setAsync(key: string, value: any) : Promise<any>

    delete(key: string) : boolean

    deleteAsync(key: string) : Promise<boolean>

    toJson() : { [key: string] : any }
}

export interface IFileConfigStoreOptions extends IConfigStoreOptions {
    path: string | URL
}

export interface IJsonConfigStoreOptions extends IFileConfigStoreOptions {
    data?: { [ key : string ] : any }
}

export interface IYamlConfigStoreOptions extends IFileConfigStoreOptions {
}

export interface IDotEnvConfigStoreOptions extends IFileConfigStoreOptions {
    delimiter?: string
    
}