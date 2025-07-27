import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({
  path: resolve(__dirname, '..', '.env')
});

import { launchFirefox } from './playwright_handlers/launch_firefox';
import { monitorUnreadMessages } from './playwright_handlers/monitor_unread_messages';
import { loadWhatsappWeb } from './playwright_handlers/load_whatsapp_web';
import { existsSync, mkdirSync } from 'fs';
import { debugHelper } from './util/debug_helper';

const { print, logError } = debugHelper(__filename);

const {
  BROWSER_PROFILE = 'waar_user', HEADLESS = 'false',
  WAAR_DEFAULT_MESSAGE,
  MINUTES_BETWEEN_UNREAD_CHECKS = 1
} = process.env;

const browserUserDir = resolve(__dirname, '..', '.browser_profile', BROWSER_PROFILE);
if (!existsSync(browserUserDir)) {
  mkdirSync(browserUserDir, { recursive: true });
}

launchFirefox({ headless: HEADLESS !== 'false', browserUserDir })
  .then(async ({ page }) => {

    page = await loadWhatsappWeb(page);
    monitorUnreadMessages(page, WAAR_DEFAULT_MESSAGE);
    
    print(`Checking unread chats each ${MINUTES_BETWEEN_UNREAD_CHECKS} minute(s)... ⏳`);
    setInterval(() => monitorUnreadMessages(page, WAAR_DEFAULT_MESSAGE),
      Number(MINUTES_BETWEEN_UNREAD_CHECKS) * 60 * 1000
    );

  }).catch(error => {
    logError(`${error} ❌`);
  });
