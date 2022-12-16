import { CommandModule } from 'yargs';
import * as envCommand from './env/index';

export const commands = [
    envCommand as CommandModule<{}, {}>
];