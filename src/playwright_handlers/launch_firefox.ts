import { BrowserContext, firefox, FirefoxBrowser, Page } from 'playwright'
import { realpathSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const tempOSDirectoryPath = realpathSync(tmpdir())
const tempProfilePath = join(tempOSDirectoryPath, 'FF_PLAYWRIGTH_USER')

export const launchFirefox = async ({ headless = true, browserUserDir = tempProfilePath } = {}): Promise<{ browser: FirefoxBrowser | BrowserContext, page: Page }> => {
    console.log('Launching browser... 🕗', { headless });

    const browser = browserUserDir ? await firefox.launchPersistentContext(browserUserDir, {
        headless,
    }) : await firefox.launch({
        headless
    })
    const page = await browser.newPage({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36'
    })

    return {
        browser,
        page
    }
}
