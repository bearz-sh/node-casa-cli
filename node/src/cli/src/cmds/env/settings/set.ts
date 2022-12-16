
import { setSettingValue } from '@app/tasks/env';
import { Argv, Arguments } from 'yargs';
import { success } from '@app/util/colors';
export const command = 'set <name> <value>'
export const describe = 'set a setting for an environment configuration'

export function builder(yargs: Argv) {
    yargs.positional('name', {
        alias: 'n',
        describe: 'name of the setting',
        type: 'string',
        demandOption: true
    });

    yargs.positional('value', {
        alias: 'v',
        describe: 'value of the setting',
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
    let value = args.value;
    if (typeof value === 'string') {
        if(value === 'true') {
            value = true;
        }
        if(value === 'false') {
            value = false;
        }

        if(!isNaN(Number(value))) {
            value = Number(value);
        }
    }

    if (setSettingValue(args.name as string, args.value, args.env as string | undefined)) {
        console.log(success(`Setting ${args.name} set`));
    }
}