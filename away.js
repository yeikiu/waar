const puppeteer = require('puppeteer');
const path = require('path');
const findChrome = require('./find_chrome');

const config = require('./config.js');
const message = require('./message.js');

// catch un-handled promise errors
process.on("unhandledRejection", (reason, p) => {
  //console.warn("Unhandled Rejection at: Promise", p, "reason:", reason);
});

(async function main() {
  //
  // Login and wait to load
  //
  const executablePath = findChrome().pop() || null;
  const tmpPath = path.resolve(__dirname, config.data_dir);
  const headless = !config.window;

  const browser = await puppeteer.launch({
    headless: headless,
    executablePath: executablePath,
    userDataDir: tmpPath,
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
  while (true) {
    console.log('LOOP');
    const unreads = await page.$eval('#pane-side', (ps) => {
      return Array.from(ps.firstChild.firstChild.firstChild.childNodes || {})
        .map(c => {
          return {
            num: c.lastChild.lastChild.lastChild.lastChild.lastChild.textContent,
            name: c.lastChild.firstChild.lastChild.firstChild.firstChild.firstChild.firstChild.title
          }
        })
        .filter(c => parseInt(c.num) > 0)
    });
    console.log('unreads', unreads);
    for (const unread of unreads) {

      const userSelector = `#pane-side span[title="${unread.name}"]`;
      await page.waitFor(userSelector);
      await page.click(userSelector);
      await page.waitFor('#main > footer div.selectable-text[contenteditable]');
      await page.click('#main > footer div.selectable-text[contenteditable]');
      const titleName = await page.$eval('#main > header span[title]', e => e.textContent);
      if (titleName !== unread.name) {
        console.log(`Can't load chat with ${unread.name}`);
        continue;
      }

      const parts = message.generate(unread.name).split('\n');

      for (var i = 0; i < parts.length; i++) {
        await page.keyboard.type(parts[i]);
        await page.keyboard.down('Shift');
        await page.keyboard.press('Enter');
        await page.keyboard.up('Shift');
      }

      await page.waitFor(1000);
      await page.keyboard.press('Enter');
      console.log('Sent to ', unread.name);
    }
    await page.waitFor(10000); //rest
  }
})();