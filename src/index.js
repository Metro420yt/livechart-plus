import request from './api/request.js';
import { defaultPopup, settingsMap } from './consts.js';
import { getSettings, setPopup } from './functions.js';

import crunchyrollBg from './pages/crunchyroll/background.js';
import livechartBg from './pages/livechart/background.js';


/**@type {import('./types.d.ts').PageItem}*/
const pages = [
    {
        background: livechartBg,
        popup: './pages/livechart/popup.html',
        host: /.*.?livechart.me/
    },
    {
        background: crunchyrollBg,
        popup: './pages/crunchyroll/popup.html',
        host: /.*.?crunchyroll.com/,
    },
]

/**@type {import('./types.d.ts').Alarm}*/
const alarms = {
    updateConfig: {
        periodInMinutes: 60,
        fn: updateConfig,
    }
}


async function startup() {
    const settings = await getSettings()
    for (const key in settings) {
        if (key in settingsMap) continue;
        delete settings[key]
    }
    chrome.storage.sync.set({ settings })

    const { lastStartup } = await chrome.storage.local.get('lastStartup')
    if (Date.now() < ((lastStartup || 0) + 60000)) return; // if last startup is < 1min ago, return
    await chrome.storage.local.set({ lastStartup: Date.now() })

    const config = await updateConfig()
    if (!config) return console.warn('config not found');
}

async function updateConfig() {
    var config = await request(`https://livechart.yuji.app/config`)
    if (config.httpStatus !== 200) {
        console.warn(`[Config] unable to update ${config.httpStatus}`)
        return storage.getLocal('config')
    }
    chrome.storage.local.set({ config })
    return config
}

chrome.runtime.onStartup.addListener(startup)
chrome.runtime.onInstalled.addListener(startup)

chrome.tabs.onUpdated.addListener(async (...args) => {
    const tab = args[2]
    if (tab.status !== 'complete') return;

    const page = pages.find(p => {
        if (p.host) return p.host.test(new URL(tab.url).host)
        return p.regex.test(tab.url)
    })
    if (!page) return setPopup(defaultPopup);

    const { config } = await chrome.storage.local.get('config')
    if (page.popup) setPopup(page.popup, tab.id)
    if (page.background) page.background(tab, config)
})


const appededKeys = ['fn']
chrome.alarms.clearAll()
for (const key in alarms) {
    const keys = Object.keys(alarms[key]).filter(k => !appededKeys.includes(k)) // gets AlarmCreateInfo keys from entry
    const data = Object.fromEntries(keys.map(k => [k, alarms[key][k]])) // maps into k,v pair
    chrome.alarms.create(key, data)
}
chrome.alarms.onAlarm.addListener(({ name }) => {
    console.log(`[Alarm] ${name}`)
    alarms[name].fn()
})