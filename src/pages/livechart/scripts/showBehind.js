export default (settings, behindIcon, config) => {
    const parent = document.querySelector(config.selector.library.behindParent)
    const button = document.getElementById('lcx-btn-behind') || document.createElement('button')
    button.id = 'lcx-btn-behind'
    button.classList = 'btn btn-sm'
    button.innerText = 'Behind'
    button.title = 'Show airing anime that you\'re behind on'
    parent.appendChild(button)
    button.dataset.toggled = false

    var animes = document.querySelectorAll(config.selector.library.anime)
    button.onclick = async ({ target }) => {
        for (const btn of document.querySelectorAll(`[id^="lcx-btn-"][data-toggled="true"]:not(#${button.id})`)) btn.click()


        if (target.dataset.toggled === 'true') {
            target.dataset.toggled = false
            for (const a of animes) a.style.display = ''
        }
        else {
            target.dataset.toggled = true
            for (var a of animes) isBehind(a) ? a.style.display = '' : a.style.display = 'none'
        }
    }
    for (const a of animes) behindHandler(a)


    document.addEventListener('modalSubmit', async ({ detail: { target } }) => {
        const anime = document.querySelector(`[data-user-library-anime-id="${target.dataset.libraryEditorAnimeId}"]`), updatedEp = document.getElementById('library_editor_episodesWatchedInput').value

        // wait for the episode progress to update
        do { await new Promise((r) => setTimeout(r, 100)) }
        while (anime.querySelector(config.selector.library.epProgress).innerText !== updatedEp)

        behindHandler(anime, true)
    })
    document.addEventListener('epIncrement', async ({ detail: { target } }) => {
        // go out 1 element until the element has an id
        var parent = target.parentElement
        while (!parent.dataset.userLibraryAnimeId && parent.tagName !== 'BODY') parent = parent.parentElement

        // wait for the original episode number to increase
        const observ = new MutationObserver(() => {
            behindHandler(parent, true)
            observ.disconnect()
        })
        observ.observe(parent.querySelector(config.selector.library.epProgress), { childList: true, attributes: true, subtree: true, characterData: true })
    })


    function isBehind(anime, force = false, watched) {
        if (!force && anime.dataset.behind) return Number(anime.dataset.behind)

        const countdownElement = anime.querySelector(config.selector.library.countdown)
        if (
            (settings.behindCountdown !== false && !countdownElement)
            || anime.querySelector(config.selector.library.format)?.innerText.match(/tba/i)
            || anime.querySelector(config.selector.library.countdownParent)?.innerText.match(/tbd/i)
        ) return anime.dataset.behind = 0

        if (watched === undefined) watched = anime.querySelector(config.selector.library.epProgress)?.innerText
        var nextEp = anime.querySelector(config.selector.library.nextEp)?.innerText.match(/EP(\d+)/i)?.[1]

        var dateTime = anime
        do dateTime = dateTime.querySelector(config.selector.library.dateTime)
        while (dateTime && dateTime?.children.length > 0)

        if (!nextEp) {
            nextEp = anime.dataset.userLibraryAnimeEpisodeCount
            var isReleased = true
        }
        else isReleased = dateTime === 'Released'
        const inFilter = settings.behindStatusFilter.includes(anime.dataset.libraryStatus)

        if (
            anime.querySelector(config.selector.library.hiatus)
            || nextEp === undefined
            // || !isReleased
            || dateTime?.dataset.controller === 'intl-time'
            || (settings.behindCountdown && !countdownElement)
            || !inFilter

        ) return anime.dataset.behind = 0 // not behind

        watched = Number(watched)
        nextEp = Number(nextEp.replace(/[^0-9]/g, ''))
        const epBehind = nextEp - watched

        if (
            (countdownElement && epBehind > 1)
            || (!countdownElement && settings.behindCountdown === false)
        ) return anime.dataset.behind = (countdownElement || dateTime) && !isReleased ? epBehind - 1 : epBehind

        return anime.dataset.behind = 0
    }
    function behindHandler(anime, force) {
        const behindCount = isBehind(anime, force)
        var wrapper = anime.querySelector('#lcx-behind')
        if (behindCount === 0) {
            wrapper?.remove()
            if (button.dataset.toggled === 'true') anime.style.display = 'none'
            return;
        }

        const layout = document.querySelector('[data-controller="anime-release-filter"] [name="layout"]').value

        if (!wrapper) {
            wrapper = document.createElement('div')
            wrapper.id = 'lcx-behind'
            anime.appendChild(wrapper)
        }
        wrapper.title = `${behindCount} Unwatched Episode${behindCount > 1 ? 's' : ''}`

        if (!wrapper.querySelector('img')) {
            const icon = document.createElement('img')
            icon.src = behindIcon
            wrapper.appendChild(icon)
        }

        if (settings.behindCount) {
            const old = wrapper.querySelector('div')
            const count = old || document.createElement('div')
            if (behindCount > 1) {
                count.innerHTML = `<span>${behindCount}</span>`
                if (!old) wrapper.appendChild(count)
            }
            else if (behindCount === 1) old?.remove()
        }


        if (layout === 'compact') {
            var offset = 80
            if (!anime.querySelector('.leading-none.text-sm')) offset -= 38
            wrapper.style.top = offset + 'px'

            wrapper.style.right = '4.1px'
            wrapper.style.backgroundColor = 'var(--lcx-behind-bg)'
            wrapper.style.borderRadius = '8px'
            wrapper.style.border = '0.2rem solid var(--lcx-behind-bg)'
        }
        else {
            wrapper.style.right = '11px'
        }
    }
}