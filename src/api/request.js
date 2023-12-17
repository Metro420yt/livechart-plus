import { formatTime } from "../functions.js";

const cache = {}
setInterval(() => {
    for (const k in cache) if (cache[k].expires < Date.now()) {
        delete cache[k]
    }
}, 30000);
/**
 * @param {string} url
 * @param {RequestInit} data
 * @param {{ttl:Parameters<formatTime>[0]}} options
*/
export default async (url, data = {}, options = {}) => {
    const cachedData = cache[url]
    console.log(data.method || 'get', url, !!cachedData ? 'cached' : '')

    if (!data.method) {
        if (cachedData && cachedData.expires > Date.now()) return cachedData.response
        cache[url] = { response: { ignore: true, httpStatus: 429 }, expires: Date.now() + 5000 } //429 just to give a value, used to prevent race conditions
    }

    options = Object.assign({ prefill: [], ttl: { second: 10 } }, options)
    if (typeof options.prefill === 'string') options.prefill = [options.prefill]
    const { name, version } = chrome.runtime.getManifest()
    const headers = { 'User-Agent': `${name} v${version} | @metro420yt (contact@yuji.app)` }

    if (data.method?.toUpperCase() === 'POST') headers['Content-Type'] = 'application/json'

    data.headers = Object.assign(headers, data.headers)
    if (typeof data.body !== 'string') data.body = JSON.stringify(data.body)


    const f = await fetch(url, data)
    if (!f.ok) return { error: f.statusText, httpStatus: f.status }
    var res = await f.json()
    if (Array.isArray(res)) return res

    res.httpStatus = f.status
    if (typeof options.ttl === 'object') options.ttl = formatTime(options.ttl)

    res._uncache = () => delete cache[url]
    res._setcache = (response) => cache[url].response = response
    cache[url] = { response: res, expires: Date.now() + options.ttl }
    return res
}