const debug = require('debug')(`wa-ar:${require('path').parse(__filename).name}`);
const logError = require('debug')(`wa-ar:${require('path').parse(__filename).name}:error*`);
const print = require('debug')(`wa-ar:${require('path').parse(__filename).name}*`);
const minimist = require('minimist')

const puppeteer = require('puppeteer');
const open = require("open");
const path = require('path');
const rimraf = require('rimraf');

const findChrome = require('./../lib/find_chrome.js');
let config = require('./../config.js');
const args = minimist(process.argv.slice(2), {
    boolean: ['window', 'w'],
    number: ['min_minutes_between_messages', 'check_interval_seconds'],
    alias: {
        w: 'window',
        nrf: 'min_minutes_between_messages', // No Reply Frame
        ci: 'check_interval_seconds'
    }
});
config = { ...config, ...args };
let qrPath = null;

import chatHandler from "./handlers/chat_handler";
import * as moment from "moment";

// catch un-handled promise errors
process.on("unhandledRejection", (reason, p) => {
    //logError("Unhandled Rejection at: Promise", p, "reason:", reason);
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
            '--window-size=1920x800',
            //'--incognito'
        ]
    });

    const page = (await browser.pages())[0];
    page.setViewport({width: 1280, height: 800});
    // await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36');
    await page.goto('https://web.whatsapp.com/', {
        waitUntil: 'networkidle2',
        timeout: 0
    });

    let title = null;
    await page.waitForSelector('.landing-title', { timeout: 8000 });
    try {
        title = await page.$eval('.landing-title', (t) => {
            if (!t) return null;
            return t.textContent;
        });

    } catch (e) { };
    //debug(`title`, title);
    // this means browser upgrade warning came up for some reasons
    if (title && title.includes('Google Chrome 36+')) {
        logError(`Can't open whatsapp web in headless mode, falling back to window mode....`);
        try {
            rimraf.sync(path.resolve(__dirname, config.data_dir));
            await page.reload();
            await browser.close();
            config.window = true; // Fallback displaying window
            return main();
        } catch (err) {
            logError(err.message);
        }
    
    } else if (title && title.includes('To use WhatsApp on your computer')) {
        print(`Waiting on QR code...`);
        await page.waitForSelector('img[alt="Scan me!"]', { timeout: 0 });
        const qrCode = await page.$('img[alt="Scan me!"]');
        
        if (qrCode && !config.window) {
            //debug('qrCode', qrCode);
            qrPath = `lastqr.png`;
            await (await page.$('div:nth-child(2) > div:nth-child(2) > div:nth-child(1)')).screenshot({ path: qrPath });
            await open(qrPath);
            print(`Please scan the QR code with your phone's WhatsApp scanner.\nYou can close the image once scanned.`);
        } 
    }

    await page.waitForSelector('#pane-side', { timeout: 0 });
 
    debug(`🙌  Logged IN! 🙌`);
    if (qrPath) {
        try {
            require('fs').unlinkSync(qrPath)
        } catch (err) {
            logError(err);
        }
    }

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
        });

        for (const unread of unreads.filter(u => !sent.has(u.name) || moment.utc().diff(sent.get(u.name), 'minutes') >= config.min_minutes_between_messages)) {
            if (sent.has(unread.name)) {
                console.log(`Message to ${unread.name} already sent`);
                debug(moment.utc().diff(sent.get(unread.name), 'minutes'));
            }
            const text = chatHandler.generateMessage(unread.name);
            if (await chatHandler.sendMessage(page, unread.name, text)) {
                sent.set(unread.name, moment.utc());
            } else {
                console.log(`Failed message to ${unread.name}`);
            }
        }
        await page.waitFor(config.check_interval_seconds * 1000);
    }
})();