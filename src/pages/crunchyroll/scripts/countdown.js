export default async (config, settings) => {
    if (window.lcxHandler === true) return;
    window.lcxHandler = true
    const observerList = []

    const updateInts = {}
    const removeInt = (id) => {
        console.log('removed', id)
        clearInterval(updateInts[id])
        delete updateInts[id]
    }

    var list
    const obsList = async (listChange = false) => {
        let attempt = 0
        if (listChange) while (!document.querySelector(config.selector.crunchyroll.wlLoader) && attempt++ < 10) await new Promise(r => setTimeout(r, 100))

        console.time('getlist')
        while (true) {
            list = document.querySelector(config.selector.crunchyroll.wlObserveTarget)
            if (document.querySelector(config.selector.crunchyroll.wlNoResults)) return;
            if (list) break;
            await new Promise(r => setTimeout(r, 100))
        }
        console.timeEnd('getlist')

        if (listChange) check()

        return observe(list, async (m) => {
            m.forEach(({ removedNodes, addedNodes }) => {
                removedNodes.forEach(r => {
                    for (const elm of r.querySelectorAll('a[href^="/series/"]')) {
                        const id = elm.href.match(/\/series\/(\w+)\//)[1]
                        if (updateInts[id] === undefined) return;
                        removeInt(id)
                    }
                })

                if (addedNodes.length > 0) setTimeout(() => { // wait for crunchyroll to render new rows
                    const nodes = Array.from(addedNodes).flatMap(n => n.querySelectorAll('a[href^="/series/"]'))
                    if (nodes.length > 0) check(nodes[0])
                }, 500)

            })
        }, { childList: true })
    }
    await obsList()

    observe(document.head, (m) => { // looks if link[hreflang].href isnt on /watchlist, detecting url changes
        const changedUrl = m.some(({ addedNodes }) => Array.from(addedNodes).some(e => e.getAttribute?.('hreflang') !== null && !e.href?.endsWith('/watchlist')))
        if (!changedUrl) return;
        console.log('url changed')
        exit()
    }, { subtree: true, childList: true })

    // observes new list when changing filters
    observe(document.querySelector(config.selector.crunchyroll.wlFiltersTarget), () => {
        console.log('list change')
        list = null
        obsList(true)
    }, { subtree: true, childList: true, characterData: true })

    const { nextEpisode = {} } = await chrome.storage.local.get('nextEpisode')
    var askFor = []
    check()
    function check(anime = list.querySelectorAll('a[href^="/series/"]'), ...renderArgs) {
        for (const a of anime) {
            const id = a.href.match(/\/series\/(\w+)\//)[1]
            if (nextEpisode[id]?.expires > Date.now()) continue;

            if (
                !askFor.includes(id) && (
                    nextEpisode[id] === undefined
                    || (nextEpisode[id]?.airdate && nextEpisode[id].airdate < Date.now())
                )
            ) {
                console.log('asking for', id)
                askFor.push(id)
            }
            render(a, id, ...renderArgs)
        }
    }

    if (window.lcxAsk) return exit(); // redundancy, race conditions
    window.lcxAsk = setInterval(async () => {
        console.log('ask')
        if (askFor.length === 0) return;
        console.log(`reqesting ${askFor.length} nextEp`, askFor)

        const url = new URL('https://livechart.yuji.app/get/nextEp')
        url.searchParams.set('service', 'crunchyroll')
        askFor.forEach(s => url.searchParams.append('series', s))

        const res = await new Promise(r => chrome.runtime.sendMessage({ action: 'getUrl', url: url.toString() }, r))
        if (res.httpStatus === 429) return ask = [];
        else if (res.httpStatus >= 500) return;

        askFor.forEach(id => {
            var data
            if (res.httpStatus === undefined) data = res.find(d => d.streams.crunchyroll === id)?.nextEpisode

            if (!data) data = { expires: Date.now() + 86400000 } //1d
            nextEpisode[id] = data
            setTimeout(() => render(list.querySelector(`a[href^="/series/${id}"]`), id), 50)
        })
        askFor = []
        const startCount = Object.keys(nextEpisode).length
        // cleanup
        Object.keys(nextEpisode)
            .filter(k => nextEpisode[k].expires < Date.now())
            .slice(settings.expiredCacheSize)
            .forEach(k => delete nextEpisode[k])
        console.log(`[countdowns] ${startCount} -> ${Object.keys(nextEpisode).length}`)
        chrome.storage.local.set({ nextEpisode })
    }, 5000);

    const visFn = () => {
        if (document.hidden) for (const id in updateInts) removeInt(id)
        else check(undefined, true)
    }
    document.addEventListener('visibilitychange', visFn)

    /**@param {Element} anime*/
    async function render(anime, id = anime.href.match(/\/series\/(\w+)\//)[1], force = false) {
        if (!anime?.isConnected) return console.log('disconnected', anime);
        const old = anime.parentElement.querySelector('.lcx-countdown')
        const div = old || document.createElement('div')
        const txt = div.querySelector('h5') || document.createElement('h5')
        div.classList = 'lcx-countdown'
        if (!div.querySelector('h5')) div.appendChild(txt)

        if (
            nextEpisode[id]?.airdate !== undefined
            && (
                force
                || Number(old?.dataset.ts) !== nextEpisode[id].airdate // if airdate is new
            )
        ) {
            div.dataset.ts = nextEpisode[id].airdate

            const dif = Math.abs(nextEpisode[id].airdate - Date.now())
            var { text: time, keys } = parseTime(dif)
            var rateKey = keys.slice(-1)[0]

            const updateRate = () => {
                console.log(id, rateKey)
                if (rateKey === 'minute') return 60000
                else if (rateKey === 'second') return 1000
                else return 3600000
            }

            const renderCountdown = (time) => {
                if (!anime.isConnected) removeInt(id)
                console.log('updated', id)
                if (!time) time = parseTime(Math.abs(nextEpisode[id].airdate - Date.now()))
                if (nextEpisode[id].airdate < Date.now()) {
                    if (time.text) time.text += ' ago'
                    else time += ' ago'
                }

                if (time.keys && rateKey !== time.keys.slice(-1)[0]) {
                    console.log(`${id} new updateRate ${rateKey} -> ${time.keys.slice(-1)[0]}`)
                    rateKey = time.keys.slice(-1)[0]
                    clearInterval(updateInts[id])
                    updateInts[id] = setInterval(renderCountdown, updateRate());
                }
                txt.innerText = `${nextEpisode[id].code}: ${time.text || time}`
            }

            const rate = updateRate()
            const nextUpdate = rate - (Date.now() % rate)

            renderCountdown(time)
            if (updateInts[id] !== undefined) removeInt(id)
            setTimeout(() => {
                renderCountdown()
                updateInts[id] = setInterval(renderCountdown, rate);
            }, nextUpdate);
        }


        if (!askFor.includes(id)) div.querySelector('.lcx-loading')?.remove()
        else if (!div.querySelector('.lcx-loading')) {
            const loading = document.createElement('div')
            loading.classList = 'lcx-loading'
            div.append(loading)
        }

        if (nextEpisode[id]?.expires) old?.remove()
        else anime.parentElement.insertBefore(div, anime.parentElement.lastChild)
    }


    function parseTime(ms, maxKeys = settings.countdownKeys) {
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

        const shortFormat = settings.countdownFormat === 'short'
        for (const key of keys) {
            if (ints[key] === 0 && key !== 'second') continue;
            const format = shortFormat ? key[0] : ` ${key[0].toUpperCase() + key.slice(1)}${ints[key] > 1 ? 's' : ''}`
            text.push(`${ints[key]}${format}`)
        }
        return { text: text.join(' '), keys }
    }
    function exit() {
        console.log('exiting')
        askFor = []
        clearInterval(window.lcxAsk)
        delete window.lcxAsk
        delete window.lcxHandler
        document.removeEventListener('visibilitychange', visFn)
        for (const id in updateInts) removeInt(id)
        for (const observer of observerList) observer.disconnect()
    }
    /**
     * @param {Parameters<MutationObserver['observe']>[0]} target
     * @param {MutationCallback} fn
     * @param {Parameters<MutationObserver['observe']>[1]} options
    */
    function observe(target, fn, options) {
        const observer = new MutationObserver(fn)
        observer.observe(target, options)
        observerList.push(observer)
        return observer
    }
}