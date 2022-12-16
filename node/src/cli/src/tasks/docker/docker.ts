import { exec, findExecutable } from "@app/tasks/shell";
import { SyncOptions } from "execa";

const exe = findExecutable({
    default: "docker",
    "linux": [
        "/usr/libexec/docker/cli-plugins",
    ],
    windows: [
        '%ProgramFiles%\\Docker\\Docker\\resources\\bin\\docker.exe'
    ]
});

export function docker(args: string[], options?: SyncOptions<string>) {
    if(!exe) {
        throw new Error('pwsh not found');
    }

    return exec(exe, args, options);
}