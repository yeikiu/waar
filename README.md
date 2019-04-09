# WaAr - WhatsApp AutoReply
Use WhatsApp web to let everyone know you're busy.

Bot is using [GoogleChrome puppeteer!](https://github.com/GoogleChrome/puppeteer) under the hood :smile:

## Features ##

- :white_check_mark: Login once and remember session
- :white_check_mark: Set message-checking interval
- :white_check_mark: Set minimun time-frame between consecutive auto-replies

## Requirements ##

- Node v8+
- puppeteer v0.13.0+

Tested on MacOS X with Node v8.9.1 and puppeteer v0.13.0

## Installation ##

- Clone this repository. `git clone https://github.com/sarfraznawaz2005/whatspup.git`
- Type `npm install`
- Type `node chat.js USERNAME` (case-sensitive)
- Chrome will open up, now just scan Whatsapp QR Code once via whatsapp app in your mobile
- Wait for connection and start typing your messages :smile:


**NOTE:** Once you have connected by scanning QR code, your session will be saved so you won't have to scan it again and again unless you revoke from whatsapp app or by deleting **tmp** folder. 

## Commands ##

**Changing User**

You can switch chat with another user anytime by typing on console:
`--chat USERNAME` (case-sensitive)

**NOTE:** `USERNAME` is supposed to be a person with whom you have already initiated a conversation in whatsapp. In other words, we use a selector to click that user's name from conversations list.

**Clear Chat Screen**

To clear chat screen, type `--clear`.

## Options ##

You can set various options in `config.js` file.

## Others ##

 - You can send common emojis directly by typing `:smile:`, `:lol:`, `:happy:`, `:love:`, `:wink:` OR `;-)`, `:-)`, `<3`, etc

## Contribute ##

You are welcome to contribute to this project.

## Disclaimer ##

This project is not affiliated with official whatsapp in any sense.
