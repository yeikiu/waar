/* eslint-disable no-await-in-loop */

import moment from 'moment'
import { debugHelper } from '../util/debug_helper'

import { Page } from 'playwright'
import { generateMessage } from '../generate_message'
import { resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { loadJsonData, saveJsonData } from '../util/json_helper'

const { logError, print, debug } = debugHelper(__filename);

const dataCacheDir = resolve(__dirname, '..', '..', '.data');
const dataCacheFile = resolve(dataCacheDir, 'data_cache.json');
if (!existsSync(dataCacheDir)) {
  mkdirSync(dataCacheDir, { recursive: true });
}

let isRunning = false;
const minMinutesBeforeNewReply = Number(process.env.MIN_MINUTES_BETWEEN_REPLIES ?? 45);

export const monitorUnreadMessages = async (page: Page, replyMessage: string): Promise<void> => {
  if (isRunning) return
  isRunning = true

  try {
    await page.getByRole('tab', { name: 'Unread' }).click();
    await page.waitForLoadState('domcontentloaded');

    const dataCacheObj = loadJsonData(dataCacheFile, {});

    debug('Loading unread chats... ⏳');
    const chatListDiv = page.getByLabel("Chat list");
    // const rowCount = await chatListDiv.getAttribute('aria-rowcount');

    const nextUnreadCellDiv = chatListDiv.getByRole('listitem').first();
    const [targetName] = (await nextUnreadCellDiv.innerText()).split('\n');

    await nextUnreadCellDiv.click();
    await page.getByLabel('Menu').last().click();
    await page.waitForTimeout(2000);

    const contextualMenu = page.getByRole('application').first();
    const [firstMenuOption] = (await contextualMenu.innerText()).split('\n');
    const isGroup = firstMenuOption === 'Group info';

    debug({ firstMenuOption, isGroup });
    if (isGroup) throw new Error('Skip reply to group chat');

    let targetCachedData = new Date(dataCacheObj[targetName]).getTime();
    if (targetCachedData) {
      const minsSinceCached = moment().diff(moment(targetCachedData), 'minutes');
      debug({ targetName, minsSinceCached });
      if (minsSinceCached < minMinutesBeforeNewReply) {
        throw new Error(`Skip reply to ${targetName}, last was ${minsSinceCached} minutes ago`);
      }
    }

    await page.waitForSelector('#main');
    await page.getByLabel('Type a message').focus();

    const parts = generateMessage(replyMessage)
      .replace(/\\+n/g, '\n').split('\n')

    for (let i = 0; i < parts.length; i += 1) {
      await page.keyboard.type(parts[i], { delay: 25 });
      if (i === parts.length - 1) break;
      await page.keyboard.down('Shift');
      await page.keyboard.press('Enter');
      await page.keyboard.up('Shift');
    }

    targetCachedData = new Date().getTime();
    saveJsonData(dataCacheFile, { ...dataCacheObj, [targetName]: targetCachedData });

    // await page.waitForTimeout(7000); // Give link previews some time to load
    // await page.keyboard.press('Enter')
    print(`Sent to ${targetName} at ${moment().format('DD-MM-YYYY HH:mm')} ✔️`);

  } catch (error) {
    // Don't log controlled errors
    if (!['Skip reply', `getByLabel('Chat list')`].some(str => String(error).includes(str))) {
      logError(`${error} ❌`);
    }
  }

  await page.getByRole('tab', { name: 'All' }).click();
  await page.waitForLoadState('domcontentloaded');
  isRunning = false;
}
