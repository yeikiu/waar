#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config();

import * as nodeMenu from 'node-menu';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import printEnvs from './controllers/print_envs';
import monitorUnreadMessages from './tasks/monitor_unread_messages';

const [,arg1, arg2] = process.argv
const argsStr = [arg1, arg2].join(' ')
const { name, version } = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json')).toString())

if (/\s-v$)/.test(argsStr)) {  
  console.log(`    ${name} v${version} ✔️`)
  process.exit()
}

const { startMonitorUnreadMessages, stopMonitorUnreadMessages } = monitorUnreadMessages

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
