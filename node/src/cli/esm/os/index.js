import os from 'os';
import * as shell from 'shelljs';
import { join } from 'node:path';
const plat = os.platform();
export const isWindows = plat === 'win32';
export const isDarwin = plat === 'darwin';
export const homeDir = os.homedir();
export const hostname = os.hostname();
let isUserAdmin = null;
let isUserRoot = null;
let isUserElevated = null;
export function testUserIsAdmin() {
    if (isUserAdmin === null) {
        isUserAdmin = shell.exec("net session").code === 0;
    }
    return isUserAdmin;
}
export function testUserIsRoot() {
    if (isUserRoot === null) {
        let uid = -1;
        if (typeof process !== 'undefined') {
            // @ts-ignore
            uid = process.geteuid();
            if (typeof (uid) === 'undefined') {
                uid = -1;
            }
        }
        isUserRoot = uid === 0;
    }
    return isUserRoot;
}
export function testUserIsElevated() {
    if (isUserElevated === null) {
        isUserElevated = isWindows ?
            testUserIsAdmin() :
            testUserIsRoot();
    }
    return isUserElevated;
}
let etcFolder = "/etc/casa";
let homeConfig = join(homeDir, '.config', 'casa');
let defaultInstallLocation = "/opt/casa";
if (isWindows) {
    let pd = process.env['ALLUSERSPROFILE'] ?? "C:\\ProgramData";
    etcFolder = join(pd, "casa", "etc");
    homeConfig = join(process.env['USERPROFILE'] ?? `${homeDir}\\AppData\\Roaming`, 'casa', 'etc');
    defaultInstallLocation = join(pd, "casa");
}
export const casaEtcDir = etcFolder;
export const casaHomeConfigDir = homeConfig;
export const casaInstallDir = defaultInstallLocation;
