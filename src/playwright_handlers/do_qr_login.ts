import * as qrcode from 'qrcode-terminal';
import { debugHelper } from '../util/debug_helper';
import { Page } from 'playwright';

const { print } = debugHelper(__filename);

export const doQRlogin = async (page: Page): Promise<Page> => {
  print('Login required! Please wait while QR code is generated... ⏳');
  await page.waitForSelector('div[data-ref]', { timeout: 0 });

  const dataRefDiv = page.locator('div[data-ref]');
  const dataRef = await dataRefDiv.getAttribute('data-ref');
  qrcode.generate(dataRef, { small: true });

  print('Please scan the QR code above with your phone\'s WhatsApp scanner ☝️');

  await page.waitForSelector('#pane-side', { timeout: 0 });
  print('Logged IN! ✔️');
  return page;
};
