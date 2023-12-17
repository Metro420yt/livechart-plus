export default async (toggle = false, config) => {
    if (document.getElementById('lcx-toggleWatched')) return; // prevents multiple running at once

    const hideWatched = document.createElement('button')
    hideWatched.innerText = `${toggle ? 'Show' : 'Hide'} Watched`
    hideWatched.id = 'lcx-toggleWatched'
    hideWatched.dataset.toggled = toggle
    document.querySelector(config.selector.crunchyroll.hideWatchedParent).appendChild(hideWatched)

    // fades out buutton after timeout
    var int
    hideWatched.addEventListener('mouseleave', () => {
        hideWatched.style.opacity = 'var(--toggleWatched-opacity)'
        if (int) clearTimeout(int)
        int = setTimeout(() => hideWatched.style.opacity = '', 2000);
    })

    hideWatched.onclick = ({ target }) => {
        if (target.dataset.toggled === 'true') {
            target.dataset.toggled = false
            target.innerText = 'Hide Watched'

            handleWatched()
        }
        else {
            target.dataset.toggled = true
            target.innerText = 'Show Watched'

            handleWatched()
        }
    }



    var loaded = false, attempt = 0
    while (!loaded && ++attempt < 20) {
        if (document.querySelector(config.selector.crunchyroll.watched)) {//waits for one to have a watched icon, not good, but theres no reliable way to tell when playheads have fetched
            loaded = true
            continue;
        }
        await new Promise((resolve) => setTimeout(() => resolve(), 500))
    }
    if (loaded) handleWatched()


    function handleWatched() {
        const cards = Array.from(document.querySelectorAll(config.selector.crunchyroll.card))

        var watched = 0
        for (const card of cards) {
            if (!card.dataset.watched) card.dataset.watched = card.querySelector(config.selector.crunchyroll.watched) !== null

            if (card.querySelector(config.selector.crunchyroll.watched) !== null && hideWatched.dataset.toggled === 'true') {
                card.style.display = 'none'
                watched++
            }
            else card.style.display = ''
        }

        if (watched === cards.length) {
            const arr = config.crunchyroll.watchedAll
            epShowMsg(arr[Math.floor(Math.random() * arr.length)])
        }
        else epShowMsg()
    }

    function epShowMsg(msg = '') {
        if (!document.getElementById('lcx-epMsg')) {
            var epMsg = document.createElement('p')
            epMsg.id = 'lcx-epMsg'
            document.querySelector(config.selector.crunchyroll.episodeList).appendChild(epMsg)
        }
        else var epMsg = document.getElementById('lcx-epMsg')
        epMsg.innerText = msg
    }
}