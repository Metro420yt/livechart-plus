import request from "../../api/request.js";
import { settingsMap } from "../../consts.js";

var cache = localStorage.getItem('changelog')
const currVersion = chrome.runtime.getManifest().version

/**@type {import('../../types.d.ts').ChangeLog}*/
var { data: changelog, lastVer } = JSON.parse(cache) || {}
if (
    !cache
    || currVersion !== lastVer
    || (changelog.expires < Date.now())
) {
    changelog = await request('https://livechart.yuji.app/changelog')
    localStorage.setItem('changelog', JSON.stringify({
        expires: Date.now() + 8.64e+7, //1 day
        lastVer: currVersion,
        data: changelog
    }))
}
const target = document.getElementById('changelog')


for (const v in changelog) {
    if (!/^(\d\.){0,3}\d$/.test(v)) continue //if not sematic version

    const item = changelog[v]
    const div = document.createElement('div')

    const title = document.createElement('h2')
    title.innerText = `v${v}`
    title.classList.add('title')

    div.appendChild(title)
    target.appendChild(div)

    if (item.state) {
        const state = document.createElement('h6')
        state.innerText = item.state
        title.appendChild(state)
    }

    if (currVersion === v) {
        div.setAttribute('current', '')
        div.animate([
            { backgroundColor: 'rgba(255, 255, 134, 0.297)', easing: 'cubic-bezier(0.5, 0, 0.75, 0)' },
            { backgroundColor: '' }
        ], 1500)
    }
    parseChanges(item.changes, div)
}

/**@param {import('../../types.d.ts').Change[]} changes*/
function parseChanges(changes, parent) {
    for (const item of changes) {
        if (item.title) {
            const sub = document.createElement('div')
            sub.classList.add('sub')

            const t = document.createElement('h4')
            t.innerText = item.title
            t.classList.add('title')

            sub.appendChild(t)
            parent.appendChild(sub)

            parseChanges(item.changes, sub)
            continue;
        }

        var str = item.text || item
        str = str.replace(/\{(.*)\}/, (r, s) => {
            const args = s.split('.')
            if (args[0].startsWith('setting')) {
                const key = args[0].split(':')[1] || item.setting

                const map = settingsMap[key]
                if (!map) console.warn(`${key} not found in settingsMap`, item)
                return map ? map[args[1] || 'title'] : ''
            }
        })

        var link
        if (typeof item.link === 'string') link = item.link
        else if (item.setting) link = '/pages/settings/popup.html#' + item.setting

        const text = document.createElement('p')
        text.innerText = str

        if (link) {
            const external = document.createElement('a')
            if (!link.startsWith('http')) external.href = '/pages/settings/popup.html#' + item.setting
            else external.onclick = () => chrome.tabs.create({ url: link, active: true })
            text.appendChild(external)
        }
        parent.appendChild(text)
    }
}