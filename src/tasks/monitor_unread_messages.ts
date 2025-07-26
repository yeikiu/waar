/* eslint-disable no-await-in-loop */

import moment from 'moment'
import debugHelper from '../util/debug_helper'
import sendMessage from '../controllers/send_message'
import generateMessage from '../controllers/generate_message'
import { resolve } from 'path'
import loadJSONObj from '../util/load_json_object'

import { Page } from 'playwright'

const { logError, print, debug } = debugHelper(__filename)

const waarConfigPath = resolve(__dirname, '..', '..', 'config', 'waar_globals.json')
const sentCache = {}
let isRunning = false

export const monitorUnreadMessages = async (page: Page): Promise<void> => {
  if (isRunning) return
  isRunning = true

  // Load config
  const { WAAR_CHAT_REPLY_INTERVAL_MINUTES } = loadJSONObj(waarConfigPath);
  try {
    const chatListDiv = await page.getByLabel("Chat list");
    debug({ chatListDiv: await chatListDiv.allInnerTexts() });

    const userChats = [];
    const toReply = [];

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

    // Launch Chrome
    /* browser = await launchBrowser()
    page = await loadWhatsappWeb(browser) */

    // Launch Chat Monitor
    print(`WhatsApp Web Auto-Reply re-started ${moment().format('HH:mm DD/MM/YYYY')} ✔️`)
  }

  isRunning = false;
  //setInterval(() => monitorUnreadMessages(page), WAAR_CHAT_REPLY_INTERVAL_MINUTES * 60 * 1000);
}
