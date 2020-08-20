/* eslint-disable @typescript-eslint/no-explicit-any */

import { resolve } from "path";
import { readFileSync } from "fs";

const loadJSONObj = (strPath: string, defaultValue?: any): any => {
    let obj;
    try {
        const filePath = resolve(strPath);
        obj = JSON.parse(readFileSync(filePath).toString());
        
    } catch (error) {
        if (defaultValue) {
            obj = defaultValue;
        } else {
            throw(error)
        }
    }
    // debug('Cache', {obj});
    return obj;
};

export default loadJSONObj
