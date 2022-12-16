import { exists, readYaml, writeYaml } from "@app/io/fs";
import { FileConfigStore } from "./config-store";
import { IDotEnvConfigStoreOptions } from "./interfaces";

export class DotEnvConfigStore extends FileConfigStore 
{
    constructor(options: IDotEnvConfigStoreOptions) {
        super(options);
    }

    override get options(): IDotEnvConfigStoreOptions {
        return super.options as IDotEnvConfigStoreOptions
    }

    protected override save(): void {

        writeYaml(this.options.path, this.toJson())
    }

    protected override load(): { [key: string]: any; } {
        exists(this.options.path, true);
        return readYaml(this.options.path);
    }
}