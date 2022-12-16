
import { listSecretNames } from '@app/tasks/env';
import { Argv, Arguments } from 'yargs';
import { purple } from '@app/util/colors';
export const command = 'list'
export const describe = 'lists the name of secrets for an environment configuration'
export const alias = 'ls';

export function builder(yargs: Argv) {

    yargs.option('env', {
        alias: 'e',
        describe: 'name of the environment',
        type: 'string',
        demandOption: false
    });

    return yargs;
}

export const handler = function(args: Arguments) {
    listSecretNames(args.env as string | undefined).forEach(name => console.log(purple(name)));
}