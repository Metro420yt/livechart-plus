import { relationMap, settingsMap } from '../consts.js';
import { getSettings, requestPerm } from '../functions.js';
export const settings = await getSettings()

const groups = {}
for (const key in settingsMap) {
    const map = settingsMap[key]
    if (map.ignore) continue;
    if (!map.relation) map.relation = 'Ungrouped'

    // upsert relation
    if (!groups[map.relation]) groups[map.relation] = {}
    groups[map.relation][key] = map

    if (
        settings[key] === undefined
        || (map.permissions && !await requestPerm(map.permissions, false))
    ) settings[key] = map.default || false
    document.querySelectorAll(`[data-key="${key}"`).forEach(e => typeof settings[key] === 'boolean' ? e.checked = settings[key] : e.value = settings[key])
}


const settingsTags = Array.from(document.getElementsByTagName('settings'))
for (const element of settingsTags) {
    if (element.attributes.getNamedItem('relevent')) {
        const title = document.createElement('p')
        title.innerText = 'Relevent Settings'
        element.appendChild(title)
        element.attributes.removeNamedItem('relevent')
    }

    const showAll = element.attributes.getNamedItem('items')?.value === ':all'
    if (showAll) {
        const append = []
        for (const group in groups) {
            const div = document.createElement('div')

            const title = document.createElement('h3')
            title.innerText = relationMap[group] || group
            div.appendChild(title)

            for (const key in groups[group]) if (settingsMap[key].popout !== false) await createSetting(key, div)
            if (group !== 'Ungrouped') element.appendChild(div)
            else append.push(div)
        }
        for (const e of append) element.appendChild(e)

        // highlights key in url hash
        if (document.location.hash !== '') {
            const key = document.location.hash.slice(1)
            const input = document.querySelector(`[data-key="${key}"]`)
            const target = document.querySelector(`[data-target="${key}"]`)
            if (!input) continue;
            input.scrollTo()
            input.focus()
            target.animate([
                { backgroundColor: 'yellow', easing: 'cubic-bezier(0, 0.55, 0.45, 1)' },
                { backgroundColor: '' }
            ], 2000)
        }
    }
    else {
        var addSettings = []
        for (const attr of ['items', 'relations']) {
            var value = element.attributes.getNamedItem(attr)?.value
            if (value) {
                if (attr === 'relations') value = value.split(' ').map(v => {
                    v = v.replace(/_/g, ' ')
                    if (!groups[v]) return [];

                    return Object.keys(groups[v])
                }).flat()
                else value = value.split(' ')

                addSettings = addSettings.concat(value)
                element.attributes.removeNamedItem(attr)
            }
        }

        for (const key of addSettings.filter(v => typeof settingsMap[v].default === 'boolean')) await createSetting(key, element)
    }

    element.addEventListener('change', async ({ target: e }) => {
        const map = settingsMap[e.dataset.key]
        if (map.permissions) {
            if (typeof map.permissions === 'string') map.permissions = [map.permissions]
            if (!await requestPerm(map.permissions, false) && !await chrome.permissions.request({ permissions: map.permissions })) return
        }

        if (e.type === 'checkbox') {
            for (const key in settingsMap) if (settingsMap[key].uses?.includes(e.dataset.key)) {
                document.querySelectorAll(`[data-key="${key}"`).forEach(d => {
                    d.checked = e.checked ? settings[key] : false
                    d.disabled = !e.checked
                    d.title = d.disabled ? `Uses "${map.title}"` : undefined
                })
            }


            document.querySelectorAll(`[data-key="${e.dataset.key}"`).forEach(s => {
                s.checked = e.checked
                // s.disabled = !active
            })
            settings[e.dataset.key] = e.checked
        }
        else if (e.tagName === 'SELECT') {
            if (!e.multiple) settings[e.dataset.key] = e.value
            else settings[e.dataset.key] = Array.from(e.children)
                .filter(c => c.selected)
                .map(c => c.value)
        }
        else if (e.type === 'range') settings[e.dataset.key] = e.value
        chrome.storage.sync.set({ settings })
    })
}


async function createSetting(key, parent) {
    /**@type {import('../types').Settings[string]}*/
    const map = settingsMap[key] || {}

    const label = document.createElement('label')
    label.innerText = map.title || key
    label.dataset.target = key

    if (map.options) {
        var input = document.createElement('select')
        if (Array.isArray(map.default)) input.multiple = true

        var children
        if (Array.isArray(map.options)) children = map.options.map(key => ({ key, text: key[0].toUpperCase() + key.slice(1) }))
        else children = Object.keys(map.options).map(key => ({ key, text: map.options[key] }))

        input.replaceChildren(...children.map(({ key: subkey, text }) => {
            const e = document.createElement('option')
            e.value = subkey
            e.innerText = text

            if (settings[key] === undefined) e.selected = settingsMap[key].default
            else e.selected = settings[key] === subkey || settings[key].includes(subkey)
            return e
        }))


        if (input.multiple) {
            input.onmouseover = () => {
                if (input.disabled) return;
                const { height } = input.children[0].getClientRects()[0]
                input.style.height = `${(Math.floor(height) + 1) * input.children.length}px`
                input.focus()
            }
            input.onmouseleave = () => {
                input.style = ''
                input.blur()
            }
        }

    }
    else {
        var input = document.createElement('input')

        if (typeof map.default === 'boolean') {
            input.type = 'checkbox'
            input.checked = settings[key]
        }
        else if (typeof map.default === 'number') {
            input.type = 'range'
            input.value = settings[key]
            if (map.range) {
                input.min = map.range[0]
                input.max = map.range[1]
            }

            var delay
            const str = label.innerText
            input.addEventListener('input', () => {
                label.innerText = str + `\n(${input.value})`
                if (delay) clearTimeout(delay)
                delay = setTimeout(() => label.innerText = str, 1000)
            })
        }
        else throw new Error('unknow default type', map)
    }
    var active = true
    if (settingsMap[key]?.uses) {
        const dependants = settingsMap[key].uses
            .filter(d => settings[d] === false)
            .map(d => `"${settings[d].title || d}"`)

        if (dependants.length > 0) {
            active = false
            input.title = 'Uses ' + dependants.join(', ')
        }
    }

    input.checked = active ? settings[key] : false
    input.disabled = !active
    input.dataset.key = key

    for (const dataKey in map.data) input[dataKey] = map.data[dataKey]

    const arr = input.type === 'checkbox' ? [input, label] : [label, input]
    if (!parent) return arr
    else arr.forEach(e => parent.appendChild(e))
}