import { defaultPopup } from "../../consts.js"
import { requestPerm } from "../../functions.js"

window.addEventListener('load', async () => {
    var { requestingPerms } = await chrome.storage.local.get('requestingPerms')
    if (requestingPerms?.length === 0) return noReqPerms()

    const permList = document.getElementById('permList')
    var changed = false
    for (const item of requestingPerms) {
        if (!item) continue;
        if (await requestPerm(item, false)) { // if has permission
            requestingPerms = requestingPerms.filter(p => p !== item)
            changed = true
            continue
        }

        const type = item.startsWith('http') ? 'origins' : 'permissions'
        const elem = document.createElement('button')
        elem.innerText = `${type === 'origins' ? 'Site' : 'Permission'}: ${item}`
        permList.appendChild(elem)

        elem.onclick = () => chrome.permissions.request({ [type]: [item] })
    }
    if (changed) {
        chrome.storage.local.set({ requestingPerms })
        if (requestingPerms?.length === 0) return noReqPerms()
    }
})

function noReqPerms() {
    chrome.action.setBadgeText({ text: "" })
    window.location = defaultPopup
}