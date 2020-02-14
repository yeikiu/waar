import path = require('path');
import debugLib = require('debug');
import fs = require('fs');

// Load package.json relative to this file location (or it´s 'dist' .js equivalent)
const parentModuleBase = path.resolve(__dirname, '../..');
const rootPkgPath = path.join(parentModuleBase, 'package.json');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath).toString());
if (!rootPkg.name) {
  throw new Error(
    'Can´t load name from ./package.json file.\nDoes it exist under root directory?',
  );
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default (fileName: string, label: string = rootPkg.name) => {
  const filePath = path.parse(fileName).name;

  const debug = debugLib(`${label}:${filePath}`);
  const logError = debugLib(`${label}:${filePath}:error*`);
  const print = debugLib(`${label}:${filePath}:*`);

  return { debug, logError, print };
};
