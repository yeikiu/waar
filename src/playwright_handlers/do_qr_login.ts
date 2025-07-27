import * as qrcode from 'qrcode-terminal';
import { debugHelper } from '../util/debug_helper';
import { Page } from 'playwright';

const { debug, print } = debugHelper(__filename);

export const doQRlogin = async (page: Page): Promise<Page> => {
  print('Login required! Please wait while QR code is generated... ⏳');
  await page.waitForSelector('div[data-ref]', { timeout: 0 });

  const dataRef = await page.$eval('div[data-ref]', div => div.getAttribute('data-ref'));
  debug({ dataRef });
  qrcode.generate(dataRef, { small: true });

  print('Please scan the QR code above with your phone\'s WhatsApp scanner ☝️');

  await page.waitForSelector('#pane-side', { timeout: 0 });
  print('Logged IN! ✔️');
  return page;
};
