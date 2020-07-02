import { parse } from 'path';
import debugLib from 'debug';

/* RECOMMENED TO MATCH PROJECT'S NAME */
const DEBUG_PREFIX = 'waar'

export default (fileName: string, label = DEBUG_PREFIX): { debug: Function; logError: Function; print: Function } => {
  const filePath = parse(fileName).name;

  const debug = debugLib(`${label}:${filePath}`);
  const logError = debugLib(`${label}:${filePath}:error*`);
  const print = debugLib(`${label}:${filePath}:*`);

  return { debug, logError, print };
};
