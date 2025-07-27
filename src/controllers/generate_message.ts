import { resolve } from 'path'
import loadJSONObj from '../util/load_json_object'

const pkgPath = resolve(__dirname, '..', '..', 'package.json');
const { version } = loadJSONObj(pkgPath);

export const generateMessage = (content: string): string => `                  
${content}
  
> Sent from 🤖 *Whatsapp AUTO-REPLY* beta-${version} | https://github.com/yeikiu/waar`
    .trim();
