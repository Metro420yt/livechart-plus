import { ScriptHandler } from '../../../functions.js';
import countdownFn from '../scripts/countdown.js';


export default (tab, settings, config) => {
    chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['/pages/crunchyroll/watchlist.css']
    })

    const exec = ScriptHandler(tab.id, settings)

    exec('showCountdown', countdownFn, [config, settings])
}