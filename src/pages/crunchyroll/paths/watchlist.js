import request from '../../../api/request.js';

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
    if (msg.action === 'getUrl') request(msg.url).then(reply)
    return true
});


export default (tab, config, settings) => {
    chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['/pages/crunchyroll/watchlist.css']
    })

    if (settings.showCountdown) chrome.scripting.executeScript({
        target: { tabId: tab.id }, args: [config, settings], func: async (config, settings) => {
            if (window.lcxHandler) return;
            window.lcxHandler = true

            var list
            while (!list) {
                list = document.querySelector(config.selector.crunchyroll.wlObserveTarget)
                await new Promise(r => setTimeout(r, 500))
            }

            const updateInts = {}
            const removeInt = (id) => {
                clearInterval(updateInts[id])
                delete updateInts[id]
            }
            const urlObserver = new MutationObserver((m) => { // PWA, looks if link[hreflang].href isnt on /watchlist
                const changedUrl = m.some(({ addedNodes }) => Array.from(addedNodes).some(e => e.getAttribute('hreflang') !== null && !e.href.endsWith('/watchlist')))
                if (!changedUrl) return;
                exit()
            })
            urlObserver.observe(document.head, { subtree: true, childList: true })

            const obs = new MutationObserver(async (m) => {
                //could optimize this, render addedNodes, clear removedNodes
                m.forEach(({ removedNodes }) => removedNodes.forEach(r => {
                    const id = r.querySelector('a[href^="/series/"]').href.match(/\/series\/(\w+)\//)[1]
                    if (!updateInts[id]) return;
                    removeInt(id)
                }))
                setTimeout(check, 200) // waiting for crunchyroll to render new rows (>50ms) leeway for hardware differences
            })
            obs.observe(list, { childList: true })


            const { nextEpisode = {} } = await chrome.storage.local.get('nextEpisode')
            var askFor = []
            check()
            function check() {
                const anime = list.querySelectorAll('a[href^="/series/"]')

                for (const a of anime) {
                    const id = a.href.match(/\/series\/(\w+)\//)[1]
                    if (askFor.includes(id) || nextEpisode[id]?.expires > Date.now()) continue;

                    if (
                        nextEpisode[id] === undefined
                        || (nextEpisode[id]?.airdate && nextEpisode[id].airdate < Date.now())
                    ) askFor.push(id)

                    render(a, id)
                }
            }

            if (window.lcxAsk) return exit(); // redundancy, race conditions
            window.lcxAsk = setInterval(async () => {
                if (askFor.length === 0) return;

                const url = new URL('https://livechart.yuji.app/get/nextEp')
                url.searchParams.set('service', 'crunchyroll')
                askFor.forEach(s => url.searchParams.append('series', s))

                const res = await new Promise(r => chrome.runtime.sendMessage({ action: 'getUrl', url: url.toString() }, r))
                if (res.httpStatus === 429) return ask = [];
                else if (res.httpStatus >= 500) return;

                askFor.forEach(id => {
                    var data
                    if (res.httpStatus === undefined) data = res.find(d => d.streams.crunchyroll === id)?.nextEpisode

                    if (!data) data = { expires: Date.now() + 86400000 }
                    nextEpisode[id] = data
                    setTimeout(() => render(list.querySelector(`a[href^="/series/${id}"]`), id), 50)
                })
                askFor = []

                Object.keys(nextEpisode).slice(100).forEach(k => delete nextEpisode[k])
                chrome.storage.local.set({ nextEpisode })
            }, 5000);


            /**@param {Element} anime*/
            async function render(anime, id = anime.href.match(/\/series\/(\w+)\//)[1]) {
                if (!anime.isConnected) return;
                const old = anime.parentElement.querySelector('.lcx-countdown')
                const div = old || document.createElement('div')
                const txt = div.querySelector('h5') || document.createElement('h5')
                div.classList = 'lcx-countdown'
                if (!div.querySelector('h5')) div.appendChild(txt)

                if (
                    nextEpisode[id]?.airdate !== undefined
                    && Number(old?.dataset.ts) !== nextEpisode[id].airdate // if airdate is new
                ) {
                    div.dataset.ts = nextEpisode[id].airdate

                    const dif = Math.abs(nextEpisode[id].airdate - Date.now())
                    var { text: time, keys } = parseTime(dif)
                    var rateKey = keys.slice(-1)[0]

                    const updateRate = () => {
                        if (rateKey === 'minute') return 60000
                        else if (rateKey === 'second') return 1000
                        else return 3600000
                    }

                    const renderText = (time) => {
                        if (!time) time = parseTime(Math.abs(nextEpisode[id].airdate - Date.now()))
                        if (nextEpisode[id].airdate < Date.now()) {
                            if (time.text) time.text += ' ago'
                            else time += ' ago'
                        }

                        if (time.keys && rateKey !== time.keys.slice(-1)[0]) {
                            rateKey = time.keys.slice(-1)[0]
                            clearInterval(updateInts[id])
                            updateInts[id] = setInterval(renderText, updateRate());
                        }
                        txt.innerText = `${nextEpisode[id].code}: ${time.text || time}`
                    }

                    const rate = updateRate()
                    const nextUpdate = rate - (Date.now() % rate)

                    renderText(time)
                    setTimeout(() => {
                        renderText()
                        updateInts[id] = setInterval(renderText, rate);
                    }, nextUpdate);
                }


                if (
                    askFor.includes(id)
                    && !div.querySelector('.lcx-loading')
                ) {
                    if (txt.innerText === '') txt.innerText = `EP:`
                    const loading = document.createElement('div')
                    loading.classList = 'lcx-loading'
                    div.append(loading)
                }
                else if (!askFor.includes(id)) div.querySelector('.lcx-loading')?.remove()

                if (nextEpisode[id]?.expires) old?.remove()
                else anime.parentElement.insertBefore(div, anime.parentElement.lastChild)
            }


            function parseTime(ms, maxKeys = 2) {
                const ints = { day: 0, hour: 0, minute: 0, second: Math.round(ms / 1000) }

                if (ints.second >= 60) {
                    ints.minute = Math.floor(ints.second / 60)
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
                var keys = Object.keys(ints).filter(k => ints[k] !== 0 || k === 'second')
                if (maxKeys > 0) keys = keys.slice(0, maxKeys)

                for (const key of keys) {
                    if (ints[key] === 0 && key !== 'second') continue;
                    const format = settings.shortCountdown ? key[0] : ` ${key[0].toUpperCase() + key.slice(1)}${ints[key] > 1 ? 's' : ''}`
                    text.push(`${ints[key]}${format}`)
                }
                return { text: text.join(' '), keys }
            }
            function exit() {
                askFor = []
                clearInterval(window.lcxAsk)
                delete window.lcxAsk
                delete window.lcxHandler
                for (const id in updateInts) removeInt(id)
                urlObserver.disconnect()
                obs.disconnect()
            }
        }
    })
}