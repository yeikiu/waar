const print = require('debug')(`wa-ar:${require('path').parse(__filename).name}*`);
const logError = require('debug')(`wa-ar:${require('path').parse(__filename).name}:error*`);

import * as moment from "moment";

export default {
    generateMessage: (name, text) => `
>> -- AUTO-REPLY -- <<

Hola ${name}!
                    
${text}

>> --- v0.0.1 (beta) --- <<
`,

    sendMessage: async(page, name, text) => {
        try {
            const userSelector = `#pane-side span[title="${name}"]`;
            await page.waitFor(userSelector);
            await page.click(userSelector);
            await page.waitFor('#main > footer div.selectable-text[contenteditable]');
            await page.click('#main > footer div.selectable-text[contenteditable]');
            const titleName = await page.$eval('#main > header span[title]', e => e.textContent);
            if (titleName !== name) {
                logError(`Can't load chat with ${name}`);
                return false;
            }

            const parts = text.split('\n');

            for (var i = 0; i < parts.length; i++) {
                await page.keyboard.type(parts[i]);
                await page.keyboard.down('Shift');
                await page.keyboard.press('Enter');
                await page.keyboard.up('Shift');
            }

            await page.waitFor(1000);
            await page.keyboard.press('Enter');
            print(`Sent to ${name} at ${moment().format('HH:mm')}`);
            return true;
        
        } catch(e) {
            return false;
        }
    }
}