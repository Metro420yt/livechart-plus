import { ScriptHandler } from "../../../functions.js"
import hideWatchedFn from "../scripts/hideWatched.js"

export default (tab, settings, config) => {
    chrome.scripting.insertCSS({ // cr navigation doesnt trigger content scripts
        target: { tabId: tab.id },
        files: ['/pages/crunchyroll/series.css']
    })

    const exec = ScriptHandler(tab.id)
    exec(undefined, hideWatchedFn, [settings.hideWatched, config])
}