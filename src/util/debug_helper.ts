/* eslint-disable global-require */
const path = require('path');
const debugLib = require('debug');

const getPackageName = (): string => {
  // Load Project name from package.json file
  try {
    const packagePath = path.resolve('package');
    // eslint-disable-next-line import/no-dynamic-require
    const pkg = require(packagePath);
    if (!pkg.name) throw new Error();
    return pkg.name;
  } catch ({ code, message }) {
    throw new Error(
      'Can´t load name from ./package.json file.\nDoes it exist under root directory?',
    );
  }
};

export default (fileName: string, label: string = getPackageName()) => {
  const filePath = path.parse(fileName).name;

  const debug = debugLib(`${label}:${filePath}`);
  const logError = debugLib(`${label}:${filePath}:error*`);
  const print = debugLib(`${label}:${filePath}:*`);

  return { debug, logError, print };
};
