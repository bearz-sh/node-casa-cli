
import { getSecretValue } from '@app/tasks/env';
import { purple, error } from '@app/util/colors';
import chalk from 'chalk';
import { Argv, Arguments } from 'yargs';

export const command = 'get <name>'
export const describe = 'get a secret value for an environment configuration'

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
    const value = getSecretValue(args.name as string, args.env as string | undefined);
    if(!value) {
        console.log(error(`Secret ${chalk.bold(args.name)} not found`));
        return;
    }

    console.log(purple(value))
}