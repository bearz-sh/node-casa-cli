import { exists, readJson, writeJson } from "@app/io/fs";
import { FileConfigStore } from "./config-store";
import { IJsonConfigStoreOptions } from "./interfaces";

export class JsonConfigStore extends FileConfigStore 
{
    constructor(options: IJsonConfigStoreOptions) {
        super(options);
    }

    override get options(): IJsonConfigStoreOptions {
        return super.options as IJsonConfigStoreOptions
    }

    protected override save(): void {
        if(this.options.data) {
            return;
        }

        writeJson(this.options.path, this.toJson())
    }

    protected override load(): { [key: string]: any; } {
        if(this.options.data) {
            return this.options.data;
        }

        exists(this.options.path, true);
        return readJson(this.options.path);
    }
}