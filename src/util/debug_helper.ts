import { parse } from 'path'
import debugLib, { Debugger } from 'debug'

/* RECOMMENED TO MATCH PROJECT'S NAME */
const DEBUG_PREFIX = 'waar'

export default (fileName: string, label = DEBUG_PREFIX): { debug: Debugger; logError: Debugger; print: Debugger; } => {
  const filePath = parse(fileName).name

  const debug = debugLib(`${label}:${filePath}`)
  const logError = debugLib(`${label}:${filePath}:error*`)
  const print = debugLib(`${label}:${filePath}:*`)

  return { debug, logError, print }
};
