/* eslint-disable no-await-in-loop */

import * as moment from 'moment';
import { Page } from 'puppeteer';
import { ChatCell } from '../types/chat_cell';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import debugHelper from '../util/debug_helper';
const { debug, logError, print } = debugHelper(__filename);

const pkgPath = resolve(__dirname, '../..', 'package.json');
const { name, version } = JSON.parse(readFileSync(pkgPath).toString())

const generateMessage = (): string => {
  const { WAAR_DEFAULT_MESSAGE } = process.env;

  return `🤖💬 *Whatsapp AUTO-REPLY* v${version}
                  
${WAAR_DEFAULT_MESSAGE}

>> https://github.com/yeikiu/waar <<`;
};

const sendMessage = async (page: Page, name: string, text: string): Promise<boolean> => {
  try {
    const userSelector = `#pane-side span[title="${name}"]`;
    await page.waitFor(userSelector);
    await page.click(userSelector);
    await page.waitFor('#main > footer div.selectable-text[contenteditable]');

    if (process.env.NODE_ENV !== 'production') {
      print(`TEST: Would have sentCache to ${name} at ${moment().format('HH:mm')}`);
      print({ text });
      return true;
    }

    await page.click('#main > footer div.selectable-text[contenteditable]');
    const titleName = await page.$eval('#main > header span[title]', (e) => e.textContent);
    if (titleName !== name) {
      logError(`Can't load chat with ${name}`);
      return false;
    }

    const parts = text.replace(/\\+n/g, '\n').split('\n');

    for (let i = 0; i < parts.length; i += 1) {
      await page.keyboard.type(parts[i]);
      await page.keyboard.down('Shift');
      await page.keyboard.press('Enter');
      await page.keyboard.up('Shift');
    }

    await page.waitFor(1000);
    await page.keyboard.press('Enter');
    print(`Sent to ${name} at ${moment().format('HH:mm')}`);
    return true;
  } catch (e) {
    return false;
  }
};

const sentCache = {};

export default {

  async chatMonitor(
    page: Page,
  ): Promise<void> {
    
    // Load config
    const {
      WAAR_CHAT_REPLY_INTERVAL_MINUTES = 90,
      WAAR_CHECK_UNREAD_INTERVAL_SECONDS = 10
    } = process.env;

    const chatReplyIntervalMinutes = Number(WAAR_CHAT_REPLY_INTERVAL_MINUTES);
    const checkUnreadIntervalSeconds = Number(WAAR_CHECK_UNREAD_INTERVAL_SECONDS);

    const allUnreads: ChatCell[] = await page.$eval('#pane-side div:nth-child(1) div:nth-child(1) div:nth-child(1)', (ps) => Array.from(ps.childNodes || [])
      .map((c: ChildNode) => ({
        isGroup: c.lastChild.parentElement.innerHTML.includes('span data-icon="default-group"'),
        numUnread: Number(c.lastChild.lastChild.lastChild.lastChild.lastChild.textContent || 0),
        chatName: c.lastChild.firstChild.lastChild.firstChild.firstChild.textContent || '',
      }))
      .filter((c: ChatCell) => !c.isGroup && c.numUnread > 0 && c.chatName.length > 0)
    );
    debug({ allUnreads })  ;

    const toReply = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const { chatName } of allUnreads) {
      const minsDiff = moment().diff(sentCache[chatName], 'minutes');

      if (!sentCache[chatName] || minsDiff >= chatReplyIntervalMinutes) {
        toReply.push(chatName);

      } else {
        // Mark chat cell as read by clicking on it
        const userSelector = `#pane-side span[title="${chatName}"]`;
        await page.waitFor(userSelector);
        await page.click(userSelector);
        await page.waitFor('#main > footer div.selectable-text[contenteditable]');
        sentCache[chatName] = moment();
        print(`Skipped ${chatName}'s chat: Only ${minsDiff} minutes passed since last auto-reply.`);
      }
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const chatName of toReply) {
      const text = generateMessage();
      if (await sendMessage(page, chatName, text)) {
        sentCache[chatName] = moment();

      } else {
        logError(`Failed messaging ${chatName}`);
      }
    }

    setTimeout(
      () => this.chatMonitor(page),
      checkUnreadIntervalSeconds * 1000,
    );
  },
};
