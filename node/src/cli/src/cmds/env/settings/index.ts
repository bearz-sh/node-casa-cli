
import { Argv, Arguments } from 'yargs';
import * as getCommand from './get';
import * as setCommand from './set';
import * as listCommand from './list';
import * as removeCommand from './remove';

export const command = 'settings'
export const describe = 'manages settings for the environment configuration'

export function builder(yargs: Argv) {
    yargs.command(getCommand);
    yargs.command(setCommand);
    yargs.command(listCommand);
    yargs.command(removeCommand);
    return yargs;
}


export const handler = function(args: Arguments) {
}