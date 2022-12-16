import { IS_WINDOWS } from 'os/index';
import { readText, writeText, NEW_LINE } from 'io/fs';

let hostFile = "/etc/hosts";
let newline = "\n"
if(IS_WINDOWS) {
    let winDir = process.env['WinDir'] ?? "C:\\Windows";
    hostFile = `${winDir}\\System32\\drivers\\etc\\hosts`
    newline = "\r\n";
}

export function addHostEntry(cname: string, ip: string) {

    if(cname === null || cname.trim().length == 0) {
        throw Error("cname must not be null or empty");
    }

    if(ip === null || ip.trim().length == 0) {
        throw Error("cname must not be null or empty");
    }


    let content = readText(hostFile);
    let lines = content.split(newline);
    let hasEntry = false;
    for(var line of lines) {
        if(line.startsWith("#")) {
            continue;
        }

        var parts = line.split(' ').filter(o => o.trim().length > 0);
        if(parts.length === 2) {
            if(parts[0] === ip && parts[1] === cname) {
                hasEntry = true;
                break;
            }
        }
    }

    if(hasEntry) {
        return;
    }

    content += `${newline} ${ip} ${cname}`

    writeText(hostFile, content, {encoding: 'utf8'});
}

export function removeHostEntry(cname: string, ip: string) {
    if(cname === null || cname.trim().length == 0) {
        throw Error("cname must not be null or empty");
    }

    if(ip === null || ip.trim().length == 0) {
        throw Error("cname must not be null or empty");
    }


    let content = readText(hostFile);
    let lines = content.split(newline);
    let hasEntry = false;
    let updated = "";
    
    for(var line of lines) {
        if(line.startsWith("#")) {
            updated += `${line}${newline}`
            continue;
        }

        var parts = line.split(' ').filter(o => o.trim().length > 0);
        if(parts.length === 2) {
            if(parts[0] === ip && parts[1] === cname) {
                hasEntry = true;
                continue;
            }
        }
        updated += `${line}${newline}`
    }

    if(!hasEntry) {
        return;
    }

    writeText(hostFile, updated);
}

