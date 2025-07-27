import { resolve } from 'path'
import { loadJsonData } from './util/json_helper';

const pkgPath = resolve(__dirname, '..', 'package.json');
const { version } = loadJsonData(pkgPath, { version: '' });

export const generateMessage = (content: string): string => `                  
${content}
  
> Sent from 🤖 *Whatsapp AUTO-REPLY* beta-${version} | https://github.com/yeikiu/waar`
    .trim();
