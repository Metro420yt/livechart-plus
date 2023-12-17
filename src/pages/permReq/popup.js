import { defaultPopup } from "../../consts.js"
import { requestPerm } from "../../functions.js"

window.addEventListener('load', async () => {
    var { requestingPerms } = await chrome.storage.local.get('requestingPerms')
    if (requestingPerms?.length === 0) return noReqPerms()

    const permList = document.getElementById('permList')
    var changed = false
    for (const item of requestingPerms) {
        if (!item) continue;
        if (await requestPerm(item, false)) {
            requestingPerms = requestingPerms.filter(p => p !== item)
            changed = true
            continue
        }
        const type = item.startsWith('http') ? 'origins' : 'permissions'
        const elem = document.createElement('button')
        elem.innerText = `${type === 'origins' ? 'Site' : 'Permission'}: ${item}`
        permList.appendChild(elem)

        elem.onclick = () => chrome.permissions.request({ [type]: [item] }, () => location.reload())
    }
    if (changed) {
        chrome.storage.local.set({ requestingPerms })
        if (requestingPerms?.length === 0) return noReqPerms()
    }

    chrome.permissions.onAdded.addListener(async (granted) => {
        granted = Object.values(granted).flat()

        requestingPerms = requestingPerms.filter(p => !granted.includes(p))
        await chrome.storage.local.set({ requestingPerms })
    })
})

function noReqPerms() {
    chrome.action.setBadgeText({ text: "" })
    location = defaultPopup
}