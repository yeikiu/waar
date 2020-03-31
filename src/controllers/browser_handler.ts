// Output setup

import debugHelper from '../util/debug_helper';
// eslint-disable-next-line no-unused-vars
const { debug, logError, print } = debugHelper(__filename);

import { Browser, Page } from 'puppeteer';
import puppeteer = require('puppeteer');

const {
  // BOT_CHROME_EXECUTABLE_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  CHROME_USER_DATA_PATH = 'C:/Users/JQ/AppData/Local/Google/Chrome/User Data',
} = process.env;

const doQRlogin = async (page: Page): Promise<Page> => {
  print('Login required, please wait while QR code is generated');
  await page.waitForSelector('img[alt="Scan me!"]', { timeout: 0 });
  print('Please scan the QR code with your phone\'s WhatsApp scanner');

  await page.waitForSelector('#pane-side', { timeout: 0 });
  print('🙌  Logged IN! 🙌');
  return page;
};

export default {  
  launchBrowser (chromeProfileName = 'Default'): Promise<Browser> {  
    return puppeteer.launch({
      // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions
      headless: false, // doesn't work well with official Chrome
      // ignoreDefaultArgs: true, // use true for official Chrome
      args: [
        `--user-data-dir=${CHROME_USER_DATA_PATH}`,
        `--profile-directory=${chromeProfileName}`,
        // `--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36`
      ],
      // executablePath: BOT_CHROME_EXECUTABLE_PATH,
    });
  },

  async loadWhatsappWeb(browser: Browser): Promise<Page> {
    const page = (await browser.pages())[0];
    page.setViewport({ width: 1024, height: 768 });
    await page.goto('https://web.whatsapp.com/', {
      waitUntil: 'networkidle2',
      timeout: 0,
    });

    // Let the UI load
    await Promise.race([
      page.waitForSelector('#pane-side', { timeout: 0 }),
      page.waitForSelector('.landing-title', { timeout: 0 }),
    ]);
    print('Whatsapp-Web Loaded!');

    // Check if login is needed
    let title = null;
    try {
      title = await page.$eval('.landing-title', (t) => {
        if (!t) return null;
        return t.textContent;
      });
    } catch (e) { print('Already logged in, loading chats...'); }

    if (title === null) { return page; }

    // QR login needed
    return doQRlogin(page);
  },
};
