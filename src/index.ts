const puppeteer = require('puppeteer');
const path = require('path');

const findChrome = require('./../lib/find_chrome.js');
const config = require('./../config.js');
const message = require('./../lib/message.js');

const chatHandler = require("./chat_handler");

// catch un-handled promise errors
process.on("unhandledRejection", (reason, p) => {
    //console.warn("Unhandled Rejection at: Promise", p, "reason:", reason);
});

(async function main() {
    //
    // Login and wait to load
    //
    const executablePath = findChrome().pop() || null;
    const headless = !config.window;

    const browser = await puppeteer.launch({
        headless: headless,
        executablePath: executablePath,
        userDataDir: path.resolve(__dirname, config.data_dir),
        ignoreHTTPSErrors: true,
        args: [
            '--log-level=3', // fatal only
            //'--start-maximized',
            '--no-default-browser-check',
            '--disable-infobars',
            '--disable-web-security',
            '--disable-site-isolation-trials',
            '--no-experiments',
            '--ignore-gpu-blacklist',
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-default-apps',
            '--enable-features=NetworkService',
            '--disable-setuid-sandbox',
            '--no-sandbox'
        ]

    });

    const page = await browser.newPage();
    await page.goto('https://web.whatsapp.com/', {
        waitUntil: 'networkidle2',
        timeout: 0
    });
    console.log('Waiting on #pane-side');
    await page.waitForSelector('#pane-side');

    console.log('IN');

    //check cell updates and reply
    /* while (true) {
        console.log('LOOP');
        const unreads = await page.$eval('#pane-side', (ps) => {
            return Array.from(ps.firstChild.firstChild.firstChild.childNodes || {})
                .map((c : any) => {
                    return {
                        num: c.lastChild.lastChild.lastChild.lastChild.lastChild.textContent,
                        name: c.lastChild.firstChild.lastChild.firstChild.firstChild.firstChild.firstChild.title
                    }
                })
                .filter(c => parseInt(c.num) > 0)
        });
        console.log('unreads', unreads);
        for (const unread of unreads) {
            const text = message.generate(unread.name);
            await chatHandler.sendMessage(page, unread.name, text);
        }
        await page.waitFor(10000);
    } */
})();