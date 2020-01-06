// Output setup
import debugHelper from "./util/debug_helper";
const { debug, logError, print } = debugHelper(__filename);

import BrowserHandler from './handlers/browser_handler';
import ChatHandler from './handlers/chat_handler';
import { Browser, Page } from "puppeteer";
import * as moment from "moment";

// Load config
const {
    NODE_ENV = 'development',
    DATA_DIR_PATH = '_data',
    MESSAGE = `En estos momentos no puedo responder al WhatsApp.\n\nTe escribo pronto! 🤓`,
    CHAT_REPLY_INTERVAL_MINUTES = 90,
    CHECK_UNREAD_INTERVAL_SECONDS = 10,
} = process.env;
debug({
    NODE_ENV,
    DATA_DIR_PATH,
    MESSAGE,
    CHAT_REPLY_INTERVAL_MINUTES,
    CHECK_UNREAD_INTERVAL_SECONDS,
});

(async () => {
    // Launch Chrome
    const browser: Browser = await BrowserHandler.launchBrowser(DATA_DIR_PATH);
    const page: Page = await BrowserHandler.loadWhatsappWeb(browser);

    // Launch Chat Monitor
    print(`Auto-Reply started at ${moment().format('HH:mm DD/MM/YYYY')}`);
    ChatHandler.chatMonitor(page, Number(CHAT_REPLY_INTERVAL_MINUTES), Number(CHECK_UNREAD_INTERVAL_SECONDS), MESSAGE);
})();