/* eslint-disable no-await-in-loop */
// Output setup

import * as moment from 'moment';
// eslint-disable-next-line no-unused-vars
import { Page } from 'puppeteer';
import debugHelper from '../util/debug_helper';

// eslint-disable-next-line no-unused-vars
const { logError, print } = debugHelper(__filename);

const sent = {};

const generateMessage = () => {
  const { WAAR_DEFAULT_MESSAGE } = process.env;

  return `>> AUTO-REPLY v1.0.2 <<
                  
${WAAR_DEFAULT_MESSAGE}

>> https://github.com/yeikiu/waar <<`;
};

const sendMessage = async (page: Page, name: string, text: string) => {
  if (process.env.NODE_ENV === 'development') {
    print(`TEST: Would have sent to ${name} at ${moment().format('HH:mm')}`);
    print({ text });
    return true;
  }

  try {
    const userSelector = `#pane-side span[title="${name}"]`;
    await page.waitFor(userSelector);
    await page.click(userSelector);
    await page.waitFor('#main > footer div.selectable-text[contenteditable]');
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

export default {

  async chatMonitor(
    page: Page,
    WAAR_CHAT_REPLY_INTERVAL_MINUTES: number,
    WAAR_CHECK_UNREAD_INTERVAL_SECONDS: number,
  ) {
    const allUnreads = await page.$eval('#pane-side', (ps) => Array.from(ps.firstChild.firstChild.firstChild.childNodes || [])
      .map((c: any) => ({
        isGroup: null, // TODO group detection
        num: c.lastChild.lastChild.lastChild.lastChild.lastChild.textContent || '0',
        name: c.lastChild.firstChild.lastChild.firstChild.firstChild.firstChild.firstChild.title || '',
      }))
      .filter((c: any) => parseInt(c.num, 10) > 0 && c.name.length > 0));

    const toReply = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const unread of allUnreads) {
      const minsDiff = moment().diff(sent[unread.name], 'minutes');

      if (!sent[unread.name] || minsDiff >= WAAR_CHAT_REPLY_INTERVAL_MINUTES) {
        toReply.push(unread);
      } else {
        // test: check chat
        const userSelector = `#pane-side span[title="${unread.name}"]`;
        await page.waitFor(userSelector);
        await page.click(userSelector);
        await page.waitFor('#main > footer div.selectable-text[contenteditable]');
        sent[unread.name] = moment();
        print(`Skipped ${unread.name}'s chat: Only ${minsDiff} minutes passed since last auto-reply.`);
      }
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const target of toReply) {
      const text = generateMessage();
      if (await sendMessage(page, target.name, text)) {
        sent[target.name] = moment();
      } else {
        logError(`Failed messaging ${target.name}`);
      }
    }

    // await page.waitFor(WAAR_CHECK_UNREAD_INTERVAL_SECONDS * 1000);
    setTimeout(
      () => this.chatMonitor(
        page,
        WAAR_CHAT_REPLY_INTERVAL_MINUTES,
        WAAR_CHECK_UNREAD_INTERVAL_SECONDS,
      ),
      WAAR_CHECK_UNREAD_INTERVAL_SECONDS * 1000,
    );
  },
};
