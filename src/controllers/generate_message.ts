import { resolve } from "path";
import { readFileSync } from "fs";

const pkgPath = resolve(__dirname, '..', '..', 'package.json');
const { version } = JSON.parse(readFileSync(pkgPath).toString())

const generateMessage = (): string => {
    const { WAAR_DEFAULT_MESSAGE = `I can´t answer now. Call you later! :-)` } = process.env;

    return `🤖💬 *Whatsapp AUTO-REPLY* v${version}
                    
  ${WAAR_DEFAULT_MESSAGE}
  
  >> https://github.com/yeikiu/waar <<`;
};

export default generateMessage;
