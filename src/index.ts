const debug = require('debug')(`wa-ar:${require('path').parse(__filename).name}`);
const logError = require('debug')(`wa-ar:${require('path').parse(__filename).name}:error*`);
const print = require('debug')(`wa-ar:${require('path').parse(__filename).name}*`);

const puppeteer = require('puppeteer');
const open = require("open");
const path = require('path');

const findChrome = require('./../lib/find_chrome.js');
const config = require('./../config.js');

import chatHandler from "./handlers/chat_handler";
import * as moment from "moment";

// catch un-handled promise errors
process.on("unhandledRejection", (reason, p) => {
    logError("Unhandled Rejection at: Promise", p, "reason:", reason);
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
            '--no-sandbox',
            //'--incognito'
        ]
    });

    const page = (await browser.pages())[0];
    //await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36');
    await page.goto('https://web.whatsapp.com/', {
        waitUntil: 'networkidle2',
        timeout: 0
    });

    let title = null;
    try {
        title = await page.$eval('.window-title', (t) => {
            if (!t) return null;
            return t.textContent;
        });
    
    } catch (e) {};
    debug('title', title);
    // this means browser upgrade warning came up for some reasons
    if (title && title.includes('Google Chrome 36+')) {
        logError(`Can't open whatsapp web, most likely got browser upgrade message....`);
        process.exit();
    }
    
    // Check if we need to log-in
    const awaitQR = page.waitForSelector('img[alt="Scan me!"]');
    const awaitChats = page.waitForSelector('#pane-side');

    await Promise.race([awaitQR, awaitChats]).then(async function(value) {
        const qrCode = await page.$('img[alt="Scan me!"]');
        if (qrCode) {
            const qrPath = `lastqr.png`;
            await (await page.$('div:nth-child(2) > div:nth-child(2) > div:nth-child(1)')).screenshot({path: qrPath});
            await open(qrPath);
            print(`Please scan the QR code with your phone's WhatsApp scanner.\nYou can close the image once scanned.`);
        }
    });

    debug('Waiting on #pane-side');
    await page.waitForSelector('#pane-side');
    const sent = new Map();
    const startTime = moment.utc();

    //check cell updates and reply
    while (true) {
        console.log(`Running for ${moment.utc().diff(startTime, 'seconds')} seconds`);
        const unreads = await page.$eval('#pane-side', (ps) => {
            console.log('IN');
            return Array.from(ps.firstChild.firstChild.firstChild.childNodes || {})
                .map((c: any) => {
                    return {
                        isGroup: null, //TODO group detection
                        num: c.lastChild.lastChild.lastChild.lastChild.lastChild.textContent || '0',
                        name: c.lastChild.firstChild.lastChild.firstChild.firstChild.firstChild.firstChild.title || ''
                    }
                })
                .filter((c: any) => parseInt(c.num) > 0 && c.name.length > 0)
        }, sent);
        for (const unread of unreads.filter(u => !sent.has(u.name))) {
            if (sent.has(unread.name)) {
                console.log(`Message to ${unread.name} already sent`);
                continue;
            }
            const text = chatHandler.generateMessage(unread.name);
            if (await chatHandler.sendMessage(page, unread.name, text)) {
                sent.set(unread.name, moment.utc());
            } else {
                console.log(`Failed message to ${unread.name}`);
            }
        }
        await page.waitFor(10000);
    }
})();