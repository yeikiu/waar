/* eslint-disable no-await-in-loop */

import moment from 'moment'
import debugHelper from '../util/debug_helper'

import { Page } from 'playwright'
import { generateMessage } from '../controllers/generate_message'

const { logError, print, debug } = debugHelper(__filename)

const sentCache = {}
let isRunning = false

export const monitorUnreadMessages = async (page: Page, replyMessage: string, replyInterval: number): Promise<void> => {
  if (isRunning) return
  isRunning = true

  try {
    await page.getByRole('tab', { name: 'Unread' }).click();
    await page.waitForLoadState('domcontentloaded');

    const chatListDiv = await page.getByLabel("Chat list");
    const rowCount = await chatListDiv.getAttribute('aria-rowcount');

    const nextUnreadCellDiv = await chatListDiv.getByRole('listitem');
    const [targetName] = (await nextUnreadCellDiv.innerText()).split('\n');

    await nextUnreadCellDiv.click();
    await page.waitForLoadState('domcontentloaded');

    await page.getByLabel('Type a message').focus();

    const parts = generateMessage(replyMessage)
      .replace(/\\+n/g, '\n').split('\n')

    for (let i = 0; i < parts.length; i += 1) {
      await page.keyboard.type(parts[i], { delay: 25 });
      if (i === parts.length - 1) break;
      await page.keyboard.down('Shift')
      await page.keyboard.press('Enter')
      await page.keyboard.up('Shift')
    }

    // await page.keyboard.press('Enter')
    print(`Sent to ${targetName} at ${moment().format('HH:mm')} ✔️`)
    return;


    debug({ nextUnreadCellDiv: await nextUnreadCellDiv.allInnerTexts(), rowCount });

    const userChats = [];
    const toReply = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const { userName } of userChats) {
      const minsDiff = moment().diff(sentCache[userName], 'minutes')

      if (!sentCache[userName] || minsDiff >= 5) {
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
    /* for (const userName of toReply) {
      const text = generateMessage()
      if (await sendMessage(page, userName, text)) {
        sentCache[userName] = moment()

      } else {
        logError(`Failed messaging ${userName} ❌`)
      }
    } */

  } catch ({ code, message }) {
    logError(`monitorUnreadMessages error: ${message} ❌`)

    // Launch Chrome
    /* browser = await launchBrowser()
    page = await loadWhatsappWeb(browser) */

    // Launch Chat Monitor
    print(`WhatsApp Web Auto-Reply re-started ${moment().format('HH:mm DD/MM/YYYY')} ✔️`)
  }

  isRunning = false;
  //setInterval(() => monitorUnreadMessages(page), replyInterval * 60 * 1000);
}
