import request from '../../../api/request.js';
import { ScriptHandler, parseTime, script } from '../../../functions.js';

import bufferStatusFn from '../scripts/bufferStatuses.js';
import pendingFn from '../scripts/pendingRls.js';
import recentListsFn from '../scripts/recentLists.js';
import showBehindFn from '../scripts/showBehind.js';
import updatedTimeFn from '../scripts/updatedTime.js';


export default async function ({ settings, tab, query }) {
    const { config } = await chrome.storage.local.get('config')

    const list = await getConfig(tab.id, config)
    // if anothers list, save username
    if (settings.saveRecentLists !== false && list?.isViewer) {
        let { recentLists } = await chrome.storage.local.get('recentLists')
        if (!recentLists) recentLists = [list.ownerName]
        else {
            recentLists = recentLists.filter(d => d !== list.ownerName)
            recentLists.unshift(list.ownerName)
            recentLists = recentLists.slice(0, 10)
        }

        await chrome.storage.local.set({ recentLists })
    }
    // show recent lists
    else if (settings.showRecentLists !== false) {
        let { recentLists } = await chrome.storage.local.get('recentLists')
        chrome.scripting.executeScript({ target: { tabId: tab.id }, func: recentListsFn, args: [recentLists || [], (query && settings.overwriteUrl) ? query : '', config] })
    }

    const exec = ScriptHandler(tab.id, settings)

    exec('behind', showBehindFn, [settings, chrome.runtime.getURL('assets/behind.png'), config])
    exec('pendingRls', pendingFn, [config])
    exec('bufferStatus', bufferStatusFn, [config])

    if (settings.updatedTime && list) {
        const user = await request(`https://www.livechart.me/api/v1/users/${list?.isViewer ? list.ownerName : tab.url.match(/users\/(\w+)\/library/)[1]}`, undefined, { ttl: { minute: 5 } })
        const relative = parseTime(Date.now() - Date.parse(user.updated_at), true, 1)
        exec(undefined, updatedTimeFn, [config, relative, user])
    }
}

export function getConfig(tabId, config) {
    return script(tabId, config, (config) => {
        const title = document.querySelector(config.selector.library.title)?.innerText
        return {
            isViewer: !document.querySelector(config.selector.library.viewer),
            ownerName: title.replace('\'s Anime List', ''),
        }
    })
}