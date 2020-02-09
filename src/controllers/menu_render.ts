import waar from './menu_handler';

const nodeMenu = require('node-menu');
const path = require('path');
// eslint-disable-next-line import/no-dynamic-require
const pkg = require(path.resolve('package'));

const waarMenu = nodeMenu
  .customHeader(() => {
    process.stdout.write(`  >>> Waar v${pkg.version} <<<\n\n`);
  })

  .addDelimiter('~ ', 20)
  .addItem(
    'Launch Whatsapp Auto-Reply',
    (message: string) => {
      if (message !== '*') process.env.WAAR_DEFAULT_MESSAGE = message;
      waar.launchWaar();
    },
    null,
    [{ name: '\'1 *\' (default message) OR 1 <YOUR MESSAGE>', type: 'string' }],
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
    [{ name: '3 <YOUR MESSAGE>', type: 'string' }],
  )

  .addDelimiter(' ', 1)
  .addDelimiter('~ ', 20)
  .customPrompt(() => {
    process.stdout.write('\nEnter your selection:\n');
  })
  .continueCallback(() => {
    // Runs between 'Press enter to continue' and the new menu render
  });

export default waarMenu;
