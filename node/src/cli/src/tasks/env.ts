import { expandTemplate } from '@app/hbs';
import { exists, mkdir } from '@app/io/fs';
import { CASA_DATA_DIR } from '@app/os/index';
import { dirname, join } from 'path';
import { settings } from '@app/settings'

export function get() {
    return settings.get('env') as string | undefined;
}

export function set(name: string) {
    return settings.set('env', name);
}

export function create(name: string, data: { [key: string] : any }, template?: string, isDefault = false) {
    template ||= "../../tpl/.env.hbs";
    let dest=  join(CASA_DATA_DIR, 'etc', `${name}.env`);
    let dir = dirname(dest)
    if (!exists(dir)) {
        mkdir(dir, {recursive: true});
    }

    expandTemplate(data, template, dest);

    if(isDefault) {
        set(name);
    }
}