import waar from './main';

const nodeMenu = require('node-menu');
const path = require('path');
// eslint-disable-next-line import/no-dynamic-require
const pkg = require(path.resolve('package'));

const waarMenu = nodeMenu
  .customHeader(() => {
    process.stdout.write(`  >>> Waar v${pkg.version} <<<\n\n`);
  })
  .addDelimiter('~ ', 20)
  .addItem('Launch Whatsapp Auto-Reply\n', waar.launchWaar)
  .addItem('Print current params\n', waar.printParams)
  .addDelimiter('~ ', 20)
  .customPrompt(() => {
    process.stdout.write('\nEnter your selection:\n');
  })
  .continueCallback(() => {
    // Runs between 'Press enter to continue' and the new menu render
  });

export default waarMenu;
