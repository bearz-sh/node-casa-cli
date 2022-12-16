
import { set } from '@app/tasks/env';
import { Argv, Arguments } from 'yargs';

export const command = 'set <name>'
export const describe = 'sets the default configuration'

export function builder(yargs: Argv) {
    yargs.positional('name', {
        alias: 'n',
        describe: 'name of the environment',
        type: 'string',
        demandOption: true
    })
    return yargs;
}

export const handler = function(args: Arguments) {
    console.log(set(args.name as string));
}