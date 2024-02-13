import { navData } from '../consts.js'

const navbar = document.getElementsByTagName('nav')[0] || document.createElement('nav')
document.body.prepend(navbar)
const footer = document.createElement('footer')
document.body.appendChild(footer)

for (const item of navData) {
    if (!item.data) item.data = {}
    if (item.link) {
        item.tag = 'a'
        item.data.href = item.link
    }
    if (item.text) item.data.innerText = item.text


    const element = document.createElement(item.tag)
    element.classList.add('navItem')

    for (let key in item.data) {
        if (['dataset'].includes(key)) for (const sub in item.data[key]) element[key][sub] = item.data[key][sub]
        else element[key] = item.data[key]
    }

    if (item.events) for (const event in item.events) element.addEventListener(event, item.events[event])

    item.footer ? footer.appendChild(element) : navbar.appendChild(element)
}


var { requestingPerms } = await chrome.storage.local.get('requestingPerms')
if (requestingPerms?.length > 0) {
    const permReq = document.createElement('a')
    permReq.innerText = `Requesting ${requestingPerms.length} permissions`
    permReq.href = '../permReq/popup.html'
    permReq.id = 'permReq'
    permReq.classList.add('navItem')
    permReq.setAttribute('important', '')
    document.body.prepend(permReq)
}