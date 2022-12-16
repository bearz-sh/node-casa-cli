import { exists, readYaml, writeYaml } from "@app/io/fs";
import { FileConfigStore } from "./config-store";
import { IYamlConfigStoreOptions } from "./interfaces";

export class YamlConfigStore extends FileConfigStore 
{
    constructor(options: IYamlConfigStoreOptions) {
        super(options);
    }

    override get options(): IYamlConfigStoreOptions {
        return super.options as IYamlConfigStoreOptions
    }

    protected override save(): void {

        writeYaml(this.options.path, this.toJson())
    }

    protected override load(): { [key: string]: any; } {
        exists(this.options.path, true);
        return readYaml(this.options.path);
    }
}