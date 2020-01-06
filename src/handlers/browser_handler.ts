// Output setup
import debugHelper from "./../util/debug_helper";
const { debug, logError, print } = debugHelper(__filename);

const path = require('path');
const puppeteer = require("puppeteer");
import { Browser, Page } from "puppeteer";

const doQRlogin = async (page: Page): Promise<Page> => {
    print(`Login required, please wait while QR code is generated`);
    await page.waitForSelector('img[alt="Scan me!"]', { timeout: 0 });
    //const qrCode = await page.$('img[alt="Scan me!"]');
    //debug('qrCode', qrCode);
    
    // const qrPath = `lastqr.png`;
    // await (await page.$('div:nth-child(2) > div:nth-child(2) > div:nth-child(1)')).screenshot({ path: qrPath });
    // await open(qrPath);
    print(`Please scan the QR code with your phone's WhatsApp scanner.\nMake sure HEADLESS=false in the .env file.`);

    await page.waitForSelector('#pane-side', { timeout: 0 });
    print('🙌  Logged IN! 🙌');
    return page;
}

export default {

    launchBrowser(dataDirPath: string, HEADLESS: string): Browser {
        return puppeteer.launch({
            // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions
            headless: HEADLESS === 'true', // doesn't work well with official Chrome
            ignoreDefaultArgs: true, // use true for official Chrome
            args: [
                `--user-data-dir=${path.resolve(dataDirPath)}`,
                "--disable-dev-shm-usage"
            ], 
            //executablePath: CHROME_PATH
        });
    },

    async loadWhatsappWeb(browser: Browser): Promise<Page> {
        const page = (await browser.pages())[0];
        page.setViewport({ width: 1024, height: 768 });
        await page.goto('https://web.whatsapp.com/', {
            waitUntil: 'networkidle2',
            timeout: 0
        });

        // Let the UI load
        await Promise.race([
            page.waitForSelector('#pane-side', { timeout: 0 }),
            page.waitForSelector('.landing-title', { timeout: 0 })
        ]);
        print(`Whatsapp-Web Loaded!`);

        // Check if login is needed
        let title = null;
        try {
            title = await page.$eval('.landing-title', (t) => {
                if (!t) return null;
                return t.textContent;
            });
    
        } catch (e) { print(`Already logged in, loading chats...`); }
        
        if (title === null)
            return page;

        // QR login needed
        return doQRlogin(page);
    }
}