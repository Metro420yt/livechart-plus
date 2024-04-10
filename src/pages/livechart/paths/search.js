import { script } from "../../../functions.js"

export default async function (tab) {
    const { config } = await chrome.storage.local.get('config')
    if (/\/search\?/.test(tab.url)) {
        const data = {}
        data.query = tab.url.match(/q=([\w+]{1,})/)[1]
        data.text = await script(tab.id, config.selector.search.input, (selector) => document.querySelector(selector).value)


        var { recentSearches } = await chrome.storage.local.get('recentSearches')
        if (!recentSearches) recentSearches = [data]

        recentSearches = recentSearches.filter(d => (d.query || d) !== data.query)
        recentSearches.unshift(data)
        recentSearches = recentSearches.slice(0, 10)

        await chrome.storage.local.set({ recentSearches })
    }
    else {
        var { recentSearches } = await chrome.storage.local.get('recentSearches')
        chrome.scripting.executeScript(
            { target: { tabId: tab.id }, func: showRecent, args: [recentSearches || [], config.selector.search.recentsParent] }
        )
    }
}


function showRecent(recents, parent) {
    if (recents.length === 0) return;
    const old = document.getElementById('lcx-recent')
    const children = ['Recent Searches']

    const list = old || document.createElement('ul')
    list.id = 'lcx-recent'
    list.style.display = 'grid'

    for (const q of recents) {
        const item = document.createElement('a')
        item.innerText = q.text || q
        item.classList.add('lcx-link')
        item.href = `/search?q=${q.query || q}`

        // list.appendChild(item)
        children.push(item)
    }
    list.replaceChildren(...children)


    if (!old) document.querySelector(parent).appendChild(list)
}