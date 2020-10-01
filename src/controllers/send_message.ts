import { Page } from 'puppeteer'
import moment from 'moment'
import debugHelper from '../util/debug_helper'
const { logError, print } = debugHelper(__filename)

const sendMessage = async (page: Page, name: string, text: string): Promise<boolean> => {
  try {
    const userSelector = `span[title="${name}"]`
    await page.waitFor(userSelector)
    await page.click(userSelector)
    await page.waitFor('#main > footer div.selectable-text[contenteditable]')

    const { NODE_ENV = 'production' } = process.env
    if (NODE_ENV !== 'production') {
      print(`TEST: Would have sent to ${name} at ${moment().format('HH:mm')} ✔️`)
      print({ text })
      return true
    }

    await page.click('#main > footer div.selectable-text[contenteditable]')
    const titleName = await page.$eval('#main > header span[title]', (e) => e.textContent)
    if (titleName !== name) {
      logError(`Can't load chat with ${name} ❌`)
      return false
    }

    const parts = text.replace(/\\+n/g, '\n').split('\n')

    for (let i = 0; i < parts.length; i += 1) {
      await page.keyboard.type(parts[i])
      await page.keyboard.down('Shift')
      await page.keyboard.press('Enter')
      await page.keyboard.up('Shift')
    }

    await page.waitFor(1000)
    await page.keyboard.press('Enter')
    print(`Sent to ${name} at ${moment().format('HH:mm')} ✔️`)
    return true

  } catch (sendError) {
    logError(sendError)
    return false
  }
}

export default sendMessage
