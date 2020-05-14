import qrcode = require('qrcode-terminal');
import { resolve } from 'path';
import { Browser, Page } from 'puppeteer';
import puppeteer = require('puppeteer');
import debugHelper from '../util/debug_helper';

const { debug, print } = debugHelper(__filename);

const {
  WAAR_CHROME_DATA_DIR = '.waarChromeProfile',
  WAAR_HEADLESS = 'true'
} = process.env;

const doQRlogin = async (page: Page): Promise<Page> => {
  print('Login required! Please wait while QR code is generated...');
  await page.waitForSelector('div[data-ref]', { timeout: 0 });

  const dataRef = await page.$eval('div[data-ref]', div => div.getAttribute('data-ref'));
  debug({ dataRef });
  qrcode.generate(dataRef, {small: true});

  print('Please scan the QR code with your phone\'s WhatsApp scanner');

  await page.waitForSelector('#pane-side', { timeout: 0 });
  print('🙌  Logged IN! 🙌');
  return page;
};

export default {  
  launchBrowser (): Promise<Browser> {
    // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions

    const headless = String(WAAR_HEADLESS) === 'true';
    return puppeteer.launch({
      ignoreDefaultArgs: true, // Do not use puppeteer.defaultArgs() for launching Chromium. Recommended to run Official Chrome with 'executablePath' 
      args: [
        `--user-data-dir=${resolve(process.cwd(), WAAR_CHROME_DATA_DIR)}`,
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
        ...headless ? ['--headless=true'] : []
      ],
      headless
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
      page.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 0 }),
    ]);
    print('Whatsapp-Web Loaded!');

    // Check if login is needed
    try {
      await page.$eval('canvas[aria-label="Scan me!"]', () => {    
        // QR login needed
        return doQRlogin(page)
      });
    } catch({ code, message }) {
      print('Already logged in, loading chats...'); 
    }

    return page;
  },
};
