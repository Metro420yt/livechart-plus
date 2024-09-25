import { getSettings, requestPerm, script } from '../../functions.js';
import watchlistPath from './paths/watchlist.js';


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
    if (!await requestPerm('https://*.crunchyroll.com/*')) return;

    const urlArgs = tab.url.split('.com/')?.[1].split('/')
    reset(tab.id, urlArgs[0])

    const settings = await getSettings()
    const pathArgs = [tab, settings, config]

    if (urlArgs[0] === 'watchlist') watchlistPath(...pathArgs)
    else if (urlArgs[0] === 'series') seriesPath(...pathArgs)
}