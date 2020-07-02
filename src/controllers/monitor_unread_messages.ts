/* eslint-disable no-await-in-loop */

import * as moment from 'moment';
import { Page, Browser } from 'puppeteer';
import { ChatCell } from '../types/chat_cell';
import debugHelper from '../util/debug_helper';
import sendMessage from './send_message';
import generateMessage from './generate_message';
import { schedule } from 'node-cron'
import launchBrowser from './launch_browser';
import loadWhatsappWeb from './load_whatsapp_web';

const { debug, logError, print } = debugHelper(__filename);

const sentCache = {};
let isRunning = false;
let browser: Browser = null;
let page: Page = null;

const monitorUnreadMessages = async (): Promise<void> => {
  if (isRunning) return;
  isRunning = true;

  // Load config
  const { WAAR_CHAT_REPLY_INTERVAL_MINUTES = 90 } = process.env;
  const chatReplyIntervalMinutes = Number(WAAR_CHAT_REPLY_INTERVAL_MINUTES);

  try {
    if (!browser || !page) {
      // Launch Chrome
      browser = await launchBrowser();
      page = await loadWhatsappWeb(browser);

      // Launch Chat Monitor
      print(`WhatsApp Web Auto-Reply started ${moment().format('HH:mm DD/MM/YYYY')} ✔️`);
    }

    const allUnreads: ChatCell[] = await page.$eval('#pane-side div:nth-child(1) div:nth-child(1) div:nth-child(1)', (ps) => Array.from(ps.childNodes || [])
        .map((c: ChildNode) => ({
          isGroup: c.lastChild.parentElement.innerHTML.includes('span data-testid="default-group"'),
          numUnread: Number(c.lastChild.lastChild.lastChild.lastChild.lastChild.textContent || 0),
          chatName: c.lastChild.firstChild.lastChild.firstChild.firstChild.textContent || '',
        }))
        .filter((c: ChatCell) => !c.isGroup && c.numUnread > 0 && c.chatName.length > 0)
      );

    debug({ allUnreads });

    const toReply = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const { chatName } of allUnreads) {
      const minsDiff = moment().diff(sentCache[chatName], 'minutes');

      if (!sentCache[chatName] || minsDiff >= chatReplyIntervalMinutes) {
        toReply.push(chatName);

      } else {
        // Mark chat cell as read by clicking on it
        const userSelector = `span[title="${chatName}"]`;
        await page.waitFor(userSelector);
        await page.click(userSelector);
        await page.waitFor('#main > footer div.selectable-text[contenteditable]');
        sentCache[chatName] = moment();
        print(`Skipped ${chatName}'s chat: Only ${minsDiff} minutes passed since last auto-reply...`);
      }
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const chatName of toReply) {
      const text = generateMessage();
      if (await sendMessage(page, chatName, text)) {
        sentCache[chatName] = moment();

      } else {
        logError(`Failed messaging ${chatName} ❌`);
      }
    }

  } catch ({ code, message }) {
    logError(`monitorUnreadMessages error: ${message} ❌`);
  }

  isRunning = false;
};

const { start: startMonitorUnreadMessages, stop: stopMonitorUnreadMessages } = schedule('*/15 * * * * *', monitorUnreadMessages, { scheduled: false })

export { startMonitorUnreadMessages, stopMonitorUnreadMessages }
