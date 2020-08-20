import { Browser } from "puppeteer";
import { resolve } from "path";
import * as puppeteer from 'puppeteer'
import debugHelper from '../util/debug_helper';
import loadJSONObj from "../util/load_json_object";

const { print } = debugHelper(__filename);

const waarConfigPath = resolve(__dirname, '..', '..', 'config', 'waar_globals.json')
// Load config
const { WAAR_CHROME_DATA_DIR } = loadJSONObj(waarConfigPath)

const launchBrowser = (chromeProfileName = 'Default'): Promise<Browser> => {
    print('Launching browser ⏳');
    // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions
    
    const {
        WAAR_HEADLESS = true
    } = loadJSONObj(waarConfigPath)
    const headless = WAAR_HEADLESS
    return puppeteer.launch({
        ignoreDefaultArgs: true, // Do not use puppeteer.defaultArgs() for launching Chromium. Recommended to run Official Chrome with 'executablePath' 
        args: [
            `--user-data-dir=${resolve(process.cwd(), WAAR_CHROME_DATA_DIR)}`,
            `--profile-directory=${chromeProfileName}`,
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
            ...headless ? ['--headless=true'] : []
        ],
        headless
    });
};

export default launchBrowser;
