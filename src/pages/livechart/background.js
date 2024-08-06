import { ScriptHandler, getSettings, script } from "../../functions.js";

import library from "./paths/library.js";
import search from "./paths/search.js";
import streams from "./paths/streams.js";

import betterActionFn from './scripts/betterActions.js';
import betterDropdownFn from './scripts/betterDropdowns.js';
import eventsFn from './scripts/events.js';
import keybindsFn from './scripts/keybinds.js';
import patchFn from './scripts/patch.js';


export default async (tab, config) => {
    const settings = await getSettings()
    const query = await getQuery()

    const exec = ScriptHandler(tab.id, settings)

    await script(tab.id, eventsFn, config)
    if (query) exec('overwriteUrl', changeLinks, [query, config.selector.username])
    exec('smallActionButtons', betterActionFn, [config, chrome.runtime.getURL('/assets/annoucement.svg')])
    exec('keybinds', keybindsFn, [config])
    exec('betterDropdowns', betterDropdownFn, [config])
    exec(undefined, patchFn, [config])

    if (/\/users\/.*\/library/.test(tab.url)) library({ tab, query, settings })
    else if (settings.recentSearches && /\/search/.test(tab.url)) search(tab)
    else if (/\/streams/.test(tab.url)) streams({ tab, settings })
}



async function getQuery() {
    var { defaultQuery: query } = await chrome.storage.sync.get('defaultQuery')

    if (query) {
        const q = []
        for (const k in query) {
            const val = query[k]
            if (Array.isArray(val)) q.push(...val.map(v => `${k}%5B%5D=${v}`))
            else q.push(`${k}=${val}`)
        }
        query = q.join('&')
    }
    return query
}
function changeLinks(query, usernameSelector) {
    const username = document.querySelector(usernameSelector)?.innerText
    if (!username) return console.warn('username not found');
    for (const e of document.querySelectorAll('a[href="/users/library"]')) {
        e.href = `/users/${username}/library?${query}`
    }
}