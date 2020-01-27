/* eslint-disable no-unused-vars */
// Output setup
// eslint-disable-next-line no-unused-vars
import { Browser, Page } from 'puppeteer';
import * as moment from 'moment';
import debugHelper from '../util/debug_helper';

import BrowserHandler from './browser_handler';
import ChatHandler from './chat_handler';

const { print } = debugHelper(__filename);

// Load config
const {
  NODE_ENV = 'development',
  DATA_DIR_PATH = '.cache',
  CHAT_REPLY_INTERVAL_MINUTES = 90,
  CHECK_UNREAD_INTERVAL_SECONDS = 10,
} = process.env;

const menuHandler = {
  printParams() {
    print({
      NODE_ENV,
      DATA_DIR_PATH,
      CHAT_REPLY_INTERVAL_MINUTES,
      CHECK_UNREAD_INTERVAL_SECONDS,
    });
  },

  async launchWaar(message: string) {
    // Launch Chrome
    const browser: Browser = await BrowserHandler.launchBrowser(DATA_DIR_PATH);
    const page: Page = await BrowserHandler.loadWhatsappWeb(browser);

    // Launch Chat Monitor
    print(`Auto-Reply started at ${moment().format('HH:mm DD/MM/YYYY')}`);
    ChatHandler.chatMonitor(
      page,
      Number(CHAT_REPLY_INTERVAL_MINUTES),
      Number(CHECK_UNREAD_INTERVAL_SECONDS),
      message,
    );
  },
};

export default menuHandler;
