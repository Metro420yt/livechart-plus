import { settingsMap } from './consts.js';

export function display({ title, color, badge, tabId }) {
    if (badge) chrome.action.setBadgeText({ text: badge, tabId })
    if (title) chrome.action.setTitle({ title, tabId })
    if (color) {
        if (!color.startsWith('#')) color = '#' + color
        chrome.action.setBadgeBackgroundColor({ color, tabId })
    }
}

export function requestPerm(arg, prompt = true) {
    if (!arg) return;
    return new Promise(async (resolve) => {
        if (typeof arg === 'string') arg = [arg]
        var reqData = {}
        for (const perm of arg) {
            const type = perm.startsWith('http') ? 'origins' : 'permissions'
            if (reqData[type]) reqData[type].push(perm)
            else reqData = { [type]: [perm] }
        }

        for (const key in reqData) if (typeof reqData[key] === 'string') reqData[key] = [reqData[key]]
        const contains = await chrome.permissions.contains(reqData)

        if (!prompt) return resolve(contains)
        if (!contains) {
            display({
                badge: '!',
                color: '#b31b10'
            })

            var { requestingPerms: existingReqs } = await chrome.storage.local.get('requestingPerms')
            const perms = Object.values(reqData).flat().concat(existingReqs || [])
            await chrome.storage.local.set({ requestingPerms: Array.from(new Set(perms)) })
            resolve(false)
        }
        else resolve(true)
    })
}

export const getSettings = async () => {
    const { settings = {} } = await chrome.storage.sync.get('settings')

    for (const key in settingsMap) if (
        settings[key] === undefined
        // || typeof settings[key] !== typeof settingsMap[key].default
    ) settings[key] = settingsMap[key].default
    return settings
}

export function setPopup(dir = '', tabId) {
    if (dir === '') return chrome.action.disable(tabId)

    try {
        chrome.action.setPopup({ popup: dir, tabId })
        chrome.action.enable(tabId)
    }
    catch {
        console.warn('using alt #setPopup()')
        chrome.action.setPopup({ popup: dir })
    }
}

export function script(tabId, ...args) {
    return new Promise((resolve) => {
        var func, scriptArgs = []
        args.forEach(a => {
            if (typeof a === 'function') return func = a
            if (Array.isArray(a)) scriptArgs.push(...a)
            else scriptArgs.push(a)
        })

        chrome.scripting.executeScript({
            target: { tabId }, func, args: scriptArgs
        }, ([{ result }]) => resolve(result))
    })
}

export function parseTime(seconds, ms = false, maxKeys = 2) {
    if (ms) seconds = Math.round(seconds / 1000)
    const ints = { day: 0, hour: 0, minute: 0, second: seconds || 0 }

    if (seconds >= 60) {
        ints.minute = Math.floor(seconds / 60)
        ints.second -= ints.minute * 60
    }
    if (ints.minute >= 60) {
        ints.hour = Math.floor(ints.minute / 60)
        ints.minute -= ints.hour * 60
    }
    if (ints.hour >= 24) {
        ints.day = Math.floor(ints.hour / 24)
        ints.hour -= ints.day * 24
    }


    const text = []
    var keys = Object.keys(ints).filter(k => ints[k] !== 0 || k === 'seconds')
    if (maxKeys > 0) keys = keys.slice(0, maxKeys)

    for (const key of keys) {
        if (ints[key] === 0 && key !== 'second') continue;
        text.push(`${ints[key]} ${key[0].toUpperCase() + key.slice(1)}${ints[key] > 1 ? 's' : ''}`)
    }
    return text.join(' ')
}

const timeMap = {
    day: 86400000,
    hour: 3600000,
    minute: 60000,
    second: 1000
}
/**
 * @param {keyof timeMap} type
 * @param {number|Partial<Record<keyof timeMap, number>>} data*/
export function formatTime(data, type = 'second') {
    if (typeof data === 'number') return data * timeMap[type]

    var time = 0
    for (const key in data) time += (timeMap[key] || 0) * data[key]

    return time
}

export function ScriptHandler(tabId, settings) {
    return (key, func, args) => {
        if (key === undefined || settings?.[key]) chrome.scripting.executeScript({ target: { tabId }, func, args })
        else if (key !== undefined && settings?.[key] === undefined) console.warn('script setting doesnt exist: ' + key)
    }
}