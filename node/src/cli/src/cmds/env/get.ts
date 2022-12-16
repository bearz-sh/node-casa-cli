
import { get } from '@app/tasks/env';
import { Argv, Arguments } from 'yargs';

export const command = 'get'
export const describe = 'gets the name of the current configuration'

export function builder(yargs: Argv) {
    return yargs;
}

export const handler = function(args: Arguments) {
    console.log(get());
}