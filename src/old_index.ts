// const debug = require('debug')(`wa-ar:${require('path').parse(__filename).name}`);
// const logError = require('debug')(`wa-ar:${require('path').parse(__filename).name}:error*`);
// const print = require('debug')(`wa-ar:${require('path').parse(__filename).name}*`);
// const minimist = require('minimist')

// const puppeteer = require('puppeteer');
// const open = require("open");
// const path = require('path');
// const rimraf = require('rimraf');

// const findChrome = require('./../lib/find_chrome.js');
// let config = require('./../config.js');
// const args = minimist(process.argv.slice(2), {
//     boolean: ['window', 'w'],
//     number: ['min_minutes_between_messages', 'check_interval_seconds'],
//     alias: {
//         w: 'window',
//         m: 'message',
//         nrf: 'min_minutes_between_messages', // No Reply Frame
//         ci: 'check_interval_seconds'
//     }
// });
// config = { ...config, ...args };
// ['message', 'm'].forEach(k => { if (config[k]) config[k] = config[k].replace(/\\n/g,'\n'); });
// debug({config});
// const _tmpPath = path.resolve(__dirname, config.data_dir);
// let qrPath = null;

// import chatHandler from "./handlers/chat_handler";
// import * as moment from "moment";

// // catch un-handled promise errors
// process.on("unhandledRejection", (reason, p) => {
//     //logError("Unhandled Rejection at: Promise", p, "reason:", reason);
// });

// //Setup writeable dir if it doesn't exist
// const fs = require('fs');
// if (!fs.existsSync(_tmpPath)) {
//     try {
//         fs.mkdirSync(_tmpPath, { recursive: true });
//         fs.chmodSync(_tmpPath, '755');
//       } catch (err) {
//         if (err.code !== 'EEXIST') throw err
//       }
// }

// (async function main() {
//     //
//     // Login and wait to load
//     //
//     // const executablePath = findChrome().pop() || null;
//     const headless = !config.window;

//     const browser = await puppeteer.launch({
//         headless: false,
//         //executablePath: executablePath,
//         userDataDir: _tmpPath,
//         ignoreHTTPSErrors: true,
//         args: [
//             '--log-level=3', // fatal only
//             //'--start-maximized',
//             '--no-default-browser-check',
//             '--disable-infobars',
//             '--disable-web-security',
//             '--disable-site-isolation-trials',
//             '--no-experiments',
//             '--ignore-gpu-blacklist',
//             '--ignore-certificate-errors',
//             '--ignore-certificate-errors-spki-list',
//             '--disable-gpu',
//             '--disable-extensions',
//             '--disable-default-apps',
//             '--enable-features=NetworkService',
//             '--disable-setuid-sandbox',
//             '--no-sandbox'
//         ]
//     });

//     const page = (await browser.pages())[0];
//     page.setViewport({ width: 1024, height: 768 });
//     // await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36');
//     print(`Loading https://web.whatsapp.com`);
//     await page.goto('https://web.whatsapp.com/', {
//         waitUntil: 'networkidle2',
//         timeout: 0
//     });

//     let title = null;
//     await Promise.race([page.waitForSelector('#pane-side', { timeout: 0 }), page.waitForSelector('.landing-title', { timeout: 0 })] );
//     debug(`Loaded!`);

//     try {
//         title = await page.$eval('.landing-title', (t) => {
//             if (!t) return null;
//             return t.textContent;
//         });

//     } catch (e) { print(`Already logged in, loading chats`); }
//     debug(`title`, title);
//     // this means browser upgrade warning came up for some reasons
//     if (title && title.includes('Google Chrome 36+')) {
//         logError(`Can't open whatsapp web in headless mode, falling back to window mode`);
//         try {
//             //await page.reload();
//             await browser.close();
//             rimraf.sync(_tmpPath);
//             await page.waitFor(3000);
//             config.window = true; // Fallback displaying window
//             return main();
//         } catch (err) {
//             logError(err.message);
//         }

//     } else if (title/*  && title.includes('To use WhatsApp on your computer') */) {
//         print(`Login required, please wait while QR code is generated`);
//         await page.waitForSelector('img[alt="Scan me!"]', { timeout: 0 });
//         const qrCode = await page.$('img[alt="Scan me!"]');

//         if (qrCode && !config.window) {
//             //debug('qrCode', qrCode);
//             qrPath = `lastqr.png`;
//             await (await page.$('div:nth-child(2) > div:nth-child(2) > div:nth-child(1)')).screenshot({ path: qrPath });
//             await open(qrPath);
//             print(`Please scan the QR code with your phone's WhatsApp scanner.\nYou can close the image once scanned.`);
//         }
//     }

//     print('🙌  Logged IN! 🙌');

//     await page.waitForSelector('#pane-side', { timeout: 0 });

//     if (qrPath) {
//         try {
//             require('fs').unlinkSync(qrPath)
//         } catch (err) {
//             logError(err);
//         }
//     }

//     const sent = {};
//     const startTime = moment.utc();

//     print(`Auto-Reply started at ${moment().format('HH:mm DD/MM/YYYY')}`);
//     //check cell updates and reply
//     while (true) {
//         const minsRunning = moment.utc().diff(startTime, 'minutes');
//         if(minsRunning % 100 === 0) {
//             print(`Running for ${minsRunning} minutes at ${moment().format('HH:mm DD/MM/YYYY')}`);        
//         }

//         const allUnreads = await page.$eval('#pane-side', (ps) => {
//             return Array.from(ps.firstChild.firstChild.firstChild.childNodes || {})
//                 .map((c: any) => {
//                     return {
//                         isGroup: null, //TODO group detection
//                         num: c.lastChild.lastChild.lastChild.lastChild.lastChild.textContent || '0',
//                         name: c.lastChild.firstChild.lastChild.firstChild.firstChild.firstChild.firstChild.title || ''
//                     }
//                 })
//                 .filter((c: any) => parseInt(c.num) > 0 && c.name.length > 0)
//         });

//         const toReply = [];
//         for (const unread of allUnreads) {
            
//             if( !sent[unread.name] || moment.utc().diff(sent[unread.name], 'minutes') >= config.min_minutes_between_messages ) {
//                 toReply.push(unread);

//             } else {
//                 //test: check chat
//                 const userSelector = `#pane-side span[title="${unread.name}"]`;
//                 await page.waitFor(userSelector);
//                 await page.click(userSelector);
//                 await page.waitFor('#main > footer div.selectable-text[contenteditable]');
//                 sent[unread.name] = moment.utc();
//                 print(`Skipped ${unread.name}'s chat: ${config.min_minutes_between_messages} minutes left until auto-reply is re-enabled`);
//             }
//         }

//         for (const target of toReply) {
//             const text = chatHandler.generateMessage(target.name, config.message);
//             if (await chatHandler.sendMessage(page, target.name, text)) {
//                 sent[target.name] = moment.utc();
//             } else {
//                 logError(`Failed messaging ${target.name}`);
//             }
//         }
//         await page.waitFor(config.check_interval_seconds * 1000);
//     }
// })();