#!/usr/bin/env node

import waar from './controllers/menu_handler';
import nodeMenu = require('node-menu');
import { resolve } from 'path';
import { readFileSync } from 'fs';

const [,, arg] = process.argv;

const pkgPath = resolve(__dirname, '..', 'package.json');
const { name, version } = JSON.parse(readFileSync(pkgPath).toString())

// display version and short-circuit exit
if (/-v.*/.test(arg)) {    
    console.log(`${name} v${version}`);
    process.exit();
}

nodeMenu
  .customHeader(() => {
    process.stdout.write(`  >>> ${name} v${version} <<<\n\n`);
  })

  .addDelimiter('~ ', 20)
  .addItem(
    'Launch Whatsapp Auto-Reply',
    waar.launchWaar,
  )

  .addDelimiter(' ', 1)
  .addItem('Print current params', waar.printParams)

  .addDelimiter(' ', 1)
  .addItem(
    'Change default Auto-Reply message',
    (message: string) => {
      process.env.WAAR_DEFAULT_MESSAGE = message;
    },
    null,
    [{ name: '\n\n   i.e. >> 3 "I can´t answer now. Call you later! :-)', type: 'string' }],
  )

  .addDelimiter(' ', 1)
  .addDelimiter('~ ', 20)
  .customPrompt(() => {
    process.stdout.write('\nEnter your selection:\n');
  })
  .continueCallback(() => {
    // Runs between 'Press enter to continue' and the new menu render
  })
  .start();
