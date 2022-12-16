
import { setSecretValue } from '@app/env-config';
import { Argv, Arguments } from 'yargs';
import { success } from '@app/util/colors';
export const command = 'set <name> <value>'
export const describe = 'set a secret for an environment configuration'

export function builder(yargs: Argv) {
    yargs.positional('name', {
        alias: 'n',
        describe: 'name of the secret',
        type: 'string',
        demandOption: true
    });

    yargs.positional('value', {
        alias: 'v',
        describe: 'value of the secret',
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
    if (setSecretValue(args.name as string, args.value as string, args.env as string | undefined)) {
        console.log(success(`Secret ${args.name} set`));
    }
    
}