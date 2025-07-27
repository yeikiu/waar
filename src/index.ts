import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({
  path: resolve(__dirname, '..', '.env')
});

import { launchFirefox } from './playwright_handlers/launch_firefox';
import { monitorUnreadMessages } from './playwright_handlers/monitor_unread_messages';
import { loadWhatsappWeb } from './playwright_handlers/load_whatsapp_web';
import { existsSync, mkdirSync } from 'fs';


const {
  BROWSER_PROFILE = 'waar_user', HEADLESS = 'false',
  WAAR_DEFAULT_MESSAGE,
} = process.env;

const browserUserDir = resolve(__dirname, '..', '.browser_profile', BROWSER_PROFILE);
if (!existsSync(browserUserDir)) {
  mkdirSync(browserUserDir, { recursive: true });
}

launchFirefox({ headless: HEADLESS !== 'false', browserUserDir })
  .then(async ({ page }) => {
    page = await loadWhatsappWeb(page);
    monitorUnreadMessages(page, WAAR_DEFAULT_MESSAGE);

    setInterval(() => monitorUnreadMessages(page, WAAR_DEFAULT_MESSAGE), 1 * 60 * 1000);

  }).catch(err => {
    console.log({ err });
  });
