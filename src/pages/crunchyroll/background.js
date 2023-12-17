import { defaultPopup } from '../../consts.js';
import { getSettings, requestPerm, script, setPopup } from '../../functions.js';
import watchlistFn from './paths/watchlist.js';
import hideWatched from "./scripts/hideWatched.js";


const reset = (tabId, page) => script(tabId, page, (page) => {
    const query = { // query strings of elements that are on a page
        series: ['#lcx-toggleWatched'],
    }
    Object.keys(query)
        .filter(k => page !== k)
        .forEach(key =>
            query[key].forEach(q => document.querySelectorAll(q).forEach(e => e.remove()))
        )
})

export default async (tab, config) => {
    if (!await requestPerm('https://*.crunchyroll.com/*')) return setPopup(defaultPopup);

    const urlArgs = tab.url.split('.com/')?.[1].split('/')
    reset(tab.id, urlArgs[0])

    const settings = await getSettings()
    if (urlArgs[0] === 'watchlist') watchlistFn(tab, config, settings)
    else if (urlArgs[0] === 'series') {
        chrome.scripting.insertCSS({ // cr navigation doesnt trigger content scripts
            target: { tabId: tab.id },
            files: ['/pages/crunchyroll/series.css']
        })
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: hideWatched,
            args: [settings.hideWatched, config]
        })
    }
}