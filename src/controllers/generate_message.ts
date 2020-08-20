import { resolve } from "path"
import loadJSONObj from "../util/load_json_object"

const pkgPath = resolve(__dirname, '..', '..', 'package.json')
const { version } = loadJSONObj(pkgPath)
const waarConfigPath = resolve(__dirname, '..', '..', 'config', 'waar_globals.json')

const generateMessage = (): string => {
    const { WAAR_DEFAULT_MESSAGE } = loadJSONObj(waarConfigPath)

    return `🤖💬 *Whatsapp AUTO-REPLY* v${version}
                    
  ${WAAR_DEFAULT_MESSAGE}
  
  >> https://github.com/yeikiu/waar <<`;
};

export default generateMessage;
