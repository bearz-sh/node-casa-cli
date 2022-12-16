import { execaSync as exec } from 'execa';
import { cat, exists, mkdir, writeText } from '@app/io/fs';
import { join } from 'node:path';
import { CASA_DATA_DIR } from '@app/os/index';
import { get } from './env'

export function mkcert(domains: string[], env?: string, install = false) {
    if(install) {
        exec('mkcert', ['-install'], { stdio: 'inherit' });
    }
    
    env ||= get();

    
    if(domains && domains.length > 0) {
        let casaHome = CASA_DATA_DIR
        
        let etcDir = join(casaHome, 'etc');
       
    
        let primary = domains[0];
        if(primary.startsWith("*")) {
            primary = "star." + primary.substring(1)
        }
        let certDir = join(etcDir, 'certs');
        let pemFile = join(certDir, `${primary}.pem`);
        let keyFile = join(certDir, `${primary}.key`);
        let chainPemFile = join(certDir, `${primary}-chain.pem`);
    
    
        if(!exists(pemFile)) {
            let splat = ['-cert-file', pemFile, '-key-file', keyFile].concat(domains);
    
            if(!exists(certDir)) {
                mkdir(certDir, { recursive: true});
            }
    
            exec('mkcert', splat, { stdout: 'inherit' });
    
        }
    
        if (!exists(chainPemFile)) {
            let caDir = exec('mkcert', ['-CAROOT']).stdout
            if(!exists(caDir)) {
                throw `unable to find ca directory ${caDir}`
            }
    
            let content = cat(pemFile, join(caDir, 'rootCA.pem'))
    
            writeText(chainPemFile, content);
        }
    }
}

