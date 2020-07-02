import { Browser, Page } from "puppeteer";
import debugHelper from '../util/debug_helper';
import doQRlogin from "./browser_handler";

const { print } = debugHelper(__filename);

const loadWhatsappWeb = async (browser: Browser): Promise<Page> => {
    print('Loading Whatsapp-Web ⏳');
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
    print('Whatsapp-Web Loaded! ✔️');
    print('Checking for existing session...');

    // Check if login is needed
    const paneSide = await page.$('#pane-side');
    if (paneSide !== null) {
      print('Already logged in! ✔️')
      print('Loading chats ⏳');
      return page;
    }
    
    // QR login needed
    return doQRlogin(page);
  };

export default loadWhatsappWeb;
