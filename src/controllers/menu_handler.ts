/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import { Browser, Page } from 'puppeteer';
import * as moment from 'moment';
import debugHelper from '../util/debug_helper';

import BrowserHandler from './browser_handler';
import ChatHandler from './chat_monitor';

const { print } = debugHelper(__filename);

const menuHandler = {
  printParams(): void {
    const params = {};
    [...Object.keys(process.env).filter((k) => k.startsWith('WAAR_')), 'NODE_ENV']
      .forEach((k) => {
        params[k] = process.env[k];
      });

    print({ params });
  },

  async launchWaar(): Promise<void> {
    // Launch Chrome
    const browser: Browser = await BrowserHandler.launchBrowser();
    const page: Page = await BrowserHandler.loadWhatsappWeb(browser);

    // Launch Chat Monitor
    print(`WhatsApp Web Auto-Reply started ${moment().format('HH:mm DD/MM/YYYY')} ✔️`);
    ChatHandler.monitorUnreadMessages(page);
  },
};

export default menuHandler;
