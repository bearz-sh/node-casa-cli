import os from 'os';
import * as shell from 'shelljs';
import { join } from 'node:path';

const plat = os.platform();

export const IS_WINDOWS = plat === 'win32'; 
export const IS_DARWIN = plat === 'darwin';

let hd = os.homedir();
let ui = os.userInfo();
let uid = ui.uid;

if (!IS_WINDOWS) {
   
    if(!uid) { uid = -1 }

    if (uid === 0 && process.env['SUDO_USER']) {
        hd = `/home/${process.env['SUDO_USER']}`
    }
}




let isUserAdmin : boolean | null = null;
let isUserRoot : boolean | null = null;
let isUserElevated : boolean | null = null;

export function testUserIsAdmin() {
    if(isUserAdmin === null) {
        isUserAdmin = shell.exec("net session").code === 0;
    }

    return isUserAdmin;
}

export function testUserIsRoot() {
    if(isUserRoot === null) {
        isUserRoot = uid === 0
    }

    return isUserRoot;
}

export function testUserIsElevated() {
    if(isUserElevated === null) {
        isUserElevated = IS_WINDOWS ? 
            testUserIsAdmin() :
            testUserIsRoot(); 
    }

    return isUserElevated;
}

let etcFolder = '/etc';
let optFolder = '/opt';
let dataFolder = '/var/data';
let cacheFolder = '/var/cache';
let homeConfigFolder = join(hd, '.config');
let homeDataFolder = join(hd, 'local', '.share');
let homeCacheFolder = join(hd, '.cache');

if(IS_WINDOWS) {
    etcFolder = process.env['ALLUSERSPROFILE'] ?? "C:\\ProgramData";
    optFolder = process.env['Program Files'] ?? "C:\\Program Files";
    dataFolder = etcFolder;
    homeConfigFolder = process.env['APPDATA'] ?? `${hd}\\AppData\\Roaming`
    homeDataFolder = process.env['LOCALAPPDATA'] ??  `${hd}\\AppData\\Local`
    homeCacheFolder = homeDataFolder;
}


export const HOME = hd;
export const HOME_CONFIG_DIR = homeConfigFolder;
export const HOME_CACHE_DIR = homeCacheFolder;
export const HOME_DATA_DIR = homeDataFolder;
export const DATA_DIR = dataFolder;
export const CACHE_DIR = cacheFolder;
export const HOSTNAME = os.hostname();
export const TMP_DIR = os.tmpdir();
export const ETC_DIR = etcFolder;
export const OPT_DIR = optFolder;
export const CASA_DATA_DIR = process.env['CASA_HOME'] ?? (IS_WINDOWS ? join(dataFolder, 'casa') : join(OPT_DIR, 'casa'));