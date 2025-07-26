import { Page } from 'playwright';
import debugHelper from '../util/debug_helper'
import { doQRlogin } from './do_qr_login'

const { print } = debugHelper(__filename)

export const loadWhatsappWeb = async (page: Page): Promise<Page> => {
  print('Loading Whatsapp-Web... ⏳')

  // page.setViewport({ width: 1024, height: 768 })
  await page.goto('https://web.whatsapp.com/', {
    // waitUntil: 'networkidle2',
    timeout: 0,
  });

  // Let the UI load
  await Promise.race([
    page.waitForSelector('#pane-side', { timeout: 0 }),
    page.waitForSelector('canvas[aria-label="Scan this QR code to link a device!"]', { timeout: 0 }),
  ]);
  print('Whatsapp-Web Loaded! ✔️');
  print('Checking for existing session...');

  // Check if login is needed
  const paneSide = await page.$('#pane-side');
  if (paneSide !== null) {
    print('Already logged in! ✔️');
    print('Loading chats... ⏳');
    return page;
  }

  // QR login needed
  return doQRlogin(page)
};
