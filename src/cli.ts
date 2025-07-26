#!/usr/bin/env node

import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({
  path: resolve(__dirname, '..', '.env')
});

import repl from 'repl';

import debugHelper from './util/debug_helper';;
import loadJSONObj from './util/load_json_object';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { BrowserContext, FirefoxBrowser, Page } from 'playwright';
import { launchFirefox } from './playwright_utils/launch_firefox';
import { monitorUnreadMessages } from './tasks/monitor_unread_messages';
import { loadWhatsappWeb } from './controllers/load_whatsapp_web';

const { print } = debugHelper(__filename);
const [, arg1, arg2] = process.argv;
const argsStr = [arg1, arg2].join(' ');
const { name, version } = loadJSONObj(resolve(__dirname, '..', 'package.json'));

if (/\s-v\s*$/.test(argsStr)) {
  print(`    ${name} v${version} ✔️`);
  process.exit();
}

const waarConfigPath = resolve(__dirname, '..', 'config', 'waar_globals.json');
const waarConfig = loadJSONObj(waarConfigPath);
let {
  WAAR_DEFAULT_MESSAGE,
  WAAR_CHAT_REPLY_INTERVAL_MINUTES,
} = waarConfig;

const { BROWSER_PROFILE = 'waar_user', HEADLESS = 'false' } = process.env;
const browserUserDir = resolve(__dirname, '..', '.browser_profile', BROWSER_PROFILE)
if (!existsSync(browserUserDir)) {
  mkdirSync(browserUserDir, { recursive: true });
}

let browser: FirefoxBrowser | BrowserContext | null = null;
let page: Page | null = null;

const myRepl = repl.start(`  >>> ${name} v${version} <<<\n\n`);

// Modify core methods (bit hacky, these are readonly)
['save', 'load', 'editor', 'clear', 'break'].forEach(c => delete (myRepl.commands as any)[c]);
const coreMethods = Object.keys(myRepl.commands);
const editedCoreMethods = coreMethods.reduce((p, c) => ({
  ...p,
  [c]: {
    ...myRepl.commands[c],
    help: `👉 ${myRepl.commands[c].help}\n---`
  }
}), {});
Object.assign(myRepl.commands, editedCoreMethods);

// Custom commands
myRepl.defineCommand('start', {
  help: `👉 START Whatsapp Auto-Reply
---`,

  action: async () => {
    print('Launching browser... 🕗', { HEADLESS });
    const { page: ffPage, browser: ffBrowser } = await launchFirefox({ headless: HEADLESS !== 'false', browserUserDir });
    browser = ffBrowser;
    page = await loadWhatsappWeb(ffPage);

    monitorUnreadMessages(page);
  }
})

myRepl.defineCommand('stop', {
  help: `👉 STOP Whatsapp Auto-Reply
---`,
  action: () => {
    print('Stopping browser... 🕗');
    //stopMonitorUnreadMessages();
  }
})

myRepl.defineCommand('chmsg', {
  help: `👉 Change default Auto-Reply message
---`,
  action: () => myRepl.question('Message: ', (message: string) => {
    WAAR_DEFAULT_MESSAGE = message;
    writeFileSync(waarConfigPath, JSON.stringify({ ...waarConfig, WAAR_DEFAULT_MESSAGE }, null, 2));
    print(`New message set to: ${message}`);
  })
})

myRepl.defineCommand('interval', {
  help: `👉 Change per-chat interval between replies
---`,
  action: () => myRepl.question('Message: ', (minutes: string) => {
    WAAR_CHAT_REPLY_INTERVAL_MINUTES = minutes;
    writeFileSync(waarConfigPath, JSON.stringify({ ...waarConfig, WAAR_CHAT_REPLY_INTERVAL_MINUTES }, null, 2));
    print(`Interval updated to: ${minutes} minutes`);
  })
})

/* myRepl.defineCommand('toggle', {
  help: '👉 Toggle HEADLESS browser flag (Use before launching)',
  action: () => {
    WAAR_HEADLESS = !WAAR_HEADLESS;
    writeFileSync(waarConfigPath, JSON.stringify({ ...waarConfig, WAAR_HEADLESS }, null, 2));
    if (WAAR_HEADLESS) {
      print(`Browser is in HEADLESS mode`);
    } else {
      print(`Browser is in Window UI mode`);
    }
  }
}) */

// Shell entrypoint
myRepl.write('.help | Press enter to continue...');
