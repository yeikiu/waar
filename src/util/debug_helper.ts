const getPackageName = (): string => {
    // Load Project name from package.json file
    try {
        const pkg = require(require("path").resolve("package"));
        if (!pkg.name) throw new Error();
        return pkg.name;
    } catch ({ code, message }) {
        throw new Error(
            "Can´t load name from ./package.json file.\nDoes it exist under root directory?"
        );
    }
};

export default (fileName: string, label: string = getPackageName()) => {
    const filePath = require("path").parse(fileName).name;

    const debug = require("debug")(`${label}:${filePath}`);
    const logError = require("debug")(`${label}:${filePath}:error*`);
    const print = require("debug")(`${label}:${filePath}:*`);

    return { debug, logError, print };
};
