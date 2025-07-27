/* eslint-disable @typescript-eslint/no-explicit-any */

import { resolve } from "path";
import { readFileSync, writeFileSync } from "fs";


export const loadJsonData = <S extends string, T extends object | unknown[]>(
    strPath: S,
    defaultValue: T,
): T => {
    try {
        const filePath = resolve(strPath);
        return JSON.parse(readFileSync(filePath).toString());
    } catch {
        return defaultValue;
    }
};

export const saveJsonData = <S extends string, T extends object | unknown[]>(
    path: S,
    data: T,
) => {
    writeFileSync(path, JSON.stringify(data, null, 4));
};
