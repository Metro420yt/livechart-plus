
const clearDef = document.getElementById('clearDefault')
const setDef = document.getElementById('setDefault')

const tab = (await chrome.tabs.query({ active: true }))[0]
const url = new URL(tab.url)
const { defaultQuery } = await chrome.storage.sync.get(['defaultQuery'])
const { config } = await chrome.storage.local.get(['config'])

if (!url.pathname.includes('library')) setDef.style.display = 'none'
if (!defaultQuery) clearDef.disabled = true
if (!url.search) {
    setDef.disabled = true
    setDef.title = 'unable to parse filters'
}


setDef.addEventListener('click', async () => {
    var setDef
    if (url.search) {
        setDef = {}
        for (const q of tab.url.split('?')[1]?.split('&') || []) {
            const split = q.split('=')
            let key = split[0], value = split[1]
            let regx = /(\[\]|%5B%5D)$/

            if (key === 'page') continue;

            if (regx.test(key)) {
                key = key.replace(regx, '')
                if (!setDef[key]) setDef[key] = [value]
                else setDef[key].push(value)
            }
            else setDef[key] = value
        }
    }
    else setDef = JSON.parse(decodeURIComponent(pref))

    clearDef.disabled = false
    chrome.storage.sync.set({ defaultQuery: setDef })

    const feedback = document.getElementById('feedback')
    feedback.innerText = 'Set Default Filter'
    setTimeout(() => feedback.innerText = '', 2500)
})

clearDef.addEventListener('click', async () => {
    clearDef.disabled = true
    chrome.storage.sync.remove('defaultQuery')
})