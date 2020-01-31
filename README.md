# WaAr - WhatsApp AutoReply
Auto-Reply for WhatsApp running on NodeJS

<img width="600" alt="waar preview" src="./waar.png">

> This bot uses [GoogleChrome puppeteer!](https://github.com/GoogleChrome/puppeteer) under the hood :smile:

## Features
- Login once and remember session
- Set custom **WAAR_CHAT_REPLY_INTERVAL_MINUTES**
- Set custom **WAAR_CHECK_UNREAD_INTERVAL_SECONDS**

## Requirements
- yarn OR npm
- NodeJS

Tested on Windows & MacOS X + Node v12.8.0 and puppeteer v0.13.0

## Installation
- Install [yarn](https://yarnpkg.com/lang/en/docs/install)
- `git clone https://github.com/yeikiu/waar.git` or [download the latest .zip](https://github.com/yeikiu/waar/archive/master.zip)
- CD into dir: `cd waar`
- Get dependencies: `yarn`

## Running the bot
- `yarn start` (MacOs/Linux)
- `yarn start:win` (Windows)

## Custom config
- Edit `.env` config file values before running with `yarn start` or `yarn start:win`

**NOTE:** Once you have connected by scanning QR code, your session will be saved so you won't have to scan it again and again unless you revoke from whatsapp app or by deleting **.cache** folder. 

## Contribute
You are welcome to contribute to this project.

> Run in dev mode with hot-reloading:
- `yarn watch`
- `yarn watch:win`

## TODO
- Mark each replied chat as unread
- Detect/handle group chat cells
- Detect/handle log out

## Disclaimer
This project is not affiliated with official WhatsApp in any sense.
All credits for the base code should be for [sarfraznawaz2005](https://github.com/sarfraznawaz2005/whatspup), this repo wouldn't exist without his fork.