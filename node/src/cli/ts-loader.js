// `loader.js`
import {
    resolve as resolveTs,
    getFormat,
    transformSource,
    load,
  } from "ts-node/esm";
  import * as fs from "fs";
  import { pathToFileURL } from 'url';
  import * as tsConfigPaths from "tsconfig-paths"
  
  export { getFormat, transformSource, load};
  
  const { absoluteBaseUrl, paths } = tsConfigPaths.loadConfig()
  const matchPath = tsConfigPaths.createMatchPath(absoluteBaseUrl, paths)
  
  export function resolve(specifier, context, defaultResolver) {
	const mappedSpecifier = matchPath(specifier);;
	if (mappedSpecifier) {
        if(fs.existsSync(mappedSpecifier)) {
            const isDirectory = fs.lstatSync(mappedSpecifier).isDirectory();
            if(isDirectory) {
                return resolveTs(mappedSpecifier + '/index.ts', context, defaultResolver);
            } 
        }
        
		specifier = pathToFileURL(mappedSpecifier) + '.ts';
	}
	return resolveTs(specifier, context, defaultResolver);
}