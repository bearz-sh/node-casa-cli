
import {  removeSecretValue } from '@app/env-config';
import { Argv, Arguments } from 'yargs';
import { success, warning } from '@app/util/colors';
export const command = 'remove <name>'
export const describe = 'removes a secret from an environment configuration'
export const alias = 'rm';

export function builder(yargs: Argv) {
    yargs.positional('name', {
        alias: 'n',
        describe: 'name of the secret',
        type: 'string',
        demandOption: true
    });

    yargs.option('env', {
        alias: 'e',
        describe: 'name of the environment',
        type: 'string',
        demandOption: false
    });

    return yargs;
}

export const handler = function(args: Arguments) {
    if (removeSecretValue(args.name as string, args.env as string | undefined)) {
        console.log(success(`Secret ${args.name} set`));
    } else {
        console.log(warning(`Secret ${args.name} not found`));
    }
}