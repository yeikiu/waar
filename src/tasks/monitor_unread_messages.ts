/* eslint-disable no-await-in-loop */

import moment from 'moment'
import debugHelper from '../util/debug_helper'
import sendMessage from '../controllers/send_message'
import generateMessage from '../controllers/generate_message'
import { schedule } from 'node-cron'
import launchBrowser from '../controllers/launch_browser'
import loadWhatsappWeb from '../controllers/load_whatsapp_web'
import { resolve } from 'path'
import loadJSONObj from '../util/load_json_object'
import { launchFirefox } from '../playwright_utils/launch_firefox'
import { Browser, FirefoxBrowser, Page } from 'playwright'

const { logError, print } = debugHelper(__filename)

const waarConfigPath = resolve(__dirname, '..', '..', 'config', 'waar_globals.json')
const sentCache = {}
let isRunning = false
let browser: FirefoxBrowser  = null
let page: Page = null

const monitorChatCells = async (): Promise<void> => {
  if (isRunning) return
  isRunning = true

  // Load config
  const { WAAR_CHAT_REPLY_INTERVAL_MINUTES, WAAR_CHROME_DATA_DIR } = loadJSONObj(waarConfigPath)

  try {
    if (!browser || !page) {
      // Launch Firefox
      const { page: ffPage, browser: ffBrowser } = await launchFirefox({ headless: false, browserUserDir: WAAR_CHROME_DATA_DIR })
      browser = ffBrowser
      page = ffPage

      // Launch Chat Monitor
      print(`WhatsApp Web Auto-Reply started ${moment().format('HH:mm DD/MM/YYYY')} ✔️`);
      await page.goto('https://web.whatsapp.com/');

    }
    return;

    await page.waitForSelector('span[data-testid="default-user"]', { timeout: 0 })
    const userChats = (await Promise.all((await page.$$('span[data-testid="default-user"]')) // use default-user for groups
      .map((el) => {
        return el.evaluate(el => {
          const chatCell = el.parentElement?.parentElement?.parentElement?.parentElement || null
          return {
            text: chatCell?.textContent,
            numUnread: Number(chatCell?.lastChild?.lastChild?.lastChild?.textContent || 0),
            userName: chatCell?.lastElementChild?.firstElementChild?.firstElementChild?.firstElementChild?.firstElementChild?.getAttribute('title') || ''
          }
        })
      })))
      .filter(({ text, numUnread }) => text && numUnread > 0)

    // debug({ userChats })
    const toReply = []

    // eslint-disable-next-line no-restricted-syntax
    for (const { userName } of userChats) {
      const minsDiff = moment().diff(sentCache[userName], 'minutes')

      if (!sentCache[userName] || minsDiff >= WAAR_CHAT_REPLY_INTERVAL_MINUTES) {
        toReply.push(userName)

      } else {
        // Mark chat cell as read by clicking on it
        const userSelector = `span[title="${userName}"]`
        /* await page.waitFor(userSelector)
        await page.click(userSelector)
        await page.waitFor('#main > footer div.selectable-text[contenteditable]') */
        sentCache[userName] = moment()
        print(`Skipped ${userName}'s chat: Only ${minsDiff} minutes passed since last auto-reply...`)
      }
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const userName of toReply) {
      const text = generateMessage()
      if (await sendMessage(page, userName, text)) {
        sentCache[userName] = moment()

      } else {
        logError(`Failed messaging ${userName} ❌`)
      }
    }

  } catch ({ code, message }) {
    logError(`monitorUnreadMessages error: ${message} ❌`)
    if (browser) {
      try { await browser.close() } catch(e) { browser = null }
    }
    // Launch Chrome
    /* browser = await launchBrowser()
    page = await loadWhatsappWeb(browser) */

    // Launch Chat Monitor
    print(`WhatsApp Web Auto-Reply re-started ${moment().format('HH:mm DD/MM/YYYY')} ✔️`)
  }

  isRunning = false
}

const { start: startMonitorUnreadMessages, stop: stopMonitorUnreadMessages } = schedule('*/60 * * * * *', monitorChatCells)

export default { startMonitorUnreadMessages, stopMonitorUnreadMessages }
