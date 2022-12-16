import { SyncOptions } from "execa";
import { exec, execAsync, findExecutable, getRandomShellFile } from "@app/tasks/shell";
import { NEW_LINE, removeFile, removeFileAsync, writeText, writeTextAsync } from "@app/io/fs";
import { IS_WINDOWS } from "@app/os";

const exe = findExecutable({
    default: "bash",
    windows: [
        '%SystemRoot%\\System32\\bash.exe',
        '%ProgramFiles%\\bash\\user\\bin\\bash.exe',
        '%ChocolateyInstall%\\msys2\\usr\\bin\\bash.exe',
        '%SystemDrive%\\msys64\\usr\\bin\\bash.exe',
        '%SystemDrive%\\msys\\usr\\bin\\bash.exe',
    ]
});

export function bash(args: string[], options?: SyncOptions<string>) {
    if(!exe) {
        throw new Error('pwsh not found');
    }
    return exec(exe, args, options);
}

export async function bashAsync(args: string[], options?: SyncOptions<string>) {
    if(!exe) {
        throw new Error('pwsh not found');
    }
    return await execAsync(exe, args, options);
}

export function bashScript(script: string, options?: SyncOptions<string>) {
    let fileName = '';
    try {
        const encoder = new TextEncoder();

        let fileName = getRandomShellFile();
        fileName += '.sh';
        const args = [];

        let bashFile = fileName;

        // wsl bash doesn't handle windows style paths, it uses a mount.
        // git bash does handle windows style paths.
        if (IS_WINDOWS && exe?.toLowerCase() === 'c:\\windows\\system32\\bash.exe') {
            bashFile = '/mnt/' + 'c' + bashFile.substring(1)?.replace('\\', '/').replace(':', '');
        }

        args.push('-noprofile', '--norc', '-e', '-o', 'pipefail', `'${bashFile}'`);
        writeText(fileName, encoder.encode(script));
        return bash(args, options);
    } finally {
        if (fileName.length > 0) {
            removeFile(fileName);
        }
    }
}

export async function bashScriptAsync(script: string, options?: SyncOptions<string>) {
    let fileName = '';
    try {
        const encoder = new TextEncoder();

        let fileName = getRandomShellFile();
        fileName += '.sh';
        const args = [];

        let bashFile = fileName;

        // wsl bash doesn't handle windows style paths, it uses a mount.
        // git bash does handle windows style paths.
        if (IS_WINDOWS && exe?.toLowerCase() === 'c:\\windows\\system32\\bash.exe') {
            bashFile = '/mnt/' + 'c' + bashFile.substring(1)?.replace('\\', '/').replace(':', '');
        }

        args.push('-noprofile', '--norc', '-e', '-o', 'pipefail', `'${bashFile}'`);
        await writeTextAsync(fileName, encoder.encode(script));
        return await bashAsync(args, options);
    } finally {
        if (fileName.length > 0) {
            await removeFileAsync(fileName);
        }
    }
}