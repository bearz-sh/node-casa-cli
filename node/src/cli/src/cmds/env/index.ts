
import { Argv, Arguments } from 'yargs';
import * as newCommand from './new';
import * as getCommand from './get';
import * as setCommand from './set';
import * as listCommand from './list';
import * as settingsCommand from './settings';
import * as secretsCommand from './secrets';

export const command = 'env'
export const describe = 'manages environment configuration'

export function builder(yargs: Argv) {
    yargs.command(newCommand);
    yargs.command(getCommand);
    yargs.command(setCommand);
    yargs.command(listCommand);
    yargs.command(settingsCommand);
    yargs.command(secretsCommand);
    return yargs;
}


export const handler = function(args: Arguments) {
}