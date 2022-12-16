import { SyncOptions } from "execa";
import { exec, execAsync, findExecutable, getRandomShellFile } from "@app/tasks/shell";
import { NEW_LINE, removeFile, removeFileAsync, writeText } from "@app/io/fs";

const exe = findExecutable({
    default: "pwsh",
    windows: [
        '%ProgramFiles%/PowerShell/7/pwsh.exe',
        '%ProgramFiles(x86)%/PowerShell/7/pwsh.exe',
        '%ProgramFiles%/PowerShell/6/pwsh.exe',
        '%ProgramFiles(x86)%/PowerShell/6/pwsh.exe'
    ]
});

export function pwsh(args: string[], options?: SyncOptions<string>) {
    if(!exe) {
        throw new Error('pwsh not found');
    }
    return exec(exe, args, options);
}

export async function pwshAsync(args: string[], options?: SyncOptions<string>) {
    if(!exe) {
        throw new Error('pwsh not found');
    }
    return await execAsync(exe, args, options);
}

export function pwshScript(script: string, options?: SyncOptions<string>) {
    let fileName = '';
    try {
        const encoder = new TextEncoder();

        let fileName = getRandomShellFile();
        fileName += '.ps1';
        const nl = NEW_LINE;

        const prepend = '$ErrorActionPreference = \'Stop\'';
        const append = `if ((Test-Path -LiteralPath variable:\\LASTEXITCODE)) { exit $LASTEXITCODE }`;
        const scriptContent = prepend + nl + script + nl + append;
        writeText(fileName, encoder.encode(scriptContent));
        const args = [];
        args.push('-ExecutionPolicy', 'Bypass', '-NoLogo', '-NoProfile', '-NonInteractive', '-Command');
        args.push(`. '${fileName}'`);
        return pwsh(args, options);
    } finally {
        if (fileName.length > 0) {
            removeFile(fileName);
        }
    }
}

export async function pwshScriptAsync(script: string, options?: SyncOptions<string>) {
    let fileName = '';
    try {
        const encoder = new TextEncoder();

        let fileName = getRandomShellFile();
        fileName += '.ps1';
        const nl = NEW_LINE;

        const prepend = '$ErrorActionPreference = \'Stop\'';
        const append = `if ((Test-Path -LiteralPath variable:\\LASTEXITCODE)) { exit $LASTEXITCODE }`;
        const scriptContent = prepend + nl + script + nl + append;
        writeText(fileName, encoder.encode(scriptContent));
        const args = [];
        args.push('-ExecutionPolicy', 'Bypass', '-NoLogo', '-NoProfile', '-NonInteractive', '-Command');
        args.push(`. '${fileName}'`);
        return await pwshAsync(args, options);
    } finally {
        if (fileName.length > 0) {
            await removeFileAsync(fileName);
        }
    }
}