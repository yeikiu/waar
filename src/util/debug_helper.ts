/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-useless-catch */
/* eslint-disable global-require */
const path = require('path');
const debugLib = require('debug');

// Load package.json relative to this file location (or it´s 'dist' .js equivalent)
const parentModuleBase = path.resolve(__dirname, '../..');
const rootPkgPath = path.join(parentModuleBase, 'package.json');

let rootPkg = null;
try {
  rootPkg = require(rootPkgPath);
  if (!rootPkg.name) {
    throw new Error(
      'Can´t load name from ./package.json file.\nDoes it exist under root directory?',
    );
  }
} catch (error) {
  throw error;
}

export default (fileName: string, label: string = rootPkg) => {
  const filePath = path.parse(fileName).name;

  const debug = debugLib(`${label}:${filePath}`);
  const logError = debugLib(`${label}:${filePath}:error*`);
  const print = debugLib(`${label}:${filePath}:*`);

  return { debug, logError, print };
};
