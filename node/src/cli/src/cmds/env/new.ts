
import { create } from '@app/env-config';
import { Argv, Arguments } from 'yargs';

export const command = 'new'
export const describe = 'creates a new environment configuratin'

export function builder(yargs: Argv) {
    yargs.option('name', {
        alias: 'n',
        describe: 'name of the environment',
        type: 'string',
        demandOption: true
    });

    yargs.option('settings-path', {
        alias: 'c',
        describe: 'path to the settings file',
        type: 'string',
        demandOption: true
    });

    yargs.option('default', {
        alias: 'd',
        describe: 'set the new environment as the default',
        type: 'boolean',
        default: false
    });

    yargs.option('secrets-path', {
        alias: 'p',
        describe: 'path to the secrets file',
        type: 'string',
        demandOption: false
    });

    return yargs;
}


export const handler = function(args: Arguments) {
    if(!args.name) {
        throw new Error('name is required');
    }

    const name = args.name as string;
    
    create(name, {
        default: args.default as boolean,
        settingsPath: args.settingsPath as string | undefined,
        secretsPath: args.secretsPath as string | undefined
    })
}