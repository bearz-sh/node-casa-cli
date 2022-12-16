import { IS_LINUX } from "@app/os";
import { SyncOptions } from "execa";
import { convertToArgs, exec as exec2, findExecutable } from "../shell";


const exe = findExecutable({
    default: "docker-compose",
    linux: [
        '/usr/libexec/docker/cli-plugins/docker-compose',
        '/usr/local/bin/docker-compose'
    ],
    windows: [
        '%ProgramFiles%\\Docker\\Docker\\resources\\bin\\docker.exe'
    ]
});

export interface IDockerComposeGlobalOptions {
    [key: string]: any
    file?: string[];
    projectName?: string;
    envFile?: string;
    verbose?: boolean;
    logLevel?: string;
    noAnsi?: boolean;
    help?: boolean;
}

export const globalKeys = [
    'files',
    'projectName',
    'envFile',
    'verbose',
    'logLevel',
    'noAnsi',
    'help'
]

export function command(args?: string[], options?: SyncOptions<string>) {
    if(!exe) {
        throw new Error('docker-compose not found on the environment path');
    }

    let fileName = exe;
    
    args = args || [];

    if (IS_LINUX && process.env["DOCKER_ROOTLESS"] !== '1') {
        fileName = 'sudo';
        args.unshift(exe);
    }

    return exec2(fileName, args, options);
}

export interface IDockerComposeUpOptions extends IDockerComposeGlobalOptions {
    detach?: boolean;
    build?: boolean;
    forceRecreate?: boolean;
    noBuild?: boolean;
    noColor?: boolean;
    noDeps?: boolean;
    noRecreate?: boolean;
    noLogsPrefix?: boolean;
    noStart?: boolean;
    quietPull?: boolean;
    removeOrphans?: boolean;
    abortOnContainerExit?: boolean;
    timeout?: number;
    recreate?: boolean;
    scale?: string;
    alwaysRecreateDeps?: boolean;
    wait?: boolean;
    renewAnonVolumes?: boolean;
}

function createCommand(cmd: string, args?: IDockerComposeGlobalOptions) {
    const prependArgs : { [key: string]: any } = {};
    args = args || {} as IDockerComposeGlobalOptions;
    globalKeys.forEach(key => { 
        if (args && args[key]) {
            // @ts-ignore
            prepend[key] = args[key];

            // @ts-ignore
            delete args[key];
        }
    });
    

    const prepend = convertToArgs(prependArgs, {});

    const append = convertToArgs(args, {});

    const splat = [...prepend, 'up', ...append];

    return splat;
}


export function up(args?: IDockerComposeUpOptions, options?: SyncOptions<string>) {
    const splat = createCommand('up', args);
    return command(splat, options);
}

export interface IDockerComposeDownOptions extends IDockerComposeGlobalOptions {
    rmi?: string;
    removeOrphans?: boolean;
    volumes?: boolean;
    timeout?: number;
}

export function down(args?: IDockerComposeDownOptions, options?: SyncOptions<string>) {
    const splat = createCommand('down', args);
    return command(splat, options);
}

export interface IDockerComposeBuildOptions extends IDockerComposeGlobalOptions {
    build?: string;
    noCache?: boolean;
    noRm?: boolean;
    pull?: boolean;
    quiet?: boolean;
    ssh?: string;
}

export function build(args?: IDockerComposeBuildOptions, options?: SyncOptions<string>) {
    const splat = createCommand('build', args);
    return command(splat, options);
}

export interface IDockerComposeTimeoutOptions extends IDockerComposeGlobalOptions {
    timeout?: number;
}

export function restart(args?: IDockerComposeTimeoutOptions, options?: SyncOptions<string>) {
    const splat = createCommand('restart', args);
    return command(splat, options);
}

export interface IDockerComposeStartOptions extends IDockerComposeGlobalOptions {

}

export function start(args?: IDockerComposeStartOptions, options?: SyncOptions<string>) {
    const splat = createCommand('start', args);
    return command(splat, options);
}

export function stop(args?: IDockerComposeTimeoutOptions, options?: SyncOptions<string>) {
    const splat = createCommand('stop', args);
    return command(splat, options);
}

export interface IDockerComposeRunOptions extends IDockerComposeGlobalOptions {
    detach?: boolean;
    env?: string[]
    label?: string[];
    name?: string;
    noDeps?: boolean;
    noRm?: boolean;
    publish?: string[];
    rm?: boolean;
    servicePorts?: boolean;
    useAliases?: boolean;
    user?: string;
    volume?: string[];
    workdir?: string;
    service: string;
    entrypoint?: string;
    command?: string;
    arguments?: string[];
}

export function run(args?: IDockerComposeTimeoutOptions, options?: SyncOptions<string>) {
    const prependArgs : { [key: string]: any } = {};
    args = args || {} as IDockerComposeGlobalOptions;
    globalKeys.forEach(key => { 
        if (args && args[key]) {
            // @ts-ignore
            prepend[key] = args[key];

            // @ts-ignore
            delete args[key];
        }
    });
    
    let service = args.service;
    delete args.service;

    let command = args.command;
    if (command) {
        delete args.command;
    }

    let argz = args.arguments;
    if (argz) {
        delete args.arguments;
    }

    //const prepend = convertToArgs(prependArgs, {});

    const append = convertToArgs(args, {});

    const splat = ['run', ...append, service];
    if(command) {
        splat.push(command);
        if(argz) 
            splat.push(...argz);
    }
    return command(splat, options);
}

export interface IDockerComposeExecOptions extends IDockerComposeGlobalOptions {
    detach?: boolean;
    env?: string[]
    index?: number;
    noTTY?: boolean;
    privileged?: boolean;
    user?: string;
    workdir?: string;
    service: string;
    command?: string;
    arguments?: string[];
}

export function exec(args?: IDockerComposeTimeoutOptions, options?: SyncOptions<string>) {
    const prependArgs : { [key: string]: any } = {};
    args = args || {} as IDockerComposeGlobalOptions;
    globalKeys.forEach(key => { 
        if (args && args[key]) {
            // @ts-ignore
            prepend[key] = args[key];

            // @ts-ignore
            delete args[key];
        }
    });
    
    let service = args.service;
    delete args.service;

    let command = args.command;
    if (command) {
        delete args.command;
    }

    let argz = args.arguments;
    if (argz) {
        delete args.arguments;
    }

    //const prepend = convertToArgs(prependArgs, {});

    const append = convertToArgs(args, {});

    const splat = ['exec', ...append, service];
    if(command) {
        splat.push(command);
        if(argz) 
            splat.push(...argz);
    }
    return command(splat, options);
}
