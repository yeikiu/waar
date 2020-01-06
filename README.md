# WaAr - WhatsApp AutoReply
Auto-Reply for WhatsApp running on NodeJS

<img width="600" alt="waar preview" src="./waar.png">

Bot is using [GoogleChrome puppeteer!](https://github.com/GoogleChrome/puppeteer) under the hood :smile:

## Features
- Login once and remember session
- Set custom **CHAT_REPLY_INTERVAL_MINUTES**
- Set custom **CHECK_UNREAD_INTERVAL_SECONDS**

## Requirements
- yarn OR npm
- NodeJS v8+

Tested on Windows & MacOS X + Node v8.9.1 and puppeteer v0.13.0

## Installation
- Install [yarn](https://yarnpkg.com/lang/en/docs/install)
- `git clone https://github.com/yeikiu/waar.git` or [download the latest .zip](https://github.com/yeikiu/waar/archive/master.zip)
- CD into dir: `cd waar`
- Get dependencies: `yarn`

## Running the bot
- Finally run `yarn start` for deafult values

OR

- edit the default `.env` config file values

**NOTE:** Once you have connected by scanning QR code, your session will be saved so you won't have to scan it again and again unless you revoke from whatsapp app or by deleting **_tmp** folder. 

## TODO
- Mark each replied chat as unread
- Detect/handle group chat cells
- Detect/handle log out

## Contribute
You are welcome to contribute to this project.

## Disclaimer
This project is not affiliated with official WhatsApp in any sense.
All credits for the base code should be for [sarfraznawaz2005](https://github.com/sarfraznawaz2005/whatspup), this repo wouldn't exist without his fork.
