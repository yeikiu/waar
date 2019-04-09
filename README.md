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
- Type `yarn install`
- Type `yarn start`

- 1st time you run the waWeb QR code will appear so you can scan it and close the image. You can play with the config file to make Chrome window open up, change time intervals.

**NOTE:** Once you have connected by scanning QR code, your session will be saved so you won't have to scan it again and again unless you revoke from whatsapp app or by deleting **_tmp** folder. 

## Contribute ##

You are welcome to contribute to this project.

## Disclaimer ##

This project is not affiliated with official WhatsApp in any sense.
