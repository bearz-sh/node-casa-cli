import { expandTemplate } from "@app/hbs";
import { cat, copyFile, exists, IFileInfo, mkdir, readDotEnv, walkDir, writeText } from "@app/o/fs";
import { execaSync as exec } from "execa";
import { dirname, join } from "node:path";
import { CASA_DATA_DIR, IS_WINDOWS } from "@app/os/index";
import { settings } from '@app/settings';
import * as jp from '@app/util/json-path';

function expandData(app: string, env: string, envFiles: string[]) {
    let envData = readDotEnv(...envFiles) as { [key: string]: any };
    let data : { [key: string]:  any } = {}

    for(var key in envData) {
        let value = envData[key];
        data[key] = value;

        if(value === "true" || value === "false") {
            value = new Boolean(value).valueOf();
        } else if(typeof (value) === 'string') {
            if(!value.includes('.')) {
                let n = parseInt(value);
                if(!isNaN(n)) {
                    value = n;
                }
            }
        }

        jp.set(data, key.toLowerCase(), value, '_');
    }

    data['app'] = {
        "id": app,
        "ref": `${env}-${app}` 
    }

    return data;
}

export function expandTemplateDirectory(
    app: string,
    src?: string, 
    dest?: string, 
    env?: string | null, 
    force = false) {

    if(!env) {
        env = settings.get("env") as string;
    }

    const appId = `${env}-${app}`;
    src ||= join(CASA_DATA_DIR, 'docker', 'templates', app);
    dest ||= join(CASA_DATA_DIR, 'docker', 'apps', appId);

    let casaHome = CASA_DATA_DIR
    let etcDir = join(casaHome, 'etc');
    let envFile = join(etcDir, `${env}.env`);
    let data : { [key: string] : any } = {};

    if (exists(dest)) {
        mkdir(dest, { recursive: true})
    }

    let templates : IFileInfo[] = [];
    let envTemplates : IFileInfo[] = [];

    var set = walkDir(src).forEach(o => {
        if(o.dir) {
           return
        }

        if (o.base === src && o.name.endsWith(".env.hbs")) {
            envTemplates.push(o);
            return
        }

        if(o.name.endsWith(".hbs")) {
            templates.push(o);
        }

        let targetDest = join(dest!, o.rel)

        if (!exists(targetDest) || force) {
            let dir  = dirname(targetDest)

            if(!exists(dir)) {
                mkdir(dir, { recursive: true})
            }

            copyFile(o.path, targetDest);
        }
    });

    
    var filesToLoad = [envFile];
    data = expandData(app, env, filesToLoad);

    envTemplates.forEach(file => {
        let targetDest = join(dest!, file.rel.substring(0, file.rel.length - 4))
        console.log(targetDest);
        expandTemplate(data, file.path, targetDest);

        filesToLoad.push(targetDest);
    });

    data = expandData(app, env, filesToLoad);

    console.log(data);
    templates.forEach(file => {
        if(file.rel[0] === '/' || file.rel[0] === '\\') {
            file.rel = file.rel.substring(1)
        }
        
        let targetDest = join(dest!, file.rel.substring(0, file.rel.length - 4));

        let dir = dirname(targetDest);

        if (!exists(dir)) {
            mkdir(dir, {recursive: true});
        }

        console.log(targetDest);
        expandTemplate(data, file.path, targetDest);
    })
    
    let content = cat(...filesToLoad);

    writeText(join(dest, 'compile.env'), content);
}

export function log(app: string, env?: string) {
    if(!env) {
        env = settings.get("env") as string;
    }

    const appRef = `${env}-${app}`;


    let cmd = 'docker';
    let splat = ['log', appRef]
    if(!IS_WINDOWS) {
        cmd = 'sudo'
        splat.unshift('docker');
    }

    return exec(cmd, splat, { stdio: 'inherit' });
}

export function up(app: string, env?: string, expand = false, force = false) {
    if(!env) {
        env = settings.get("env") as string;
    }

    const appRef = `${env}-${app}`;
    const templateDir = join(CASA_DATA_DIR, 'docker', 'templates', app);
    const appDir = join(CASA_DATA_DIR, 'docker', 'apps', appRef);


    if(expand) {
        expandTemplateDirectory(app, templateDir, appDir, env, force)
    }

    let cmd = 'docker';
    let splat = ['compose', '-f', join(appDir, 'docker-compose.yml'), '--project-name', appRef]
    if(!IS_WINDOWS) {
        cmd = 'sudo'
        splat.unshift('docker');
    }

    let envFile = join(appDir, '.env');
    if (exists(envFile)) {
        splat.push('--env-file', envFile);
    }

    splat.push('up', '--no-recreate', '--wait')

    return exec(cmd, splat,  { stdio: 'inherit' })
}

export function down(app: string, env?: string) {
    if(!env) {
        env = settings.get("env") as string;
    }

    const appRef = `${env}-${app}`;
    const appDir = join(CASA_DATA_DIR, 'docker', 'apps', appRef);

    let cmd = 'docker';
    let splat = ['compose', '-f', join(appDir, 'docker-compose.yml'), '--project-name', appRef]
    if(!IS_WINDOWS) {
        cmd = 'sudo'
        splat.unshift('docker');
    }

    let envFile = join(appDir, '.env');
    if (exists(envFile)) {
        splat.push('--env-file', envFile);
    }

    splat.push('down')

    return exec(cmd, splat,  { stdio: 'inherit' })
}

export function restart(app: string, env?: string) {

    const appRef = `${env}-${app}`;
    const appDir = join(CASA_DATA_DIR, 'docker', 'apps', appRef);

    let cmd = 'docker';
    let splat = ['compose', '-f', join(appDir, 'docker-compose.yml'), '--project-name', appRef]
    if(!IS_WINDOWS) {
        cmd = 'sudo'
        splat.unshift('docker');
    }

    let envFile = join(appDir, '.env');
    if (exists(envFile)) {
        splat.push('--env-file', envFile);
    }

    splat.push('restart')

    return exec(cmd, splat,  { stdio: 'inherit' })
}

export function stop(app: string, env?: string) {
    if(!env) {
        env = settings.get("env") as string;
    }

    const appRef = `${env}-${app}`;
    const appDir = join(CASA_DATA_DIR, 'docker', 'apps', appRef);

    let cmd = 'docker';
    let splat = ['compose', '-f', join(appDir, 'docker-compose.yml'), '--project-name', appRef]
    if(!IS_WINDOWS) {
        cmd = 'sudo'
        splat.unshift('docker');
    }

    let envFile = join(appDir, '.env');
    if (exists(envFile)) {
        splat.push('--env-file', envFile);
    }

    splat.push('stop')

    return exec(cmd, splat,  { stdio: 'inherit' })
}

export function start(app: string, env?: string) {
    if(!env) {
        env = settings.get("env") as string;
    }

    const appRef = `${env}-${app}`;
    const appDir = join(CASA_DATA_DIR, 'docker', 'apps', appRef);

    let cmd = 'docker';
    let splat = ['compose', '-f', join(appDir, 'docker-compose.yml'), '--project-name', appRef]
    if(!IS_WINDOWS) {
        cmd = 'sudo'
        splat.unshift('docker');
    }

    let envFile = join(appDir, '.env');
    if (exists(envFile)) {
        splat.push('--env-file', envFile);
    }

    splat.push('restart')

    return exec(cmd, splat,  { stdio: 'inherit' })
}