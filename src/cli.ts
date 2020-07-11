#!/usr/bin/env node

import * as nodeMenu from 'node-menu';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import printEnvs from './controllers/print_envs';
import monitorUnreadMessages from './tasks/monitor_unread_messages';

const { startMonitorUnreadMessages, stopMonitorUnreadMessages } = monitorUnreadMessages

const [, , arg] = process.argv;

const pkgPath = resolve(__dirname, '..', 'package.json');
const { name, version } = JSON.parse(readFileSync(pkgPath).toString())

// display version and short-circuit exit
if (/-v.*/.test(arg)) {
  console.log(`${name} v${version} ✔️`);
  process.exit();
}

nodeMenu
  .customHeader(() => {
    process.stdout.write(`  >>> ${name} v${version} <<<\n\n`);
  })

  .addDelimiter('~ ', 20)
  .addItem('START Whatsapp Auto-Reply', startMonitorUnreadMessages)
  .addItem('STOP Whatsapp Auto-Reply', stopMonitorUnreadMessages)

  .addDelimiter(' ', 1)
  .addItem('Print current params', printEnvs)

  .addDelimiter(' ', 1)
  .addItem('Change default Auto-Reply message', (message: string) => { process.env.WAAR_DEFAULT_MESSAGE = message; }, null, [{ name: '<new_response>" | i.e. >> 3 "I can´t answer now. Call you later! :-)', type: 'string' }])
  .addItem('Change per-chat interval between replies', (minutes: number) => { process.env.WAAR_CHAT_REPLY_INTERVAL_MINUTES = minutes.toString(); }, null, [{ name: '<minutes>" | i.e. >> "5 90', type: 'numeric' }])

  .addDelimiter(' ', 1)
  .addDelimiter('~ ', 20)
  .customPrompt(() => {
    process.stdout.write('\nEnter your selection:\n');
  })
  .continueCallback(() => {
    // Runs between 'Press enter to continue' and the new menu render
  })
  .start();
