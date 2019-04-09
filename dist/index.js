"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug = require('debug')("wa-ar:" + require('path').parse(__filename).name);
var logError = require('debug')("wa-ar:" + require('path').parse(__filename).name + ":error*");
var print = require('debug')("wa-ar:" + require('path').parse(__filename).name + "*");
var puppeteer = require('puppeteer');
var open = require("open");
var path = require('path');
var findChrome = require('./../lib/find_chrome.js');
var config = require('./../config.js');
var chat_handler_1 = require("./handlers/chat_handler");
var moment = require("moment");
// catch un-handled promise errors
process.on("unhandledRejection", function (reason, p) {
    logError("Unhandled Rejection at: Promise", p, "reason:", reason);
});
(function main() {
    return __awaiter(this, void 0, void 0, function () {
        var executablePath, headless, browser, page, title, e_1, awaitQR, awaitChats, sent, startTime, unreads, _i, _a, unread, text;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    executablePath = findChrome().pop() || null;
                    headless = !config.window;
                    return [4 /*yield*/, puppeteer.launch({
                            headless: headless,
                            executablePath: executablePath,
                            userDataDir: path.resolve(__dirname, config.data_dir),
                            ignoreHTTPSErrors: true,
                            args: [
                                '--log-level=3',
                                //'--start-maximized',
                                '--no-default-browser-check',
                                '--disable-infobars',
                                '--disable-web-security',
                                '--disable-site-isolation-trials',
                                '--no-experiments',
                                '--ignore-gpu-blacklist',
                                '--ignore-certificate-errors',
                                '--ignore-certificate-errors-spki-list',
                                '--disable-gpu',
                                '--disable-extensions',
                                '--disable-default-apps',
                                '--enable-features=NetworkService',
                                '--disable-setuid-sandbox',
                                '--no-sandbox',
                            ]
                        })];
                case 1:
                    browser = _b.sent();
                    return [4 /*yield*/, browser.pages()];
                case 2:
                    page = (_b.sent())[0];
                    //await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36');
                    return [4 /*yield*/, page.goto('https://web.whatsapp.com/', {
                            waitUntil: 'networkidle2',
                            timeout: 0
                        })];
                case 3:
                    //await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36');
                    _b.sent();
                    title = null;
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, page.$eval('.window-title', function (t) {
                            if (!t)
                                return null;
                            return t.textContent;
                        })];
                case 5:
                    title = _b.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _b.sent();
                    return [3 /*break*/, 7];
                case 7:
                    ;
                    debug('title', title);
                    // this means browser upgrade warning came up for some reasons
                    if (title && title.includes('Google Chrome 36+')) {
                        logError("Can't open whatsapp web, most likely got browser upgrade message....");
                        process.exit();
                    }
                    awaitQR = page.waitForSelector('img[alt="Scan me!"]');
                    awaitChats = page.waitForSelector('#pane-side');
                    return [4 /*yield*/, Promise.race([awaitQR, awaitChats]).then(function (value) {
                            return __awaiter(this, void 0, void 0, function () {
                                var qrCode, qrPath;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, page.$('img[alt="Scan me!"]')];
                                        case 1:
                                            qrCode = _a.sent();
                                            if (!qrCode) return [3 /*break*/, 5];
                                            qrPath = "lastqr.png";
                                            return [4 /*yield*/, page.$('div:nth-child(2) > div:nth-child(2) > div:nth-child(1)')];
                                        case 2: return [4 /*yield*/, (_a.sent()).screenshot({ path: qrPath })];
                                        case 3:
                                            _a.sent();
                                            return [4 /*yield*/, open(qrPath)];
                                        case 4:
                                            _a.sent();
                                            print("Please scan the QR code with your phone's WhatsApp scanner.\nYou can close the image once scanned.");
                                            _a.label = 5;
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            });
                        })];
                case 8:
                    _b.sent();
                    debug('Waiting on #pane-side');
                    return [4 /*yield*/, page.waitForSelector('#pane-side')];
                case 9:
                    _b.sent();
                    sent = new Map();
                    startTime = moment.utc();
                    _b.label = 10;
                case 10:
                    if (!true) return [3 /*break*/, 17];
                    console.log("Running for " + moment.utc().diff(startTime, 'seconds') + " seconds");
                    return [4 /*yield*/, page.$eval('#pane-side', function (ps) {
                            console.log('IN');
                            return Array.from(ps.firstChild.firstChild.firstChild.childNodes || {})
                                .map(function (c) {
                                return {
                                    isGroup: null,
                                    num: c.lastChild.lastChild.lastChild.lastChild.lastChild.textContent || '0',
                                    name: c.lastChild.firstChild.lastChild.firstChild.firstChild.firstChild.firstChild.title || ''
                                };
                            })
                                .filter(function (c) { return parseInt(c.num) > 0 && c.name.length > 0; });
                        }, sent)];
                case 11:
                    unreads = _b.sent();
                    _i = 0, _a = unreads.filter(function (u) { return !sent.has(u.name); });
                    _b.label = 12;
                case 12:
                    if (!(_i < _a.length)) return [3 /*break*/, 15];
                    unread = _a[_i];
                    if (sent.has(unread.name)) {
                        console.log("Message to " + unread.name + " already sent");
                        return [3 /*break*/, 14];
                    }
                    text = chat_handler_1.default.generateMessage(unread.name);
                    return [4 /*yield*/, chat_handler_1.default.sendMessage(page, unread.name, text)];
                case 13:
                    if (_b.sent()) {
                        sent.set(unread.name, moment.utc());
                    }
                    else {
                        console.log("Failed message to " + unread.name);
                    }
                    _b.label = 14;
                case 14:
                    _i++;
                    return [3 /*break*/, 12];
                case 15: return [4 /*yield*/, page.waitFor(10000)];
                case 16:
                    _b.sent();
                    return [3 /*break*/, 10];
                case 17: return [2 /*return*/];
            }
        });
    });
})();
