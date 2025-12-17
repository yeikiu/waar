<img src=".ci_badges/npm-version-badge.svg" /> <img src=".ci_badges/npm-dependencies-badge.svg" /> <img src=".ci_badges/npm-devdependencies-badge.svg" />

# 🤖💬 waar | WhatsApp Auto-Reply

- Runs headless: No browser UI window displayed. (You can change this later with `HEADLESS` env variable) 
- Keeps session stored for next uses: Scan QR directly from terminal and only once

<img src=".github/waar_demo_1.png" />

<img src=".github/waar_demo_2.png" />

## ✨ Usage

- `npx waar` (easiest way, no clone required)

## 💻 Shell Installation

> **Requires Git, NodeJS and npm** installed in your system

- `git clone https://github.com/yeikiu/waar`
- `cd waar`
- `npm i` (install dependencies once)

- `npm run start` / `npm run watch` (dev mode)

## 🔧 .env config

```
# Use `HEADLESS=false` if you want to see the browser window while running
HEADLESS=true

# The auto-reply message sent to contacts (groups are ignored by default)
WAAR_DEFAULT_MESSAGE='En estos momentos no puedo responder WhatsApps. 🙏🏼\n\nTe escribo pronto! 🤓'

# Time interval to check for new chats under the `Unread` tab
MINUTES_BETWEEN_UNREAD_CHECKS=1

# Time interval to skip auto-replies after last one ocurred for a contact (avoids spamming)
MIN_MINUTES_BETWEEN_REPLIES=180
```

## 📝 Development

- `npm run watch`
