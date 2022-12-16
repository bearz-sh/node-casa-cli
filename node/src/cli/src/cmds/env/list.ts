
import { list } from '@app/env-config';
import { Argv, Arguments } from 'yargs';
import { purple, success, warning } from '@app/util/colors';
export const command = 'list'
export const describe = 'lists the available environments'
export const alias = 'ls';

export function builder(yargs: Argv) {


    return yargs;
}

export const handler = function(args: Arguments) {
    const envs = list();
    if(envs.length === 0) {
        console.log(warning('No environments found'));
        return;
    }

    envs.forEach(name => console.log(purple(name)));
}