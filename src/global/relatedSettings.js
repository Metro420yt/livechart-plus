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

            const title = document.createElement('p')
            title.innerText = relationMap[group] || group
            div.appendChild(title)

            for (const key in groups[group]) await createSetting(key, div)
            if (group !== 'Ungrouped') element.appendChild(div)
            else append.push(div)
        }
        for (const e of append) element.appendChild(e)
    }
    else {
        var addSettings = []
        for (const attr of ['items', 'relations']) {
            var value = element.attributes.getNamedItem(attr)?.value
            if (value) {
                if (attr === 'relations') value = value.split(' ').map(v => {
                    v = v.replace(/_/g, ' ')
                    if (!groups[v]) {
                        console.warn(`group: ${v}, doesnt exist`)
                        return [];
                    }
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
            settings[e.dataset.key] = Array.from(e.children)
                .filter(c => c.selected)
                .map(c => c.value)
        }
        chrome.storage.sync.set({ settings })
    })
}


async function createSetting(key, parent) {
    /**@type {import('../types').Settings[string]}*/
    const map = settingsMap[key] || {}

    if (Array.isArray(map.default) && map.options) {
        var input = document.createElement('select')
        input.multiple = true
        input.replaceChildren(...map.options.map(o => {
            const e = document.createElement('option')
            e.value = o
            e.innerText = o[0].toUpperCase() + o.slice(1)
            e.selected = settings[key].includes(o)
            return e
        }))


        input.onmouseover = () => {
            const { height } = input.children[0].getClientRects()[0]
            input.style.height = `${(Math.floor(height) + 1) * input.children.length}px`
            input.focus()
        }
        input.onmouseleave = () => {
            input.style = ''
            input.blur()
        }

    }
    else if (typeof map.default === 'boolean') {
        var input = document.createElement('input')
        input.type = 'checkbox'

        var active = true
        if (settingsMap[key]?.uses) {
            input.title = 'Uses ' + settingsMap[key].uses.map(dependant => {
                if (settings[dependant] === false) active = false
                return `"${settings[dependant].title || dependant}"`
            }).join(', ')
        }

        input.checked = active ? settings[key] : false
        input.disabled = !active
    }
    input.dataset.key = key

    for (const dataKey in map.data) input[dataKey] = map.data[dataKey]


    const label = document.createElement('label')
    label.innerText = map.title || key
    label.dataset.target = key

    const arr = input.type === 'checkbox' ? [input, label] : [label, input]
    if (!parent) return arr
    else arr.forEach(e => parent.appendChild(e))
}