import { formatTime } from "../functions.js";

const cache = {}
setInterval(() => {
    for (const k in cache) if (cache[k].expires < Date.now() && cache[k].response?.ignore !== true) {
        delete cache[k]
    }
}, 30000);
/**@type {import("../types.js").Request}*/
export default async (url, data = {}, options = {}) => {
    const cachedData = cache[url]

    if (!data.method && data.body) data.method = 'post'
    if (typeof data.body !== 'string') data.body = JSON.stringify(data.body)

    if (
        cachedData
        && (cachedData.expires > Date.now() || cachedData.response.ignore)
        && cachedData.response.httpStatus < 500
        && (data.body ? cachedData.body === data.body : true)
    ) {
        console.log(data.method || 'get', url, 'cached')
        return cachedData.response
    }
    else console.log(data.method || 'get', url)

    cache[url] = { response: { ignore: true, httpStatus: 429 } } //429 just to give a value, used to prevent double requests

    options = Object.assign({ prefill: [], ttl: { second: 10 } }, options)
    if (typeof options.prefill === 'string') options.prefill = [options.prefill]
    const { name, version } = chrome.runtime.getManifest()
    const headers = {
        'x-crx-agent': `${name} ${version}`,
        'x-crx-author': '@metro420yt (contact@yuji.app)'
    }

    if (data.method?.toUpperCase() === 'POST') headers['Content-Type'] = 'application/json'

    data.headers = Object.assign(headers, data.headers)


    const f = await fetch(url, data)
    if (f.status >= 300) console.log(`${f.status} ${f.url}`)
    if (typeof options.ttl === 'object') options.ttl = formatTime(options.ttl)

    cache[url].expires = Date.now() + options.ttl
    cache[url].body = data.body

    var res = {}
    res._uncache = () => delete cache[url]
    res._setcache = (response) => cache[url].response = response

    if (f.headers.get('Content-Type').includes('application/json')) res = Object.assign(await f.json(), res)
    else res._text = await f.text()
    res.httpStatus = f.status

    return res._setcache(res)
}