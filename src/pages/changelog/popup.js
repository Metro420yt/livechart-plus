import request from "../../api/request.js";
import { settingsMap } from "../../consts.js";

var cache = localStorage.getItem('changelog')
const currVersion = chrome.runtime.getManifest().version

/**@type {import('../../types.d.ts').ChangeLog}*/
var { data: changelog, lastVer, expires } = JSON.parse(cache) || {}
if (
    !cache
    || currVersion !== lastVer
    || (expires < Date.now())
) {
    changelog = await request('https://livechart.yuji.app/changelog')
    localStorage.setItem('changelog', JSON.stringify({
        expires: Date.now() + (3.6e+6), //hr
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

        setTimeout(() => {
            window.scrollTo({ behavior: 'smooth', top: div.getBoundingClientRect().top - 100 })
            div.animate([
                { backgroundColor: 'rgba(255, 255, 134, 0.297)', easing: 'cubic-bezier(0.5, 0, 0.75, 0)' },
                { backgroundColor: '' }
            ], 2000)
        }, 50);
    }
    parseChanges(item.changes, div)
}

/**@param {import('../../types.d.ts').Change[]} changes*/
function parseChanges(changes, parent) {
    for (const item of changes) {
        let elm
        if (item.title) {
            const sub = document.createElement('div')
            sub.classList.add('sub')
            parent.appendChild(sub)

            elm = document.createElement('h4')
            str = item.title
            elm.classList.add('title')
            sub.appendChild(elm)

            parseChanges(item.changes, sub)
        }
        else {
            var str = item.text || item
            elm = document.createElement('p')
            parent.appendChild(elm)
        }
        str = str.replace(/\{(.*)\}/, (r, s) => {
            const args = s.split('.')
            if (args[0].startsWith('setting')) {
                const key = args[0].split(':')[1] || item.setting

                const map = settingsMap[key]
                if (!map) {
                    console.warn(`${key} not found in settingsMap`, item)
                    return 'Unknown Setting'
                }
                return map ? map[args[1] || 'title'] : ''
            }
        })
        elm.innerText = str

        let link = item.url
        if (typeof item.link === 'string') link = item.link
        else if (item.setting) link = '/pages/settings/popup.html#' + item.setting

        if (link) {
            const external = document.createElement('a')

            if (!link.startsWith('http')) external.href = '/pages/settings/popup.html#' + item.setting
            else external.onclick = () => chrome.tabs.create({ url: link, active: true })

            elm.appendChild(external)
        }
    }
}