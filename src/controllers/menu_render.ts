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

  .addDelimiter(' ', 1)
  .addItem(
    'Launch Whatsapp Auto-Reply',
    (message: string) => {
      waar.launchWaar(message !== '*' ? message : process.env.WAAR_DEFAULT_MESSAGE);
    },
    null,
    [{ name: '(use \'1 *\' for default message)"\n\t"i.e": 1 "Sorry but I cant use my phone right now. Call you later', type: 'string' }],
  )

  .addDelimiter(' ', 1)
  .addItem('Print current params\n', waar.printParams)

  .addDelimiter('~ ', 20)
  .customPrompt(() => {
    process.stdout.write('\nEnter your selection:\n');
  })
  .continueCallback(() => {
    // Runs between 'Press enter to continue' and the new menu render
  });

export default waarMenu;
