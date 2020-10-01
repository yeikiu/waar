#!/usr/bin/env node

import dotenv from 'dotenv'
import { resolve } from 'path'
dotenv.config({
  path: resolve(__dirname, '..', '.env')
})

import nodeMenu from 'node-menu'
import monitorUnreadMessages from './tasks/monitor_unread_messages'
import debugHelper from './util/debug_helper';
import loadJSONObj from './util/load_json_object'
import { writeFileSync } from 'fs'

const { print } = debugHelper(__filename);
const [,arg1, arg2] = process.argv
const argsStr = [arg1, arg2].join(' ')
const { name, version } = loadJSONObj(resolve(__dirname, '..', 'package.json'))

if (/\s-v\s*$/.test(argsStr)) {  
  print(`    ${name} v${version} ✔️`)
  process.exit()
}

const waarConfigPath = resolve(__dirname, '..', 'config', 'waar_globals.json')
const waarConfig = loadJSONObj(waarConfigPath)
let {
  WAAR_HEADLESS,
  WAAR_DEFAULT_MESSAGE,
  WAAR_CHAT_REPLY_INTERVAL_MINUTES
} = waarConfig

const { startMonitorUnreadMessages, stopMonitorUnreadMessages } = monitorUnreadMessages

nodeMenu
  .customHeader(() => {
    process.stdout.write(`  >>> ${name} v${version} <<<\n\n`)
  })

  .addDelimiter('~ ', 20)
  .addItem('START Whatsapp Auto-Reply', () => { 
    print('Launching browser... 🕗', { headless: WAAR_HEADLESS })
    startMonitorUnreadMessages() 
  })
  .addItem('STOP Whatsapp Auto-Reply', stopMonitorUnreadMessages)

  .addDelimiter(' ', 1)
  .addItem('Print current params', () => print({
    WAAR_HEADLESS,
    WAAR_DEFAULT_MESSAGE,
    WAAR_CHAT_REPLY_INTERVAL_MINUTES
  }))

  .addDelimiter(' ', 1)
  .addItem('Change default Auto-Reply message', (message: string) => { WAAR_DEFAULT_MESSAGE = message; writeFileSync(waarConfigPath, JSON.stringify({ ...waarConfig, WAAR_DEFAULT_MESSAGE }, null, 2)) }, null, [{ name: `4 <new_response>" | i.e. >> 4 "I can't answer now. Call you later! :-)`, type: 'string' }])
  .addItem('Change per-chat interval between replies', (minutes: number) => { WAAR_CHAT_REPLY_INTERVAL_MINUTES = minutes; writeFileSync(waarConfigPath, JSON.stringify({ ...waarConfig, WAAR_CHAT_REPLY_INTERVAL_MINUTES }, null, 2)) }, null, [{ name: '<minutes>" | i.e. >> "5 90', type: 'numeric' }])
  .addItem('Toggle HEADLESS browser flag (Use before 1)', () => { WAAR_HEADLESS = !WAAR_HEADLESS; writeFileSync(waarConfigPath, JSON.stringify({ ...waarConfig, WAAR_HEADLESS }, null, 2)) })

  .addDelimiter(' ', 1)
  .addDelimiter('~ ', 20)
  .customPrompt(() => {
    process.stdout.write('\nEnter your selection:\n')
  })
  .continueCallback(() => {
    // Runs between 'Press enter to continue' and the new menu render
  })
  .start()
