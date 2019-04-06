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
var puppeteer = require('puppeteer');
var findChrome = require('./../lib/find_chrome.js');
var config = require('./../config.js');
var message = require('./../lib/message.js');
var chatHandler = require("./chat_handler");
// catch un-handled promise errors
process.on("unhandledRejection", function (reason, p) {
    //console.warn("Unhandled Rejection at: Promise", p, "reason:", reason);
});
(function main() {
    return __awaiter(this, void 0, void 0, function () {
        var executablePath, tmpPath, headless, browser, page, unreads, _i, unreads_1, unread, text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    executablePath = findChrome().pop() || null;
                    tmpPath = config.data_dir;
                    headless = !config.window;
                    return [4 /*yield*/, puppeteer.launch({
                            headless: headless,
                            executablePath: executablePath,
                            userDataDir: tmpPath,
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
                                '--no-sandbox'
                            ]
                        })];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 2:
                    page = _a.sent();
                    return [4 /*yield*/, page.goto('https://web.whatsapp.com/', {
                            waitUntil: 'networkidle2',
                            timeout: 0
                        })];
                case 3:
                    _a.sent();
                    console.log('Waiting on #pane-side');
                    return [4 /*yield*/, page.waitForSelector('#pane-side')];
                case 4:
                    _a.sent();
                    console.log('IN');
                    _a.label = 5;
                case 5:
                    if (!true) return [3 /*break*/, 12];
                    console.log('LOOP');
                    return [4 /*yield*/, page.$eval('#pane-side', function (ps) {
                            return Array.from(ps.firstChild.firstChild.firstChild.childNodes || {})
                                .map(function (c) {
                                return {
                                    num: c.lastChild.lastChild.lastChild.lastChild.lastChild.textContent,
                                    name: c.lastChild.firstChild.lastChild.firstChild.firstChild.firstChild.firstChild.title
                                };
                            })
                                .filter(function (c) { return parseInt(c.num) > 0; });
                        })];
                case 6:
                    unreads = _a.sent();
                    console.log('unreads', unreads);
                    _i = 0, unreads_1 = unreads;
                    _a.label = 7;
                case 7:
                    if (!(_i < unreads_1.length)) return [3 /*break*/, 11];
                    unread = unreads_1[_i];
                    text = message.generate(unread.name);
                    return [4 /*yield*/, chatHandler.sendMessage(page, unread.name, text)];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, chatHandler.sendMessage(page, "Myself", JSON.stringify(unread))];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 7];
                case 11: return [3 /*break*/, 5];
                case 12: return [2 /*return*/];
            }
        });
    });
})();
